ALTER TABLE `vendors`
  ADD COLUMN `address` VARCHAR(500) NULL AFTER `coverage_areas`,
  ADD COLUMN `website_url` VARCHAR(500) NULL AFTER `address`;
