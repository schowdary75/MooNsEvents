CREATE TABLE `vendor_service_offerings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `vendor_id` INT NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `name` VARCHAR(220) NOT NULL,
  `description` TEXT NULL,
  `unit_type` VARCHAR(40) NOT NULL DEFAULT 'fixed',
  `net_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `is_public` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_vendor_service` (`vendor_id`, `category`, `name`),
  INDEX `idx_vendor_service_offerings_vendor_category` (`vendor_id`, `category`, `is_active`),
  CONSTRAINT `vendor_service_offerings_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);

ALTER TABLE `packages`
  ADD COLUMN `markup_percent` INT NOT NULL DEFAULT 25 AFTER `b2b_price`;

ALTER TABLE `package_line_items`
  ADD COLUMN `vendor_service_id` INT NULL AFTER `vendor_id`,
  ADD INDEX `idx_package_line_items_vendor_service` (`vendor_service_id`),
  ADD CONSTRAINT `package_line_items_vendor_service_id_fkey` FOREIGN KEY (`vendor_service_id`) REFERENCES `vendor_service_offerings` (`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE `package_itinerary`
  DROP COLUMN `route_location`,
  DROP COLUMN `route_lat`,
  DROP COLUMN `route_lng`;

INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'venue', 'Venue & Hall Service' FROM `vendors` WHERE `service_categories` LIKE '%"venue"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'photography', 'Photography Service' FROM `vendors` WHERE `service_categories` LIKE '%"photography"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'decoration', 'Decoration Service' FROM `vendors` WHERE `service_categories` LIKE '%"decoration"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'catering', 'Catering & Hospitality Service' FROM `vendors` WHERE `service_categories` LIKE '%"catering"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'organizer', 'Event Planning Service' FROM `vendors` WHERE `service_categories` LIKE '%"organizer"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'production', 'Production & AV Service' FROM `vendors` WHERE `service_categories` LIKE '%"production"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'entertainment', 'Entertainment Service' FROM `vendors` WHERE `service_categories` LIKE '%"entertainment"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'logistics', 'Transport & Logistics Service' FROM `vendors` WHERE `service_categories` LIKE '%"logistics"%';
INSERT IGNORE INTO `vendor_service_offerings` (`vendor_id`, `category`, `name`)
SELECT `id`, 'staffing', 'Event Staffing Service' FROM `vendors` WHERE `service_categories` LIKE '%"staffing"%';
