// @ts-nocheck
import { z } from 'zod';
import { defineOperation } from './defineOperation.js';
import * as legacy from '../legacy/api/db.functions.server.js';
import { prisma } from '../config/prisma.js';

export const adminSendQuoteEmail = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      leadId: z.number(),
      leadEmail: z.string().email(),
      leadName: z.string(),
      packageName: z.string(),
      finalPrice: z.number(),
      pdfBase64: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    const html = `<div style="font-family: sans-serif; max-width: 620px; margin: 0 auto; padding: 20px;">
      <h2>Hi ${data.leadName},</h2>
      <p>Thank you for planning your event with MooNs Events! Your personalised proposal for <strong>${data.packageName}</strong> is attached.</p>
      <p style="font-size:18px;">Total: <strong>â‚¹${Math.round(data.finalPrice).toLocaleString('en-IN')}</strong> (all taxes included)</p>
      <p>Reply to this email or ping us on WhatsApp with any tweaks â€” we'll adjust the runOfShow until it's perfect.</p>
      <br/><p>Warm regards,</p><p><strong>MooNs Events</strong></p>
    </div>`;
    const attachments = data.pdfBase64
      ? [
          {
            filename: `MooNs-Proposal-${data.packageName.replace(/[^a-z0-9]+/gi, '-')}.pdf`,
            content: data.pdfBase64,
            encoding: 'base64' as const,
          },
        ]
      : undefined;
    const sent = await legacy.sendEmailOutbound(
      data.leadEmail,
      `Your ${data.packageName} events proposal from MooNs`,
      html,
      attachments,
    );
    if (!sent) throw new Error('Email could not be sent â€” check SMTP settings.');
    const pool = await legacy.getDbPool();
    await pool.query(
      "UPDATE lead_submissions SET status = 'quote_sent', last_contacted_at = NOW() WHERE id = ? AND status IN ('new', 'contacted')",
      [data.leadId],
    );
    await legacy.ensureMayaTables();
    await legacy.logMayaActivity(
      'quotes',
      'quote_emailed',
      data.leadId,
      `Quote for "${data.packageName}" (â‚¹${Math.round(data.finalPrice).toLocaleString('en-IN')}) emailed to ${data.leadName}.`,
    );
    return { success: true };
  });

export const adminGetMissionControl = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    await legacy.ensureMayaTables();
    const pool = await legacy.getDbPool();

    const count = async (sql: string): Promise<number> => {
      try {
        const [rows] = await pool.query(sql);
        return Number((rows as any[])[0]?.total || 0);
      } catch {
        return 0;
      }
    };
    const rowsOf = async (sql: string): Promise<any[]> => {
      try {
        const [rows] = await pool.query(sql);
        return rows as any[];
      } catch {
        return [];
      }
    };

    const leadsByStatusRows = await rowsOf(
      'SELECT status, COUNT(*) AS total FROM lead_submissions GROUP BY status',
    );
    const leadsByStatus: Record<string, number> = {};
    for (const row of leadsByStatusRows) leadsByStatus[row.status] = Number(row.total);

    const dealRows = await rowsOf(
      'SELECT status, COUNT(*) AS total, COALESCE(SUM(value), 0) AS total_value FROM crm_deals GROUP BY status',
    );
    const deals = { open: 0, won: 0, lost: 0, openValue: 0, wonValue: 0 };
    for (const row of dealRows) {
      if (row.status === 'open') {
        deals.open = Number(row.total);
        deals.openValue = Number(row.total_value);
      }
      if (row.status === 'won') {
        deals.won = Number(row.total);
        deals.wonValue = Number(row.total_value);
      }
      if (row.status === 'lost') deals.lost = Number(row.total);
    }

    const [
      overdueFollowups,
      bookingsTotal,
      bookingsPending,
      pendingPaymentsCount,
      refundsOpen,
      escrowDue,
      careersPending,
      clientsTotal,
      clientsVip,
    ] = await Promise.all([
      count(
        "SELECT COUNT(*) AS total FROM lead_followups WHERE status = 'pending' AND follow_up_date < NOW()",
      ),
      count('SELECT COUNT(*) AS total FROM bookings'),
      count("SELECT COUNT(*) AS total FROM bookings WHERE status = 'pending'"),
      count("SELECT COUNT(*) AS total FROM payment_orders WHERE status = 'pending_verification'"),
      count(
        "SELECT COUNT(*) AS total FROM user_refunds WHERE status IN ('initiated', 'admin_review')",
      ),
      count(
        "SELECT COUNT(*) AS total FROM escrow_ledger el JOIN bookings b ON b.id = el.booking_id WHERE el.status = 'held' AND el.scheduled_release_date <= NOW() AND b.status = 'confirmed'",
      ),
      count("SELECT COUNT(*) AS total FROM careers_applications WHERE status = 'pending'"),
      count('SELECT COUNT(*) AS total FROM crm_clients'),
      count("SELECT COUNT(*) AS total FROM crm_clients WHERE status = 'VIP'"),
    ]);

    const revenueRow = await rowsOf(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM bookings WHERE status = 'confirmed'",
    );
    const grossRevenue = Number(revenueRow[0]?.total || 0);

    const escrowRows = await rowsOf(
      'SELECT status, COALESCE(SUM(amount), 0) AS total FROM escrow_ledger GROUP BY status',
    );
    const escrow = { held: 0, released: 0, refunded: 0 };
    for (const row of escrowRows) {
      if (row.status === 'held') escrow.held = Number(row.total);
      if (row.status === 'released') escrow.released = Number(row.total);
      if (row.status === 'refunded') escrow.refunded = Number(row.total);
    }

    const revenueTrend = await rowsOf(`
      SELECT DATE_FORMAT(created_at, '%b') AS month, DATE_FORMAT(created_at, '%Y-%m') AS ym, COALESCE(SUM(amount), 0) AS revenue, COUNT(*) AS bookings
      FROM bookings
      WHERE status = 'confirmed' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY ym, month ORDER BY ym ASC
    `);

    const attentionQueues = {
      followups: await rowsOf(`
        SELECT f.id, f.follow_up_date, f.follow_up_type, l.name AS lead_name, l.location
        FROM lead_followups f JOIN lead_submissions l ON l.id = f.lead_id
        WHERE f.status = 'pending' AND f.follow_up_date < NOW()
        ORDER BY f.follow_up_date ASC LIMIT 6
      `),
      payments: await rowsOf(`
        SELECT po.id, po.amount, po.utr_reference, po.created_at, u.name AS user_name
        FROM payment_orders po LEFT JOIN users u ON u.id = po.user_id
        WHERE po.status = 'pending_verification'
        ORDER BY po.created_at ASC LIMIT 6
      `),
      refunds: await rowsOf(`
        SELECT id, booking_reference, amount, status, created_at FROM user_refunds
        WHERE status IN ('initiated', 'admin_review')
        ORDER BY created_at ASC LIMIT 6
      `),
      newLeads: await rowsOf(`
        SELECT id, name, location, budget_range, created_at FROM lead_submissions
        WHERE status = 'new' ORDER BY created_at DESC LIMIT 6
      `),
    };

    const mayaActivity = await rowsOf('SELECT * FROM maya_activity_log ORDER BY id DESC LIMIT 12');
    const settings = await legacy.getMayaSettings();

    return {
      leadsByStatus,
      overdueFollowups,
      deals,
      bookings: { total: bookingsTotal, pending: bookingsPending, grossRevenue },
      pendingPaymentsCount,
      refundsOpen,
      escrow,
      escrowDue,
      careersPending,
      clients: { total: clientsTotal, vip: clientsVip },
      revenueTrend: revenueTrend.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
        bookings: Number(row.bookings),
      })),
      attentionQueues,
      mayaActivity: mayaActivity as legacy.MayaActivityRow[],
      maya: {
        masterEnabled: settings['autopilot_master'] !== 'off',
        lastRun: settings['maya_last_run'] || null,
      },
    };
  });

export const getAdminInvoices = defineOperation({ method: 'GET' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }): Promise<legacy.AdminInvoiceRow[]> => {
    await legacy.requireAdmin(data.auth);
    try {
      const invoices = await prisma.invoices.findMany({
        orderBy: { id: 'desc' },
        include: { users: true, bookings: true },
      });
      return invoices.map(({ users, bookings, ...invoice }) => ({
        ...invoice,
        customer_name: users.name,
        customer_email: users.email,
        customer_phone: users.phone,
        customer_address: users.address,
        customer_city: users.city,
        customer_state: users.state,
        customer_postal_code: users.postal_code,
        customer_country: users.country,
        booking_reference: bookings.booking_reference,
        item_name: bookings.item_name,
        item_type: bookings.item_type,
        event_date: bookings.travel_date,
      })) as unknown as legacy.AdminInvoiceRow[];
    } catch (err) {
      console.error('Failed to fetch admin invoices:', err);
      return [];
    }
  });

export const adminResendInvoice = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, invoiceId: z.number() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const invoice = await prisma.invoices.findUnique({
      where: { id: data.invoiceId },
      include: { users: true, bookings: true },
    });
    if (!invoice) throw new Error('Invoice not found');
    const latestPayment = await prisma.payment_orders.findFirst({
      where: { booking_id: invoice.booking_id },
      orderBy: { id: 'desc' },
    });
    const inv = {
      ...invoice,
      invoice_created_at: invoice.created_at,
      booking_reference: invoice.bookings.booking_reference,
      item_name: invoice.bookings.item_name,
      event_date: invoice.bookings.travel_date,
      customer_name: invoice.users.name,
      customer_email: invoice.users.email,
      clients_count: latestPayment?.clients_count || 1,
      utr_reference: latestPayment?.utr_reference || '',
    };

    const { sendBookingEmail, formatInr } = await legacy.importServerOnlyModule(
      '../legacy/booking-emails.server.js',
    );
    const sent = await sendBookingEmail('booking-invoice', inv.customer_email, {
      customer_name: inv.customer_name || 'client',
      reference: inv.booking_reference,
      item_name: inv.item_name,
      amount: formatInr(inv.amount),
      amount_raw: Number(inv.amount || 0),
      event_date: inv.event_date
        ? new Date(inv.event_date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '',
      clients: String(inv.clients_count || 1),
      utr: inv.utr_reference || '',
      invoice_number: inv.invoice_number,
      invoice_date: new Date(inv.invoice_created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customer_email: inv.customer_email || '',
    });
    if (!sent)
      throw new Error(
        'Email could not be sent â€” check SMTP settings or the customer email address.',
      );

    await prisma.invoices.update({ where: { id: data.invoiceId }, data: { status: 'sent' } });
    try {
      await prisma.maya_activity_log.create({
        data: {
          area: 'finance',
          action: 'invoice.resent',
          status: 'done',
          summary: `Re-sent tax invoice ${inv.invoice_number} to ${inv.customer_email}`,
        },
      });
    } catch {
      /* best-effort */
    }
    return { success: true };
  });

export const getItemReviewsLocal = defineOperation({ method: 'GET' })
  .inputValidator(z.object({ itemId: z.string() }))
  .handler(async ({ data }): Promise<any[]> => {
    const pool = await legacy.getDbPool();
    const [rows] = await pool.query(
      'SELECT author, rating, comment FROM item_reviews WHERE item_id = ? OR item_id = "GENERIC" ORDER BY id DESC LIMIT 5',
      [data.itemId],
    );
    return rows as any[];
  });

export const adminToggleVerification = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      tableName: z.enum([
        'packages',
        'vendors',
        'accommodation_listings',
        'car_listings',
      ]),
      id: z.number(),
      is_verified: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const pool = await legacy.getDbPool();
    await pool.query(`UPDATE \`${data.tableName}\` SET is_verified = ? WHERE id = ?`, [
      data.is_verified ? 1 : 0,
      data.id,
    ]);
    return { success: true };
  });
