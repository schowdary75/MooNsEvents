-- Event Types already live in the canonical tenant-aware event_types catalog.
-- Remove the obsolete travel-only table that previously powered /themes.
DROP TABLE IF EXISTS `travel_themes`;
