import React from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { QuotePDFProps, money } from '../QuotePDFTemplate';

Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff',
      fontWeight: 600,
    },
  ],
});

const C = {
  aubergine: '#24151E',
  wine: '#6E1F3D',
  wineSoft: '#8F3A58',
  rose: '#C98A96',
  blush: '#F3E5E5',
  champagne: '#F8F2E8',
  champagneDeep: '#EDE1CF',
  gold: '#B68B3C',
  goldLight: '#DCC795',
  ivory: '#FFFDF9',
  white: '#FFFFFF',
  ink: '#2D252A',
  body: '#62575D',
  muted: '#91858A',
  line: '#DDCFC4',
  green: '#2E7057',
  greenSoft: '#E6F1EB',
};

const s = StyleSheet.create({
  page: { backgroundColor: C.champagne, fontFamily: 'Inter', color: C.ink },
  pageIvory: { backgroundColor: C.ivory, fontFamily: 'Inter', color: C.ink },
  pageDark: { backgroundColor: C.aubergine, fontFamily: 'Inter', color: C.white },
  content: { paddingHorizontal: 42, paddingTop: 38, paddingBottom: 58 },
  eyebrow: {
    color: C.gold,
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  pageTitle: { color: C.aubergine, fontSize: 27, fontWeight: 600, marginTop: 8 },
  pageIntro: { color: C.body, fontSize: 10, lineHeight: 1.6, marginTop: 10, maxWidth: 430 },
  goldRule: { width: 42, height: 2, backgroundColor: C.gold, marginTop: 16, marginBottom: 22 },
  footer: {
    position: 'absolute',
    left: 42,
    right: 42,
    bottom: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerDark: { borderTopColor: '#4B3541' },
  footerText: { color: C.muted, fontSize: 6.5, letterSpacing: 0.6 },
  footerTextDark: { color: '#A9959F' },
  footerPage: { color: C.gold, fontSize: 6.5, fontWeight: 600, letterSpacing: 1 },

  coverTop: { height: '69%', backgroundColor: C.aubergine, padding: 42, position: 'relative' },
  coverBottom: { height: '31%', backgroundColor: C.champagne, padding: 42, position: 'relative' },
  coverOrbLarge: {
    position: 'absolute',
    width: 245,
    height: 245,
    borderRadius: 123,
    right: -82,
    top: -58,
    borderWidth: 1,
    borderColor: '#5A3849',
  },
  coverOrbSmall: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderRadius: 63,
    right: -20,
    top: 4,
    backgroundColor: C.wine,
    opacity: 0.55,
  },
  coverCorner: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 48,
    height: 48,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: C.gold,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandMark: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: { color: C.aubergine, fontSize: 15, fontWeight: 600 },
  brandName: { color: C.white, fontSize: 17, fontWeight: 600, marginLeft: 10 },
  coverKicker: { color: C.goldLight, fontSize: 7, letterSpacing: 3, marginTop: 64 },
  coverTitle: {
    color: C.white,
    fontSize: 38,
    fontWeight: 600,
    lineHeight: 1.08,
    maxWidth: 430,
    marginTop: 12,
  },
  coverPackage: { color: C.rose, fontSize: 15, fontWeight: 600, marginTop: 18 },
  coverFor: { color: '#BDAEB5', fontSize: 8, letterSpacing: 1.5, marginTop: 35 },
  coverName: { color: C.white, fontSize: 17, fontWeight: 600, marginTop: 6 },
  coverMetaRow: { flexDirection: 'row', gap: 10 },
  coverMeta: { flex: 1, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 11 },
  coverMetaLabel: { color: C.muted, fontSize: 6.5, letterSpacing: 1.6 },
  coverMetaValue: { color: C.ink, fontSize: 11, fontWeight: 600, marginTop: 5 },
  coverRef: { color: C.gold, fontSize: 7, fontWeight: 600, marginTop: 18, letterSpacing: 1 },

  storyGrid: { flexDirection: 'row', gap: 14 },
  storyMain: { flex: 1.5 },
  storySide: { flex: 1 },
  visionCard: {
    backgroundColor: C.aubergine,
    padding: 22,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  quoteMark: { color: C.gold, fontSize: 31, lineHeight: 0.7 },
  visionText: { color: C.white, fontSize: 13, lineHeight: 1.55, marginTop: 14 },
  visionCaption: { color: C.rose, fontSize: 7, letterSpacing: 1.5, marginTop: 18 },
  detailCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 16 },
  detailRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE5DE' },
  detailLabel: { color: C.muted, fontSize: 6.5, letterSpacing: 1.5 },
  detailValue: { color: C.aubergine, fontSize: 11, fontWeight: 600, marginTop: 4 },
  sectionHeading: { color: C.aubergine, fontSize: 16, fontWeight: 600, marginBottom: 14 },
  timeline: { borderLeftWidth: 1, borderLeftColor: C.goldLight, marginLeft: 7, paddingLeft: 22 },
  timelineItem: { position: 'relative', marginBottom: 15, backgroundColor: C.white, padding: 14 },
  timelineDot: {
    position: 'absolute',
    left: -27,
    top: 17,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.wine,
    borderWidth: 2,
    borderColor: C.champagne,
  },
  dayLabel: { color: C.wine, fontSize: 6.5, fontWeight: 600, letterSpacing: 1.5 },
  dayTitle: { color: C.aubergine, fontSize: 12, fontWeight: 600, marginTop: 5 },
  dayDesc: { color: C.body, fontSize: 8.5, lineHeight: 1.5, marginTop: 5 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.blush,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 7,
  },
  activityName: { color: C.wine, fontSize: 7.5, fontWeight: 600 },
  activityPrice: { color: C.wine, fontSize: 7.5, fontWeight: 600 },

  twoColumn: { flexDirection: 'row', gap: 16 },
  column: { flex: 1 },
  serviceCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    marginBottom: 10,
  },
  serviceCategory: { color: C.gold, fontSize: 6.5, fontWeight: 600, letterSpacing: 1.3 },
  serviceItem: { color: C.ink, fontSize: 9, lineHeight: 1.45, marginTop: 6 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  listDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.wine, marginTop: 4, marginRight: 8 },
  listText: { flex: 1, color: C.body, fontSize: 8.5, lineHeight: 1.45 },
  exclusionBox: { backgroundColor: C.blush, padding: 15, marginTop: 8 },
  logisticsCard: { backgroundColor: C.aubergine, padding: 14, marginBottom: 8 },
  logisticsLabel: { color: C.goldLight, fontSize: 6.5, letterSpacing: 1.3 },
  logisticsTitle: { color: C.white, fontSize: 10, fontWeight: 600, marginTop: 5 },
  logisticsMeta: { color: '#C8B8C0', fontSize: 8, marginTop: 4 },

  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceRef: { color: '#BFAFB7', fontSize: 7, letterSpacing: 1 },
  priceCard: { backgroundColor: '#31202A', borderWidth: 1, borderColor: '#4D3541', padding: 20 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#4B3541',
  },
  priceName: { color: C.white, fontSize: 10, fontWeight: 600 },
  priceDesc: { color: '#A9959F', fontSize: 7.5, marginTop: 4 },
  priceValue: { color: C.goldLight, fontSize: 11, fontWeight: 600 },
  priceValueDiscount: { color: '#E9A5B7', fontSize: 11, fontWeight: 600 },
  totalCard: { backgroundColor: C.gold, padding: 23, marginTop: 16 },
  totalLabel: { color: C.aubergine, fontSize: 7, fontWeight: 600, letterSpacing: 2 },
  totalValue: { color: C.aubergine, fontSize: 30, fontWeight: 600, marginTop: 7 },
  totalNote: { color: '#4D3714', fontSize: 7.5, lineHeight: 1.4, marginTop: 6 },
  paymentStrip: { flexDirection: 'row', marginTop: 18, gap: 9 },
  paymentStep: { flex: 1, borderTopWidth: 1, borderTopColor: '#5A414D', paddingTop: 10 },
  paymentNum: { color: C.gold, fontSize: 7, fontWeight: 600 },
  paymentText: { color: '#C9BBC1', fontSize: 7.5, lineHeight: 1.4, marginTop: 4 },

  termsCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line, padding: 18 },
  termRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  termNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  termNumText: { color: C.wine, fontSize: 7, fontWeight: 600 },
  termText: { flex: 1, color: C.body, fontSize: 8.5, lineHeight: 1.5 },
  acceptance: { backgroundColor: C.aubergine, padding: 22, marginTop: 16 },
  acceptanceTitle: { color: C.white, fontSize: 17, fontWeight: 600 },
  acceptanceText: { color: '#C8BAC1', fontSize: 8.5, lineHeight: 1.5, marginTop: 8 },
  signatureRow: { flexDirection: 'row', gap: 22, marginTop: 28 },
  signature: { flex: 1, borderTopWidth: 1, borderTopColor: '#846B77', paddingTop: 7 },
  signatureLabel: { color: '#A9959F', fontSize: 6.5, letterSpacing: 1.3 },
  closing: { alignItems: 'center', marginTop: 24 },
  closingText: { color: C.wine, fontSize: 12, fontWeight: 600 },
  closingSub: { color: C.muted, fontSize: 7.5, marginTop: 6, letterSpacing: 0.6 },
});

function Footer({ page, total, dark = false }: { page: number; total: number; dark?: boolean }) {
  return (
    <View style={[s.footer, dark ? s.footerDark : {}]} fixed>
      <Text style={[s.footerText, dark ? s.footerTextDark : {}]}>
        MooNs · Bespoke Event Experiences
      </Text>
      <Text style={s.footerPage}>{`${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}</Text>
    </View>
  );
}

export const TemplateV12 = ({
  leadName,
  leadLocation,
  leadBudget,
  leadNotes,
  packageName,
  packageCategory,
  packageDuration,
  runOfShow = [],
  inclusions = [],
  exclusions = [],
  activities = [],
  stays = [],
  transfers = [],
  basePrice = 0,
  activitiesCost = 0,
  discountAmount = 0,
  taxAmount = 0,
  finalPrice = 0,
}: QuotePDFProps) => {
  const totalPages = 5;
  const nameToken = (leadName || 'EVENT').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
  const quoteRef = `MN-EVT-${nameToken}-${Math.round(finalPrice || basePrice)
    .toString()
    .slice(-4)
    .padStart(4, '0')}`;
  const vision =
    leadNotes && !leadNotes.includes('[Wizard Event Brief]')
      ? leadNotes
      : `A thoughtfully produced celebration where every guest touchpoint feels considered, seamless and unmistakably personal.`;
  const groupedInclusions = inclusions.slice(0, 12);
  const eventTerms = [
    'A 30% booking advance confirms the event date and allows vendor reservations to begin.',
    'The next 40% is due 30 days before the event; the remaining balance is due 7 days before the event.',
    'Scope or guest-count changes may revise pricing and are confirmed only through a written change note.',
    'Third-party services remain subject to availability until the booking advance has been received.',
    'Cancellation charges reflect committed vendor costs and increase as the event date approaches.',
    'Timings, venue access, permits and production requirements must be shared before final execution planning.',
  ];

  return (
    <Document title={`${packageName || 'Event'} Proposal for ${leadName || 'Client'}`}>
      <Page size="A4" style={s.page}>
        <View style={s.coverTop}>
          <View style={s.coverOrbLarge} />
          <View style={s.coverOrbSmall} />
          <View style={s.coverCorner} />
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Text style={s.brandLetter}>M</Text>
            </View>
            <Text style={s.brandName}>MooNs</Text>
          </View>
          <Text style={s.coverKicker}>BESPOKE EVENT PROPOSAL</Text>
          <Text style={s.coverTitle}>A Celebration, Thoughtfully Composed.</Text>
          <Text style={s.coverPackage}>{packageName || 'Your Signature Event'}</Text>
          <Text style={s.coverFor}>CREATED ESPECIALLY FOR</Text>
          <Text style={s.coverName}>{leadName || 'Our Guest'}</Text>
        </View>
        <View style={s.coverBottom}>
          <View style={s.coverMetaRow}>
            <View style={s.coverMeta}>
              <Text style={s.coverMetaLabel}>LOCATION</Text>
              <Text style={s.coverMetaValue}>{leadLocation || 'To be confirmed'}</Text>
            </View>
            <View style={s.coverMeta}>
              <Text style={s.coverMetaLabel}>EVENT FORMAT</Text>
              <Text style={s.coverMetaValue}>{packageCategory || 'Bespoke Event'}</Text>
            </View>
            <View style={s.coverMeta}>
              <Text style={s.coverMetaLabel}>DURATION</Text>
              <Text style={s.coverMetaValue}>{packageDuration || 'To be confirmed'}</Text>
            </View>
          </View>
          <Text style={s.coverRef}>PROPOSAL {quoteRef}</Text>
        </View>
        <Footer page={1} total={totalPages} />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.content}>
          <Text style={s.eyebrow}>THE EVENT STORY</Text>
          <Text style={s.pageTitle}>Designed around your occasion</Text>
          <Text style={s.pageIntro}>
            This proposal brings the creative direction, guest experience and production plan into one
            clear event vision.
          </Text>
          <View style={s.goldRule} />

          <View style={s.storyGrid}>
            <View style={s.storyMain}>
              <View style={s.visionCard}>
                <Text style={s.quoteMark}>“</Text>
                <Text style={s.visionText}>{vision}</Text>
                <Text style={s.visionCaption}>YOUR EVENT VISION</Text>
              </View>
            </View>
            <View style={s.storySide}>
              <View style={s.detailCard}>
                {[
                  ['Celebration', packageName || 'Signature Event'],
                  ['Location', leadLocation || 'To be confirmed'],
                  ['Duration', packageDuration || 'To be confirmed'],
                  ['Budget brief', leadBudget || 'Custom quotation'],
                ].map(([label, value], index) => (
                  <View key={label} style={[s.detailRow, index === 3 ? { borderBottomWidth: 0 } : {}]}>
                    <Text style={s.detailLabel}>{label.toUpperCase()}</Text>
                    <Text style={s.detailValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={[s.sectionHeading, { marginTop: 25 }]}>Celebration flow</Text>
          <View style={s.timeline}>
            {(runOfShow.length
              ? runOfShow.slice(0, 6)
              : [{ day_number: 1, title: 'Event experience', description: 'Detailed timings will be developed during planning.' }]
            ).map((day) => {
              const dayActivities = activities.filter((item) => item.dayNumber === day.day_number);
              return (
                <View key={day.day_number} style={s.timelineItem} wrap={false}>
                  <View style={s.timelineDot} />
                  <Text style={s.dayLabel}>MOMENT {String(day.day_number).padStart(2, '0')}</Text>
                  <Text style={s.dayTitle}>{day.title}</Text>
                  <Text style={s.dayDesc}>{day.description || 'Details to be finalised together.'}</Text>
                  {dayActivities.map((activity) => (
                    <View key={activity.id} style={s.activityRow}>
                      <Text style={s.activityName}>{activity.name || 'Curated add-on'}</Text>
                      <Text style={s.activityPrice}>{money(activity.price)}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
        <Footer page={2} total={totalPages} />
      </Page>

      <Page size="A4" style={s.pageIvory}>
        <View style={s.content}>
          <Text style={s.eyebrow}>CURATED SCOPE</Text>
          <Text style={s.pageTitle}>Everything your event needs</Text>
          <Text style={s.pageIntro}>
            A coordinated service scope built to keep the experience beautiful for guests and effortless
            for the host.
          </Text>
          <View style={s.goldRule} />

          <View style={s.twoColumn}>
            <View style={s.column}>
              <Text style={s.sectionHeading}>Included services</Text>
              {groupedInclusions.length ? (
                groupedInclusions.map((item, index) => (
                  <View key={`${item.category}-${index}`} style={s.serviceCard} wrap={false}>
                    <Text style={s.serviceCategory}>{(item.category || 'EVENT SERVICE').toUpperCase()}</Text>
                    <Text style={s.serviceItem}>{item.item}</Text>
                  </View>
                ))
              ) : (
                <View style={s.serviceCard}>
                  <Text style={s.serviceCategory}>BESPOKE PRODUCTION</Text>
                  <Text style={s.serviceItem}>Services will be itemised after the final planning consultation.</Text>
                </View>
              )}
            </View>

            <View style={s.column}>
              {(stays.length > 0 || transfers.length > 0) && (
                <>
                  <Text style={s.sectionHeading}>Guest logistics</Text>
                  {stays.slice(0, 3).map((stay) => (
                    <View key={stay.id} style={s.logisticsCard} wrap={false}>
                      <Text style={s.logisticsLabel}>ACCOMMODATION</Text>
                      <Text style={s.logisticsTitle}>{stay.name}</Text>
                      <Text style={s.logisticsMeta}>
                        {stay.rooms} room(s) · {stay.nights} night(s) · {stay.stars}-star {stay.type}
                      </Text>
                    </View>
                  ))}
                  {transfers.slice(0, 3).map((transfer) => (
                    <View key={transfer.id} style={s.logisticsCard} wrap={false}>
                      <Text style={s.logisticsLabel}>GUEST MOVEMENT</Text>
                      <Text style={s.logisticsTitle}>{transfer.serviceType}</Text>
                      <Text style={s.logisticsMeta}>
                        {transfer.vehicleType} · {transfer.pax} guest(s)
                      </Text>
                    </View>
                  ))}
                </>
              )}

              <Text style={[s.sectionHeading, { marginTop: stays.length || transfers.length ? 16 : 0 }]}>
                Outside this scope
              </Text>
              <View style={s.exclusionBox}>
                {(exclusions.length
                  ? exclusions.slice(0, 8)
                  : [{ item: 'Any service not expressly listed in this proposal.' }]
                ).map((item, index) => (
                  <View key={index} style={s.listRow}>
                    <View style={s.listDot} />
                    <Text style={s.listText}>{item.item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <Footer page={3} total={totalPages} />
      </Page>

      <Page size="A4" style={s.pageDark}>
        <View style={s.content}>
          <View style={s.priceHeader}>
            <View>
              <Text style={s.eyebrow}>EVENT INVESTMENT</Text>
              <Text style={[s.pageTitle, { color: C.white }]}>Clear, considered pricing</Text>
            </View>
            <Text style={s.priceRef}>{quoteRef}</Text>
          </View>
          <Text style={[s.pageIntro, { color: '#BFAFB7' }]}>
            Your quotation reflects the confirmed event scope and the team required to deliver it.
          </Text>
          <View style={s.goldRule} />

          <View style={s.priceCard}>
            <View style={s.priceRow}>
              <View>
                <Text style={s.priceName}>{packageName || 'Bespoke event package'}</Text>
                <Text style={s.priceDesc}>Creative planning, production and core services</Text>
              </View>
              <Text style={s.priceValue}>{money(basePrice)}</Text>
            </View>

            {activities.map((activity) => (
              <View key={activity.id} style={s.priceRow}>
                <View>
                  <Text style={s.priceName}>{activity.name || 'Curated enhancement'}</Text>
                  <Text style={s.priceDesc}>Optional event enhancement</Text>
                </View>
                <Text style={s.priceValue}>{money(activity.price)}</Text>
              </View>
            ))}

            {activitiesCost > 0 && activities.length === 0 && (
              <View style={s.priceRow}>
                <Text style={s.priceName}>Event enhancements</Text>
                <Text style={s.priceValue}>{money(activitiesCost)}</Text>
              </View>
            )}

            {discountAmount > 0 && (
              <View style={s.priceRow}>
                <View>
                  <Text style={s.priceName}>Preferred client adjustment</Text>
                  <Text style={s.priceDesc}>Applied to the event subtotal</Text>
                </View>
                <Text style={s.priceValueDiscount}>- {money(discountAmount)}</Text>
              </View>
            )}

            <View style={[s.priceRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={s.priceName}>GST and statutory taxes</Text>
                <Text style={s.priceDesc}>Calculated on the applicable event services</Text>
              </View>
              <Text style={s.priceValue}>{money(taxAmount)}</Text>
            </View>
          </View>

          <View style={s.totalCard}>
            <Text style={s.totalLabel}>TOTAL EVENT INVESTMENT</Text>
            <Text style={s.totalValue}>{money(finalPrice)}</Text>
            <Text style={s.totalNote}>
              Final billing follows the approved scope. Any requested additions are quoted before execution.
            </Text>
          </View>

          <View style={s.paymentStrip}>
            <View style={s.paymentStep}>
              <Text style={s.paymentNum}>01 · RESERVE</Text>
              <Text style={s.paymentText}>30% advance to secure your event date and partner team.</Text>
            </View>
            <View style={s.paymentStep}>
              <Text style={s.paymentNum}>02 · PREPARE</Text>
              <Text style={s.paymentText}>40% due 30 days before the event for production readiness.</Text>
            </View>
            <View style={s.paymentStep}>
              <Text style={s.paymentNum}>03 · CELEBRATE</Text>
              <Text style={s.paymentText}>Final 30% due 7 days before your celebration.</Text>
            </View>
          </View>
        </View>
        <Footer page={4} total={totalPages} dark />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.content}>
          <Text style={s.eyebrow}>NEXT STEPS</Text>
          <Text style={s.pageTitle}>Let’s bring it to life</Text>
          <Text style={s.pageIntro}>
            Once approved, your MooNs producer will lock the delivery team and begin the detailed event
            production plan.
          </Text>
          <View style={s.goldRule} />

          <Text style={s.sectionHeading}>Booking terms</Text>
          <View style={s.termsCard}>
            {eventTerms.map((term, index) => (
              <View key={term} style={s.termRow}>
                <View style={s.termNum}>
                  <Text style={s.termNumText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>
                <Text style={s.termText}>{term}</Text>
              </View>
            ))}
          </View>

          <View style={s.acceptance}>
            <Text style={s.acceptanceTitle}>Proposal acceptance</Text>
            <Text style={s.acceptanceText}>
              I approve this proposal and authorise MooNs to proceed with event reservations and detailed
              planning, subject to receipt of the booking advance and the terms above.
            </Text>
            <View style={s.signatureRow}>
              <View style={s.signature}>
                <Text style={s.signatureLabel}>CLIENT NAME & SIGNATURE</Text>
              </View>
              <View style={s.signature}>
                <Text style={s.signatureLabel}>DATE</Text>
              </View>
            </View>
          </View>

          <View style={s.closing}>
            <Text style={s.closingText}>Made for moments people remember.</Text>
            <Text style={s.closingSub}>MOONS · CURATED EVENTS · THOUGHTFUL HOSPITALITY</Text>
          </View>
        </View>
        <Footer page={5} total={totalPages} />
      </Page>
    </Document>
  );
};
