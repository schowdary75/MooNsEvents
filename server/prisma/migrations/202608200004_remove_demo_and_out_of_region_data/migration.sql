-- Remove the former demonstration catalog and its generated CRM activity.
-- Preserve real operator/admin accounts and non-demo customer activity.
SET FOREIGN_KEY_CHECKS = 0;

CREATE TEMPORARY TABLE `_demo_package_ids` AS
SELECT `id` FROM `packages`
WHERE `slug` IN (
  'corporate-conference-essentials', 'royal-wedding-celebration',
  'neon-music-festival-production', 'luxury-birthday-soiree',
  'exhibition-launch-pavilion', 'brand-product-launch-live',
  'grand-awards-gala', 'designer-runway-showcase',
  'community-cultural-festival', 'chef-table-catering-experience'
);

CREATE TEMPORARY TABLE `_demo_vendor_ids` AS
SELECT `id` FROM `vendors`
WHERE `source_name` = 'MooNsEvents demo catalog'
   OR `email` LIKE '%@demo.moonsevents.local'
   OR `email` LIKE '%.demo';

CREATE TEMPORARY TABLE `_demo_lead_ids` AS
SELECT `id` FROM `lead_submissions`
WHERE `admin_notes` = 'Seeded event CRM demonstration lead.'
   OR `email` LIKE '%@demo.moonsevents.local'
   OR `email` LIKE '%.demo';

CREATE TEMPORARY TABLE `_demo_customer_ids` AS
SELECT `id` FROM `users`
WHERE `email` LIKE '%@demo.moonsevents.local'
   OR `email` LIKE '%.demo';

CREATE TEMPORARY TABLE `_demo_deal_ids` AS
SELECT `id` FROM `crm_deals`
WHERE `customer_email` LIKE '%@demo.moonsevents.local'
   OR `customer_email` LIKE '%.demo';

CREATE TEMPORARY TABLE `_demo_marketing_lead_ids` AS
SELECT `id` FROM `marketing_leads`
WHERE `email` LIKE '%@demo.moonsevents.local'
   OR `email` LIKE '%.demo';

CREATE TEMPORARY TABLE `_demo_booking_ids` AS
SELECT `id` FROM `bookings`
WHERE `booking_reference` LIKE 'EVT-2026-10%'
   OR `package_id` IN (SELECT `id` FROM `_demo_package_ids`);

CREATE TEMPORARY TABLE `_demo_support_chat_ids` AS
SELECT `id` FROM `support_chats`
WHERE `guest_token` LIKE 'demo-event-chat-%';

DELETE FROM `trip_daily_schedules` WHERE `booking_id` IN (SELECT `id` FROM `_demo_booking_ids`);
DELETE FROM `trip_live_milestones` WHERE `booking_id` IN (SELECT `id` FROM `_demo_booking_ids`);
DELETE FROM `booking_contingencies` WHERE `booking_id` IN (SELECT `id` FROM `_demo_booking_ids`);
DELETE FROM `invoices` WHERE `booking_id` IN (SELECT `id` FROM `_demo_booking_ids`);
DELETE FROM `payment_orders` WHERE `booking_id` IN (SELECT `id` FROM `_demo_booking_ids`);
DELETE FROM `bookings` WHERE `id` IN (SELECT `id` FROM `_demo_booking_ids`);

DELETE FROM `support_messages` WHERE `chat_id` IN (SELECT `id` FROM `_demo_support_chat_ids`);
DELETE FROM `support_chats` WHERE `id` IN (SELECT `id` FROM `_demo_support_chat_ids`);

DELETE FROM `lead_followups` WHERE `lead_id` IN (SELECT `id` FROM `_demo_lead_ids`);
DELETE FROM `quotes`
WHERE `lead_id` IN (SELECT `id` FROM `_demo_marketing_lead_ids`)
   OR `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `marketing_leads` WHERE `id` IN (SELECT `id` FROM `_demo_marketing_lead_ids`);
DELETE FROM `lead_submissions` WHERE `id` IN (SELECT `id` FROM `_demo_lead_ids`);

DELETE FROM `crm_tasks` WHERE `deal_id` IN (SELECT `id` FROM `_demo_deal_ids`);
DELETE FROM `crm_quotes` WHERE `deal_id` IN (SELECT `id` FROM `_demo_deal_ids`);
DELETE FROM `crm_deals` WHERE `id` IN (SELECT `id` FROM `_demo_deal_ids`);
DELETE FROM `crm_clients`
WHERE `email` LIKE '%@demo.moonsevents.local' OR `email` LIKE '%.demo';

DELETE FROM `catalog_features` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `catalog_pricing` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `catalog_rate_cards` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `listing_revisions` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendor_communications` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendor_inventory_drafts` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendor_outreach_queue` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendor_service_coverage` WHERE `vendor_id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendors` WHERE `id` IN (SELECT `id` FROM `_demo_vendor_ids`);
DELETE FROM `vendors`
WHERE LOWER(CONCAT_WS(' ', `coverage_areas`, `address`)) NOT REGEXP 'telangana|hyderabad|secunderabad|rangareddy|andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|rajamahendravaram|bhimavaram|ongole';

DELETE FROM `client_lounge_comments` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `package_line_items` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `package_themes` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `package_inclusions` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `package_exclusions` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `package_itinerary` WHERE `package_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `promotional_offers` WHERE `target_scope` = 'package' AND `target_id` IN (SELECT `id` FROM `_demo_package_ids`);
DELETE FROM `packages` WHERE `id` IN (SELECT `id` FROM `_demo_package_ids`);

DELETE FROM `travel_themes` WHERE `slug` IN (
  'corporate-conferences', 'weddings-social', 'exhibitions-expos',
  'concerts-entertainment', 'private-parties', 'product-launches',
  'festivals-cultural', 'awards-galas', 'fashion-shows', 'catering-hospitality'
);
DELETE FROM `promo_codes` WHERE `code` IN ('EVENTFLOW10', 'WEDDING12', 'CORPORATE15');
DELETE FROM `mktg_campaigns` WHERE `name` IN ('Wedding Season 2026', 'Corporate Summit Growth', 'Private Party Retargeting', 'Festival Production Showcase');
DELETE FROM `mktg_audiences` WHERE `name` IN ('Wedding Planners & Families', 'Corporate Decision Makers', 'Past Event Customers');
DELETE FROM `mktg_automations` WHERE `name` IN ('New Event Lead Nurture', 'Quotation Follow-up', 'Event Countdown Updates');

DELETE FROM `global_chat_messages` WHERE `receiver_id` = 'demo-event-operations';
DELETE FROM `global_chat_group_members` WHERE `group_id` = 'demo-event-operations';
DELETE FROM `global_chat_groups` WHERE `id` = 'demo-event-operations';
DELETE FROM `team_messages` WHERE `content` IN (
  'Production: Hyderabad wedding venue readiness is at 92%.',
  'Sales: NovaTech requested a revised 850-guest conference proposal.',
  'Maya: Three high-score event leads need human approval before quotation.',
  'Finance: Four confirmed event advances have been verified.',
  'Vendor desk: ExpoWorks fabrication proof is ready for review.'
);

DELETE FROM `contact_submissions` WHERE `email` LIKE '%@demo.moonsevents.local';
DELETE FROM `newsletter_subscribers` WHERE `email` LIKE '%@demo.moonsevents.local';
DELETE FROM `scheduled_calls` WHERE `email` LIKE '%@demo.moonsevents.local';
DELETE FROM `callback_requests` WHERE `phone` IN ('+919830001002');
DELETE FROM `maya_activity_log` WHERE `summary` IN (
  'Ranked 12 event leads by intent, budget, urgency and engagement.',
  'Drafted a corporate conference proposal with vendor-backed pricing.',
  'Flagged backup generator readiness for today’s Hyderabad wedding.',
  'Wedding Season campaign is the strongest source of qualified event leads.',
  'Prepared concise handover summaries for three customer event chats.'
);
DELETE FROM `maya_settings` WHERE `setting_key` = 'demo_data_status';
DELETE FROM `enterprise_notifications` WHERE `id` BETWEEN '00000000-0000-4000-8000-000000009001' AND '00000000-0000-4000-8000-000000009005';

DELETE FROM `auth_sessions` WHERE `user_id` IN (SELECT `id` FROM `_demo_customer_ids`);
DELETE FROM `auth_refresh_tokens` WHERE `customer_user_id` IN (SELECT `id` FROM `_demo_customer_ids`);
DELETE FROM `customer_devices` WHERE `user_id` IN (SELECT `id` FROM `_demo_customer_ids`);
DELETE FROM `users` WHERE `id` IN (SELECT `id` FROM `_demo_customer_ids`);

-- Enforce the supported service area for any legacy inventory that may exist.
DELETE FROM `accommodation_listings`
WHERE LOWER(CONCAT_WS(' ', `destination`, `location`, `country`)) NOT REGEXP 'telangana|hyderabad|secunderabad|rangareddy|andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|rajamahendravaram|bhimavaram|ongole';
DELETE FROM `car_listings`
WHERE LOWER(CONCAT_WS(' ', `destination`, `country`)) NOT REGEXP 'telangana|hyderabad|secunderabad|rangareddy|andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|rajamahendravaram|bhimavaram|ongole';
DELETE FROM `venue_production_listings`
WHERE LOWER(CONCAT_WS(' ', `runOfShow`, `country`)) NOT REGEXP 'telangana|hyderabad|secunderabad|rangareddy|andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|rajamahendravaram|bhimavaram|ongole';
DELETE FROM `stays`
WHERE LOWER(CONCAT_WS(' ', `name`, `country`)) NOT REGEXP 'telangana|hyderabad|secunderabad|rangareddy|andhra pradesh|vijayawada|visakhapatnam|vizag|guntur|tirupati|nellore|kakinada|rajahmundry|rajamahendravaram|bhimavaram|ongole';

DROP TEMPORARY TABLE `_demo_support_chat_ids`;
DROP TEMPORARY TABLE `_demo_booking_ids`;
DROP TEMPORARY TABLE `_demo_marketing_lead_ids`;
DROP TEMPORARY TABLE `_demo_deal_ids`;
DROP TEMPORARY TABLE `_demo_customer_ids`;
DROP TEMPORARY TABLE `_demo_lead_ids`;
DROP TEMPORARY TABLE `_demo_vendor_ids`;
DROP TEMPORARY TABLE `_demo_package_ids`;

SET FOREIGN_KEY_CHECKS = 1;
