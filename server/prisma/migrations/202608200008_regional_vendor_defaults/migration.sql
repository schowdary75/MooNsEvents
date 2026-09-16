ALTER TABLE `vendors`
  MODIFY COLUMN `image_key` VARCHAR(50) NOT NULL DEFAULT 'hyderabad';

UPDATE `vendors`
SET `image_key` = 'hyderabad'
WHERE LOWER(`image_key`) IN ('bali', 'dubai', 'goa', 'kerala');

DELETE FROM `email_templates`
WHERE `name` = 'VenueProduction RFQ'
   OR `scope_tags` = 'venueProduction';
