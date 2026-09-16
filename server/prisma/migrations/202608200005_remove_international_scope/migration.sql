UPDATE `promotional_offers` SET `target_scope` = 'domestic' WHERE `target_scope` = 'international';

ALTER TABLE `promotional_offers`
  MODIFY COLUMN `target_scope` ENUM('global', 'package', 'destination', 'domestic') NOT NULL DEFAULT 'global';

ALTER TABLE `maya_flight_watches`
  CHANGE COLUMN `international` `cross_border` BOOLEAN NOT NULL DEFAULT FALSE;
