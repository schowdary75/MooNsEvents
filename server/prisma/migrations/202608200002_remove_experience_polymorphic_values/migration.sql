DELETE FROM `catalog_features` WHERE `catalog_type` = 'experience';
DELETE FROM `catalog_media` WHERE `catalog_type` = 'experience';
DELETE FROM `catalog_pricing` WHERE `catalog_type` = 'experience';
DELETE FROM `customer_reviews` WHERE `item_type` = 'experience';
DELETE FROM `listing_revisions` WHERE `listing_type` = 'experience';
DELETE FROM `offer_items` WHERE `item_type` = 'experience';
DELETE FROM `bookings` WHERE `item_type` = 'experience';
DELETE FROM `user_wishlists` WHERE `item_type` = 'experience';

ALTER TABLE `catalog_features`
  MODIFY `catalog_type` ENUM('destination', 'stay', 'car', 'package') NOT NULL;
ALTER TABLE `catalog_media`
  MODIFY `catalog_type` ENUM('destination', 'stay', 'room', 'activity', 'car', 'package', 'vendor') NOT NULL;
ALTER TABLE `catalog_pricing`
  MODIFY `catalog_type` ENUM('destination', 'stay', 'car', 'package') NOT NULL;
ALTER TABLE `customer_reviews`
  MODIFY `item_type` ENUM('package', 'stay', 'general') NOT NULL DEFAULT 'general';
ALTER TABLE `listing_revisions`
  MODIFY `listing_type` ENUM('accommodation', 'car') NOT NULL;
ALTER TABLE `offer_items`
  MODIFY `item_type` ENUM('package', 'stay', 'car', 'cruise') NOT NULL;
ALTER TABLE `bookings`
  MODIFY `item_type` ENUM('package', 'package_bundle', 'stay', 'cruise') NOT NULL;
ALTER TABLE `user_wishlists`
  MODIFY `item_type` ENUM('package', 'stay', 'car') NOT NULL;
