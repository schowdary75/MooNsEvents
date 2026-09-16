ALTER TABLE `provider_credentials`
  ADD COLUMN `external_account_id` VARCHAR(160) NULL;

CREATE UNIQUE INDEX `uq_provider_external_account`
  ON `provider_credentials` (`provider`, `external_account_id`);
