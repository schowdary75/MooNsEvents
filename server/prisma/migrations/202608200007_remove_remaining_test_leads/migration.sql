SET FOREIGN_KEY_CHECKS = 0;

CREATE TEMPORARY TABLE `_remaining_test_lead_ids` AS
SELECT `id` FROM `lead_submissions`
WHERE `email` LIKE '%@example.invalid'
   OR LOWER(`name`) LIKE '%notification test%'
   OR LOWER(COALESCE(`destination`, '')) REGEXP 'bengaluru|bangalore|mumbai|delhi|goa|chennai|kerala|dubai|bali';

DELETE FROM `lead_followups`
WHERE `lead_id` IN (SELECT `id` FROM `_remaining_test_lead_ids`);
DELETE FROM `lead_submissions`
WHERE `id` IN (SELECT `id` FROM `_remaining_test_lead_ids`);

DROP TEMPORARY TABLE `_remaining_test_lead_ids`;
SET FOREIGN_KEY_CHECKS = 1;
