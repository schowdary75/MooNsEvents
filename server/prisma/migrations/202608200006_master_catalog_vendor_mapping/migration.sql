ALTER TABLE `package_line_items`
  MODIFY COLUMN `catalog_type` ENUM('vendor','stay','room','activity','car') NOT NULL;

DROP TABLE IF EXISTS `venue_production_listings`;
DROP TABLE IF EXISTS `cruise_listings`;
DROP TABLE IF EXISTS `flight_allotments`;

DELETE FROM `crm_role_permissions`
WHERE `module_key` IN ('timelines', 'venueProductions');
