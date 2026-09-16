// @ts-nocheck
import { z } from 'zod';
import { defineOperation } from './defineOperation.js';
import * as legacy from '../legacy/api/db.functions.server.js';
export const adminAiAutoQuote = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, leadId: z.number() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const pool = await legacy.getDbPool();
    const [leadRows] = await pool.query('SELECT * FROM lead_submissions WHERE id = ?', [
      data.leadId,
    ]);
    const lead = leadRows[0];
    if (!lead) throw new Error('Lead not found');
    const [pkgRows] = await pool.query(
      'SELECT id, name, destination AS location, price, category FROM packages WHERE is_active = 1',
    );
    const packages = pkgRows;
    if (!packages.length) throw new Error('No active packages available');
    let recommendedPackageId = packages[0].id;
    let discountPercent = 0;
    let customRunOfShow = [];
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
        const genAI = await legacy.getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // Step 1: Pick Package & Discount
        const matchPrompt = `You are an AI Events Matchmaker.
        Lead: Dest=${lead.location}, Budget=${lead.budget_range}, Theme=${lead.theme}, Notes=${lead.notes}.
        Packages: ${JSON.stringify(packages)}
        
        Task: Pick the best packageId. Suggest a discountPercent (0-15) if they seem highly price-sensitive.
        Respond ONLY with raw JSON: {"packageId": number, "discountPercent": number}`;
        const matchRes = await model.generateContent(matchPrompt);
        const matchText = matchRes.response
          .text()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const matchParsed = JSON.parse(matchText);
        if (matchParsed.packageId) recommendedPackageId = matchParsed.packageId;
        if (matchParsed.discountPercent) discountPercent = matchParsed.discountPercent;
        // Step 2: Fetch RunOfShow & Rewrite
        const [itinRows] = await pool.query(
          'SELECT day_number, title, description FROM package_itinerary WHERE package_id = ? ORDER BY day_number',
          [recommendedPackageId],
        );
        const runOfShow = itinRows;
        if (runOfShow.length > 0) {
          const rewritePrompt = `You are a luxury events copywriter.
          The lead wants a event with Theme: "${lead.theme}" and notes: "${lead.notes}".
          Rewrite the following event run-of-show to emphasize the lead's event goals. Keep the confirmed venues, suppliers, and activities unchanged; tailor only the descriptions and presentation.
          
          Original RunOfShow:
          ${JSON.stringify(runOfShow)}
          
          Respond ONLY with raw JSON array in this exact format:
          [{"day_number": number, "title": "string", "description": "string"}]`;
          const rewriteRes = await model.generateContent(rewritePrompt);
          const rewriteText = rewriteRes.response
            .text()
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          customRunOfShow = JSON.parse(rewriteText);
        }
      } catch (e) {
        console.error('AI Auto-Quote failed:', e);
      }
    }
    // Fallback if AI fails or runOfShow rewriting failed
    if (!customRunOfShow.length) {
      const [itinRows] = await pool.query(
        'SELECT day_number, title, description FROM package_itinerary WHERE package_id = ? ORDER BY day_number',
        [recommendedPackageId],
      );
      customRunOfShow = itinRows;
    }
    return {
      packageId: recommendedPackageId,
      discountPercent,
      customRunOfShow,
    };
  });
export const adminAiAnalyticsChat = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, query: z.string() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    let answer = 'I am unable to process data at this time.';
    if (process.env.GEMINI_API_KEY) {
      try {
        const pool = await legacy.getDbPool();
        // Fetch massive context for the AI
        const [leadsRows] = await pool.query(
          'SELECT COUNT(*) as count, status FROM lead_submissions GROUP BY status',
        );
        const [bookingsRows] = await pool.query(
          "SELECT SUM(amount) as rev, SUM(amount * 0.2) as margin, COUNT(*) as count FROM bookings WHERE status = 'confirmed'",
        );
        const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
        const genAI = await legacy.getGenAI();
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `You are a Chief Financial & Data Officer for MooNs Events Agency.
        The executive asked: "${data.query}"
        
        Here is the raw database summary right now:
        Leads by Status: ${JSON.stringify(leadsRows)}
        Confirmed Bookings Data: ${JSON.stringify(bookingsRows)}
        
        Give a concise, highly analytical, and insightful answer. No fluff. Use Markdown.
        If the question is about specific historical days (like "last Tuesday"), just make a highly plausible analytical assumption since you only have current aggregates. Keep it extremely professional.`;
        const res = await model.generateContent(prompt);
        answer = res.response.text();
      } catch (e) {
        console.error('Analytics Chat failed:', e);
        answer = 'Error analyzing data: ' + e.message;
      }
    }
    return { answer };
  });
export const adminAiOcrParsePdf = defineOperation({ method: 'POST' })
  .validator(
    z.object({ auth: legacy.adminAuthSchema, base64Data: z.string(), mimeType: z.string() }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an AI data extractor for a events agency.
    Extract the following from this vendor booking confirmation document:
    1. vendorName
    2. bookingReference (the PNR or confirmation number)
    3. status (either 'confirmed', 'cancelled', 'pending')
    4. totalAmount (numeric value)
    
    Respond ONLY with raw JSON: {"vendorName": "...", "bookingReference": "...", "status": "...", "totalAmount": 123}`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: data.base64Data, mimeType: data.mimeType } },
    ]);
    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiGenerateAudienceRule = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, prompt: z.string() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const systemPrompt = `You are a CRM Database Expert.
    Convert the marketer's natural language request into a simple pseudo-SQL WHERE clause rule string for our system.
    Available fields: location, budget, theme, status, created_at, event_date
    Example Request: "Find corporate conference leads planning events in Hyderabad"
    Example Output: theme = 'Corporate Conference' AND location = 'Hyderabad'
    
    Request: "${data.prompt}"
    
    Respond ONLY with the rule string, nothing else. No quotes, no markdown.`;
    const res = await model.generateContent(systemPrompt);
    return res.response.text().trim();
  });
const visualImageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const visualImageMaxBytes = 10 * 1024 * 1024;
const visualImageMaxBase64Characters = Math.ceil(visualImageMaxBytes / 3) * 4;
function hasVisualImageSignature(bytes, mimeType) {
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return (
      bytes.length >= 8 &&
      bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (mimeType === 'image/webp') {
    return (
      bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return (
    bytes.length >= 12 &&
    bytes.subarray(4, 8).toString('ascii') === 'ftyp' &&
    ['avif', 'avis'].includes(bytes.subarray(8, 12).toString('ascii'))
  );
}
export const adminAiVisualScrapbook = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      base64Data: z.string().min(1).max(visualImageMaxBase64Characters),
      mimeType: z.enum(visualImageMimeTypes),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data.base64Data) || data.base64Data.length % 4 !== 0) {
      throw new Error('Invalid image encoding');
    }
    const imageBytes = Buffer.from(data.base64Data, 'base64');
    if (imageBytes.length < 1 || imageBytes.length > visualImageMaxBytes) {
      throw new Error('Image must be between 1 byte and 10 MiB');
    }
    if (!hasVisualImageSignature(imageBytes, data.mimeType)) {
      throw new Error('Image content does not match its declared type');
    }
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert events designer.
    Analyze this reference image (e.g. from Instagram, Pinterest).
    1. Identify the likely regional location, event style, and key activities.
    2. Write a highly engaging, luxurious 3-day sample runOfShow that matches the exact vibe of this photo.
    
    Respond in JSON format ONLY:
    {
      "location": "...",
      "vibe": "...",
      "runOfShow": [
        { "day": 1, "title": "...", "description": "..." },
        { "day": 2, "title": "...", "description": "..." },
        { "day": 3, "title": "...", "description": "..." }
      ]
    }`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: data.base64Data, mimeType: data.mimeType } },
    ]);
    const text = result.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiGenerateBanner = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, theme: z.string(), tone: z.string() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `You are an expert events marketer.
    Generate creative copy for a WhatsApp promotional banner.
    Theme/Location: ${data.theme}
    Tone: ${data.tone}
    
    Respond in JSON format ONLY:
    {
      "headline": "...",
      "subheadline": "...",
      "callToAction": "..."
    }`;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiReconcileEscrow = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, ledgerData: z.string() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a financial controller AI.
    Analyze the following escrow ledger records.
    Find any anomalies (e.g. held amounts that have been sitting for too long, missing milestones).
    
    Ledger Data:
    ${data.ledgerData}
    
    Respond in JSON format ONLY:
    {
      "anomaliesFound": number,
      "summary": "...",
      "recommendations": ["..."]
    }`;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiGenerateRunOfShow = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      location: z.string(),
      days: z.number(),
      category: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a senior event producer creating an operational run of show.
    Location: ${data.location}
    Event duration: ${data.days} day(s)
    Package tier: ${data.category}
    
    Output exactly ${data.days} lines in this exact raw format, pipe separated. Do not include markdown code blocks or any other text.
    Format:
    [Day Number] | [Event Day Title] | [Responsibilities and Deliverables] | [Venue or Event Area] | [Setup and Load-in] | [Live Programme] | [Close-out]
    
    Example:
    1 | Event Setup and Guest Experience | Supplier coordination, approvals, guest flow and show calling | Grand Ballroom | Stage, decor, catering and AV checks | Guest entry, ceremony, performances and dinner | Guest departure, breakdown and venue handover
    2 | Main Programme | Registration, production cues, hospitality and speaker management | Convention Hall | Registration and technical rehearsal | Keynotes, sessions and networking | Delegate departure and supplier sign-off`;
    const res = await model.generateContent(prompt);
    let text = res.response.text().trim();
    text = text
      .replace(/```.*\n/gi, '')
      .replace(/```/g, '')
      .trim();
    return text;
  });
export const adminAiGenerateSEO = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      location: z.string(),
      name: z.string(),
      description: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `You are an SEO expert for a events agency.
    Create high-converting SEO metadata for this showcase package.
    Name: ${data.name}
    Location: ${data.location}
    Description: ${data.description}
    
    Respond in JSON format ONLY:
    {
      "meta_title": "Max 60 chars. Catchy.",
      "meta_description": "Max 160 chars. Action-oriented.",
      "meta_keywords": "comma, separated, list, of, keywords"
    }`;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiGenerateEmail = defineOperation({ method: 'POST' })
  .validator(
    z.object({ auth: legacy.adminAuthSchema, venueName: z.string(), location: z.string() }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Write a highly professional B2B email to the reservations team at ${data.venueName} in ${data.location}.
    The email is from MooNs Events Agency requesting their best FIT (Free Independent Client) and Group net rates for the upcoming season, as well as an updated fact sheet and images.
    Keep it concise, polite, and action-oriented. Do not include placeholders for my name, just sign off as "Contracting Team, MooNs Events".
    No markdown formatting, just plain text.`;
    const res = await model.generateContent(prompt);
    return res.response.text().trim();
  });
export const adminAiAnalyzeTrends = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    // 1. Fetch active packages
    const pool = await legacy.getDbPool();
    const [pkgRows] = await pool.query(
      'SELECT id, name, destination AS location, country, price, category FROM packages WHERE is_active = 1',
    );
    const packages = pkgRows;
    // 2. Call Gemini with retry logic for rate limits
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const prompt = `You are an expert events market researcher and marketer for MooNs Events Agency.
    Analyze current and upcoming demand from Indian clients for weddings, corporate events, conferences, exhibitions, concerts, private celebrations, and cultural events.
    Based on that demand, select the top 3-4 event markets that match our CURRENT ACTIVE PACKAGE INVENTORY.
    
    Our Current Active Packages:
    ${JSON.stringify(packages)}
    
    Respond ONLY in raw JSON matching this schema:
    {
      "trends": [
        {
          "location": "string (e.g. Hyderabad)",
          "search_trend_keyword": "string (e.g. premium corporate conference production Hyderabad)",
          "why_its_trending": "string (short description of the event demand driving this market)",
          "recommended_package_id": number (must be an ID from our inventory that matches this location),
          "recommended_package_name": "string",
          "marketing_angle": "string (how to sell this package based on the trend)"
        }
      ]
    }
    `;
    let text = '';
    let attempt = 0;
    while (attempt < 5) {
      try {
        const genAI = await legacy.getGenAI();
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });
        const res = await model.generateContent(prompt);
        text = res.response
          .text()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        break;
      } catch (e) {
        if (e.status === 429) {
          console.warn('[adminAiAnalyzeTrends] 429 Rate limited. Rotating key and retrying...');
          legacy.rotateGenAIKey();
          attempt++;
          if (attempt >= 5) throw new Error('All API keys are currently rate limited.');
        } else {
          throw e;
        }
      }
    }
    return JSON.parse(text);
  });
export const adminAiAnalyzeLeadPriority = defineOperation({ method: 'POST' })
  .validator(
    z.object({ auth: legacy.adminAuthSchema, leadName: z.string(), inquiryMessage: z.string() }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `You are an expert events sales manager. Analyze this incoming lead inquiry.
    Lead Name: ${data.leadName}
    Message: ${data.inquiryMessage}
    
    Respond ONLY in raw JSON matching this schema:
    {
      "urgency_score": "string (ðŸ”¥ Hot, ðŸŒ¤ Warm, â„ï¸ Cold)",
      "missing_info": "string (what should the agent ask next?)",
      "draft_reply": "string (a highly converting, professional but friendly 3-sentence draft reply addressing their request)"
    }
    `;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiCoachDeal = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      dealTitle: z.string(),
      customerName: z.string(),
      dealValue: z.number(),
      pipelineStage: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `You are an elite B2B and B2C events sales coach.
    Deal Title: ${data.dealTitle}
    Customer: ${data.customerName}
    Value: â‚¹${data.dealValue}
    Current Stage: ${data.pipelineStage}
    
    Provide coaching for this specific deal.
    Respond ONLY in raw JSON matching this schema:
    {
      "win_probability": "string (e.g. 75%)",
      "next_best_action": "string (a highly specific psychological sales tactic to move it forward)",
      "upsell_opportunity": "string (what add-on should we pitch to increase the deal value?)"
    }
    `;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiGenerateFollowupScript = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      customerName: z.string(),
      followupType: z.string(),
      notes: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    const prompt = `You are an elite events sales agent writing a follow-up script.
    Customer: ${data.customerName}
    Follow-up Type (channel): ${data.followupType}
    Context/Notes for this follow-up: ${data.notes}
    
    Write the exact script/message the agent should use. If the type is 'call', write a literal 3-line phone script. If it's 'whatsapp' or 'email', write a punchy, converting message.
    DO NOT include markdown, just plain text ready to copy-paste. Keep it short and highly actionable.`;
    const res = await model.generateContent(prompt);
    return res.response.text().trim();
  });
export const adminAiGenerateAutomation = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, prompt: z.string() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const aiPrompt = `You are an expert Marketing Automation Architect. 
    A user wants to create a CRM automation workflow. Here is their plain english request:
    "${data.prompt}"
    
    Parse this request and generate the automation payload. 
    Respond ONLY in raw JSON matching this schema:
    {
      "name": "string (A catchy name for this workflow, e.g., 'Lead Welcome Sequence')",
      "triggerEvent": "string (Guess the trigger, e.g., 'lead.created', 'booking.confirmed', 'quote.sent')",
      "steps": "number (How many total steps are in this workflow, including delays?)",
      "workflowJson": "string (A JSON stringified array representing the steps, e.g. '[{\"order\":1,\"type\":\"delay\",\"value\":\"1 day\"},{\"order\":2,\"type\":\"email\",\"template\":\"welcome\"},{\"order\":3,\"type\":\"task\",\"assignee\":\"sales\"}]')"
    }
    `;
    const res = await model.generateContent(aiPrompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiSearchCars = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      pickup: z.string(),
      dropoff: z.string(),
      date: z.string(),
      vehicleClass: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `Simulate a Global Distribution System (GDS) for car rentals.
    Find 3 car rental options from ${data.pickup} to ${data.dropoff} for date: ${data.date}. Preferred class: ${data.vehicleClass}.
    Provide realistic estimated total prices in INR.
    Respond ONLY in raw JSON matching this schema:
    [{
      "supplier": "string (e.g. Avis, Hertz, Europcar)",
      "vehicle": "string (e.g. Toyota Camry, Ford Mustang)",
      "seats": "number",
      "transmission": "string",
      "price_inr": "number"
    }]`;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiDraftRfq = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      companyName: z.string(),
      services: z.array(z.string()),
      coverage: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const prompt = `Write a concise B2B event-services RFQ to ${data.companyName}. Services: ${data.services.join(', ')}. Coverage: ${data.coverage}. Request availability, itemised net pricing, taxes, payment milestones and cancellation terms. Sign as Maya, Procurement Manager, MooNs Events.`;
    const result = await legacy.withMayaGeminiRotation('gemini-2.5-flash', (model) =>
      model.generateContent(prompt),
    );
    return result.response.text().trim();
  });
export const adminAiBuildPackage = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema, location: z.string(), days: z.number() }))
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API Key missing');
    const genAI = await legacy.getGenAI();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `Act as a master events agent. Build a ${data.days}-day event package for ${data.location}, using approved Master Catalog event vendors only. Respond as raw JSON with title, overview, estimated_base_cost_inr and runOfShow.`;
    const res = await model.generateContent(prompt);
    const text = res.response
      .text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(text);
  });
export const adminAiComposeRfq = defineOperation({ method: 'POST' })
  .validator((data) => data)
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    const pool = await legacy.getDbPool();
    // 1. Fetch package basics
    const [pkgRows] = await pool.query('SELECT * FROM packages WHERE id = ?', [data.packageId]);
    if (!pkgRows || pkgRows.length === 0) throw new Error('Package not found');
    const pkg = pkgRows[0];
    // 2. Fetch line items (stays, transport, activities)
    const [linesRows] = await pool.query(
      'SELECT * FROM package_line_items WHERE package_id = ? ORDER BY day_number ASC',
      [data.packageId],
    );
    const lines = linesRows;
    // 3. Fetch full runOfShow
    const [itinRows] = await pool.query(
      'SELECT day_number, title, description, city FROM package_itinerary WHERE package_id = ? ORDER BY day_number ASC',
      [data.packageId],
    );
    const runOfShow = itinRows;
    // 4. Fetch inclusions & exclusions
    const [inclRows] = await pool.query(
      'SELECT category, item FROM package_inclusions WHERE package_id = ? ORDER BY category, id',
      [data.packageId],
    );
    const inclusions = inclRows;
    const [exclRows] = await pool.query(
      'SELECT item FROM package_exclusions WHERE package_id = ? ORDER BY id',
      [data.packageId],
    );
    const exclusions = exclRows;
    // 5. Build comprehensive context
    let contextStr = `ðŸ“‹ PACKAGE OVERVIEW\n`;
    contextStr += `â€¢ Package Name: ${pkg.name}\n`;
    contextStr += `â€¢ Location: ${pkg.destination}, ${pkg.country}\n`;
    contextStr += `â€¢ Duration: ${pkg.days} Days / ${pkg.nights} Nights\n`;
    if (data.eventDates) contextStr += `â€¢ Events Dates: ${data.eventDates}\n`;
    contextStr += `â€¢ Category: ${pkg.category || 'General'}\n`;
    if (pkg.description) contextStr += `â€¢ Description: ${pkg.description}\n`;
    contextStr += `\n`;
    // Day-by-day runOfShow (always include for full context)
    if (runOfShow.length > 0) {
      contextStr += `ðŸ“… DAY-BY-DAY RUN_OF_SHOW\n`;
      runOfShow.forEach((day) => {
        contextStr += `Day ${day.day_number}${day.city ? ` â€” ${day.city}` : ''}: ${day.title}\n`;
        if (day.description) contextStr += `  ${day.description}\n`;
      });
      contextStr += `\n`;
    }
    // Accommodation (scope: full or venues)
    if (data.scope.includes('full') || data.scope.includes('venues')) {
      if (data.customVenues && data.customVenues.length > 0) {
        contextStr += 'ðŸ¨ ACCOMMODATION REQUIRED\n';
        data.customVenues.forEach((h) => {
          contextStr += `â€¢ ${h}\n`;
        });
        contextStr += '\n';
      } else {
        const venues = lines.filter((l) => l.catalog_type === 'stay' || l.catalog_type === 'room');
        if (venues.length > 0) {
          contextStr += 'ðŸ¨ ACCOMMODATION REQUIRED\n';
          venues.forEach((h) => {
            contextStr += `â€¢ ${h.item_name} (Night ${h.day_number})`;
            if (h.quantity && h.quantity > 1) contextStr += ` Ã— ${h.quantity}`;
            if (h.unit_type) contextStr += ` [${h.unit_type.replace(/_/g, ' ')}]`;
            if (h.notes) contextStr += ` â€” ${h.notes}`;
            contextStr += `\n`;
          });
          contextStr += '\n';
        } else if (runOfShow.length > 0) {
          // Infer accommodation needs from runOfShow cities
          contextStr += 'ðŸ¨ ACCOMMODATION REQUIRED\n';
          const cities = [...new Set(runOfShow.filter((d) => d.city).map((d) => d.city))];
          contextStr += `â€¢ Event venues needed in: ${cities.join(', ')}\n`;
          contextStr += `â€¢ Please provide capacity, layouts, availability, production access, catering policy, and net rates\n\n`;
        }
      }
    }
    // Transport (scope: full or transport)
    if (data.scope.includes('full') || data.scope.includes('transport')) {
      const transport = lines.filter((l) => l.catalog_type === 'car');
      if (transport.length > 0) {
        contextStr += 'ðŸš— TRANSPORT REQUIRED\n';
        transport.forEach((t) => {
          contextStr += `â€¢ Day ${t.day_number}: ${t.item_name}`;
          if (t.quantity && t.quantity > 1) contextStr += ` Ã— ${t.quantity}`;
          if (t.unit_type) contextStr += ` [${t.unit_type.replace(/_/g, ' ')}]`;
          if (t.notes) contextStr += ` â€” ${t.notes}`;
          contextStr += `\n`;
        });
        contextStr += '\n';
      } else if (runOfShow.length > 0) {
        // Infer transport needs from runOfShow city changes
        contextStr += 'ðŸš— TRANSPORT REQUIRED\n';
        contextStr += `â€¢ EventSite pickup/drop-off transfers\n`;
        const cityChanges = [];
        for (let i = 1; i < runOfShow.length; i++) {
          if (
            runOfShow[i].city &&
            runOfShow[i - 1].city &&
            runOfShow[i].city !== runOfShow[i - 1].city
          ) {
            cityChanges.push(
              `Day ${runOfShow[i].day_number}: ${runOfShow[i - 1].city} â†’ ${runOfShow[i].city}`,
            );
          }
        }
        cityChanges.forEach((c) => {
          contextStr += `â€¢ ${c}\n`;
        });
        if (cityChanges.length === 0)
          contextStr += `â€¢ Local guest, crew, and equipment movement for ${pkg.days} days\n`;
        contextStr += `â€¢ Please provide vehicle types, capacity, operating windows, and per-day/transfer rates\n\n`;
      }
    }
    // Activities (scope: full only)
    if (data.scope.includes('full')) {
      const activities = lines.filter((l) => l.catalog_type === 'activity');
      if (activities.length > 0) {
        contextStr += 'ðŸŽ¯ ACTIVITIES & EXPERIENCES\n';
        activities.forEach((a) => {
          contextStr += `â€¢ Day ${a.day_number}: ${a.item_name}`;
          if (a.quantity && a.quantity > 1) contextStr += ` Ã— ${a.quantity}`;
          if (a.notes) contextStr += ` â€” ${a.notes}`;
          contextStr += `\n`;
        });
        contextStr += '\n';
      }
    }
    // Inclusions
    if (inclusions.length > 0) {
      contextStr += 'âœ… CURRENTLY INCLUDED IN PACKAGE\n';
      const byCategory = {};
      inclusions.forEach((inc) => {
        const cat = inc.category || 'General';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(inc.item);
      });
      Object.entries(byCategory).forEach(([cat, items]) => {
        contextStr += `â€¢ ${cat}: ${items.join(', ')}\n`;
      });
      contextStr += '\n';
    }
    // Exclusions
    if (exclusions.length > 0) {
      contextStr += 'âŒ NOT INCLUDED IN PACKAGE\n';
      exclusions.forEach((exc) => {
        contextStr += `â€¢ ${exc.item}\n`;
      });
      contextStr += '\n';
    }
    const scopeParts = [];
    if (data.scope.includes('full'))
      scopeParts.push(
        'Cover the full package including runOfShow, activities, and any other services. Ask for net B2B rates for each component.',
      );
    if (data.scope.includes('venues'))
      scopeParts.push(
        'Include detailed event-venue requirements. Ask for capacity by layout, available halls and breakout rooms, production access, rigging and power limits, furniture, catering policy, parking, operating hours, permits, net rates, taxes, and blackout dates.',
      );
    if (data.scope.includes('photography'))
      scopeParts.push(
        'Include photography and film coverage, crew, hours, deliverables, edit timelines, drone permissions and usage rights.',
      );
    if (data.scope.includes('decoration'))
      scopeParts.push(
        'Include theme, stage, floral, furniture, lighting, setup, strike and itemised decoration rates.',
      );
    if (data.scope.includes('catering'))
      scopeParts.push(
        'Include menus, guest count, dietary needs, tasting, service staff, equipment, taxes and per-plate rates.',
      );
    if (data.scope.includes('organizer'))
      scopeParts.push(
        'Include planning, vendor coordination, guest management, rehearsals and event-day staffing.',
      );
    if (data.scope.includes('production'))
      scopeParts.push(
        'Include stage, sound, lighting, LED, rigging, power, technical crew, setup, strike and itemised production rates.',
      );
    const scopeInstruction =
      scopeParts.length > 0
        ? scopeParts.join(' Also, ')
        : 'Cover every event component relevant to the vendor: venue, production, decor, catering, entertainment, staffing, logistics, and guest services. Ask for itemised net B2B rates.';
    const prompt = `You are Maya, Procurement Manager at MooNs, a leading B2B events company in India. You are a REAL HUMAN professional. NEVER identify yourself as an AI.

Write a professional B2B Request for Quote (RFQ) email to an event vendor or production partner. The email must be detailed enough that the vendor can clearly understand what we need and provide accurate pricing.

RULES:
- Do NOT include placeholders like [Vendor Name] or [Your Name]. Address generically as "Dear Partner" or "Dear Team".
- Include the full package details from the context below so the vendor knows exactly what to quote.
- Present the runOfShow and requirements in a clean, structured format.
- ${scopeInstruction}
- Keep the tone professional, warm, and partnership-oriented.
- Format as plain text with natural line breaks and emoji section headers. Do NOT use HTML tags.
- Sign off as: Maya, Procurement Manager, MooNs

PACKAGE CONTEXT:
${contextStr}`;
    const result = await legacy.withMayaGeminiRotation('gemini-2.5-flash', (model) =>
      model.generateContent(prompt),
    );
    if (!result) throw new Error('Failed to generate quote email. Please try again later.');
    let htmlBody = result.response.text().trim();
    if (htmlBody.startsWith('```html'))
      htmlBody = htmlBody.replace(/^```html\n/, '').replace(/\n```$/, '');
    if (htmlBody.startsWith('```')) htmlBody = htmlBody.replace(/^```\n/, '').replace(/\n```$/, '');
    const subject = `Request for Quote: ${pkg.name}`;
    return { subject, htmlBody };
  });
export const triggerAILeadWorkerManually = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    // Trigger asynchronously immediately
    legacy.processAutonomousAILeads().catch(console.error);
    return { success: true };
  });
export const adminUploadLeadAudio = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      leadId: z.number(),
      mimeType: z.enum([
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/webm',
        'audio/mp3',
        'video/webm',
      ]),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const crypto = await import('node:crypto');
    const bytes = legacy.decodeBase64Strict(data.base64);
    const maxBytes = 25 * 1024 * 1024; // 25MB max for audio
    if (bytes.byteLength > maxBytes) throw new Error('Audio must be 25 MB or smaller.');
    const ext = data.mimeType.split('/')[1].replace('mpeg', 'mp3');
    const storedFilename = `call_${data.leadId}_${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'calls');
    await fs.mkdir(uploadDir, { recursive: true });
    const absolutePath = path.join(uploadDir, storedFilename);
    await fs.writeFile(absolutePath, bytes, { flag: 'wx' });
    const publicUrl = `/uploads/calls/${storedFilename}`;
    const pool = await legacy.getDbPool();
    await pool.query('UPDATE lead_submissions SET call_recording_url = ? WHERE id = ?', [
      publicUrl,
      data.leadId,
    ]);
    return { success: true, publicUrl, absolutePath };
  });
export const triggerMayaAudioProcessing = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      leadId: z.number(),
      absolutePath: z.string(),
      mimeType: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    legacy.processMayaAudioLead(data.leadId, data.absolutePath, data.mimeType).catch(console.error);
    return { success: true };
  });
export const adminGetMayaStatus = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    await legacy.ensureMayaTables();
    const pool = await legacy.getDbPool();
    const settings = await legacy.getMayaSettings();
    const [activityRows] = await pool.query(
      'SELECT * FROM maya_activity_log ORDER BY id DESC LIMIT 50',
    );
    const [todayRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM maya_activity_log WHERE created_at >= CURDATE() AND status = 'done'",
    );
    const areas = {};
    for (const area of legacy.MAYA_AREAS) areas[area] = legacy.mayaAreaEnabled(settings, area);
    return {
      masterEnabled: settings['autopilot_master'] !== 'off',
      areas,
      lastRun: settings['maya_last_run'] || null,
      actionsToday: Number(todayRows[0]?.total || 0),
      activity: activityRows,
    };
  });
export const adminSetMayaAutopilot = defineOperation({ method: 'POST' })
  .validator(
    z.object({
      auth: legacy.adminAuthSchema,
      area: z.enum([
        'master',
        'leads',
        'followups',
        'clients',
        'escrow',
        'refunds',
        'careers',
        'payments',
      ]),
      enabled: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    await legacy.requireAdmin(data.auth);
    await legacy.ensureMayaTables();
    await legacy.setMayaSetting(`autopilot_${data.area}`, data.enabled ? 'on' : 'off');
    await legacy.logMayaActivity(
      'system',
      data.enabled ? 'area_enabled' : 'area_disabled',
      null,
      `Autopilot "${data.area}" switched ${data.enabled ? 'on' : 'off'} by ${data.auth.email}.`,
    );
    return { success: true };
  });
export const adminRunMayaAutopilotNow = defineOperation({ method: 'POST' })
  .validator(z.object({ auth: legacy.adminAuthSchema }))
  .handler(async ({ data }) => {
    await legacy.requireLeadStaff(data.auth);
    await legacy.runMayaAutopilotCycle();
    return { success: true };
  });
//# sourceMappingURL=aiOperations.js.map
