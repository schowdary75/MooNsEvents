DELETE FROM `package_line_items`
WHERE `catalog_type` <> 'vendor';

ALTER TABLE `package_line_items`
  MODIFY COLUMN `catalog_type` ENUM('vendor') NOT NULL;
