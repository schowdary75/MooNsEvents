-- Remove inventory features that are no longer part of the events product.
DROP TABLE IF EXISTS `experience_listings`;
DROP TABLE IF EXISTS `experiences`;
DROP TABLE IF EXISTS `route_maps`;
DROP TABLE IF EXISTS `trend_destinations`;
DROP TABLE IF EXISTS `trend_seasons`;
DROP TABLE IF EXISTS `trend_source_states`;
DROP TABLE IF EXISTS `trend_sources`;
DROP TABLE IF EXISTS `trending_destinations`;
DROP TABLE IF EXISTS `trending_locations`;
DELETE FROM `protected_screen_access` WHERE `screen_key` = 'trending-2';
