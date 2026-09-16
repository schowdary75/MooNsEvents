-- CreateTable
CREATE TABLE `organizations` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `kind` ENUM('EVENT_COMPANY', 'VENDOR', 'FRANCHISE', 'PLATFORM') NOT NULL DEFAULT 'EVENT_COMPANY',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `gstin` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identities` (
    `id` CHAR(36) NOT NULL,
    `oidc_subject` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `identities_oidc_subject_key`(`oidc_subject`),
    UNIQUE INDEX `identities_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `memberships` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `badge_id` CHAR(36) NULL,
    `role_keys` JSON NOT NULL,
    `status` ENUM('INVITED', 'ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'INVITED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `memberships_tenant_id_idx`(`tenant_id`),
    INDEX `memberships_badge_id_idx`(`badge_id`),
    UNIQUE INDEX `memberships_tenant_id_identity_id_key`(`tenant_id`, `identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_preferences` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `membership_id` CHAR(36) NOT NULL,
    `appearance` JSON NOT NULL,
    `display` JSON NOT NULL,
    `notifications` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `staff_preferences_membership_id_key`(`membership_id`),
    INDEX `staff_preferences_tenant_id_updated_at_idx`(`tenant_id`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_badges` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `primary_color` VARCHAR(191) NOT NULL DEFAULT '#111111',
    `secondary_color` VARCHAR(191) NOT NULL DEFAULT '#F5F5F4',
    `icon` VARCHAR(191) NOT NULL DEFAULT 'award',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `profile_badges_tenant_id_active_name_idx`(`tenant_id`, `active`, `name`),
    UNIQUE INDEX `profile_badges_tenant_id_key_key`(`tenant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_definitions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `base_role_key` VARCHAR(191) NOT NULL,
    `permissions` JSON NOT NULL,
    `system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `role_definitions_tenant_id_idx`(`tenant_id`),
    UNIQUE INDEX `role_definitions_tenant_id_key_key`(`tenant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branches` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `branches_tenant_id_idx`(`tenant_id`),
    UNIQUE INDEX `branches_tenant_id_name_key`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `departments_tenant_id_name_key`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_types` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `group_id` CHAR(36) NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `summary` VARCHAR(191) NULL,
    `public_description` VARCHAR(191) NULL,
    `hero_image_url` VARCHAR(191) NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `suggested_services` JSON NOT NULL,
    `checklist` JSON NOT NULL,
    `ceremonies` JSON NOT NULL,
    `workflow` JSON NOT NULL,
    `custom_fields` JSON NOT NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `event_types_tenant_id_group_id_sort_order_idx`(`tenant_id`, `group_id`, `sort_order`),
    UNIQUE INDEX `event_types_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_groups` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `event_groups_tenant_id_active_sort_order_idx`(`tenant_id`, `active`, `sort_order`),
    UNIQUE INDEX `event_groups_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_items` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `kind` ENUM('SERVICE', 'ADD_ON') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price_minor` BIGINT NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `tax_rate_bps` INTEGER NOT NULL DEFAULT 1800,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'service',
    `capacity_units` INTEGER NOT NULL DEFAULT 1,
    `cutoff_days` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `catalog_items_tenant_id_active_category_idx`(`tenant_id`, `active`, `category`),
    UNIQUE INDEX `catalog_items_tenant_id_kind_name_key`(`tenant_id`, `kind`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feature_flags` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT false,
    `config` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `feature_flags_tenant_id_key_key`(`tenant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `event_date` DATE NULL,
    `guest_count` INTEGER NULL,
    `budget_minor` BIGINT NULL,
    `notes` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `score` INTEGER NOT NULL DEFAULT 0,
    `assignee_id` CHAR(36) NULL,
    `qualified_at` DATETIME(3) NULL,
    `next_follow_up_at` DATETIME(3) NULL,
    `lost_reason` VARCHAR(191) NULL,
    `converted_at` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leads_tenant_id_status_created_at_idx`(`tenant_id`, `status`, `created_at` DESC),
    INDEX `leads_tenant_id_phone_idx`(`tenant_id`, `phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_source_definitions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `score_boost` INTEGER NOT NULL DEFAULT 10,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lead_source_definitions_tenant_id_active_name_idx`(`tenant_id`, `active`, `name`),
    UNIQUE INDEX `lead_source_definitions_tenant_id_key_key`(`tenant_id`, `key`),
    UNIQUE INDEX `lead_source_definitions_tenant_id_name_key`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `customers_lead_id_key`(`lead_id`),
    INDEX `customers_tenant_id_phone_idx`(`tenant_id`, `phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_accounts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `customer_accounts_tenant_id_customer_id_idx`(`tenant_id`, `customer_id`),
    UNIQUE INDEX `customer_accounts_tenant_id_identity_id_key`(`tenant_id`, `identity_id`),
    UNIQUE INDEX `customer_accounts_tenant_id_customer_id_key`(`tenant_id`, `customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NULL,
    `metadata` JSON NOT NULL,
    `actor_id` CHAR(36) NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activities_tenant_id_subject_type_subject_id_occurred_at_idx`(`tenant_id`, `subject_type`, `subject_id`, `occurred_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `assignee_id` CHAR(36) NULL,
    `due_at` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'todo',
    `completed_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tasks_tenant_id_assignee_id_status_due_at_idx`(`tenant_id`, `assignee_id`, `status`, `due_at`),
    INDEX `tasks_tenant_id_subject_type_subject_id_idx`(`tenant_id`, `subject_type`, `subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `families` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `primary_customer_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `families_tenant_id_name_idx`(`tenant_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_members` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `family_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `family_members_tenant_id_customer_id_idx`(`tenant_id`, `customer_id`),
    UNIQUE INDEX `family_members_family_id_customer_id_key`(`family_id`, `customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `revision` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `valid_until` DATETIME(3) NOT NULL,
    `subtotal_minor` BIGINT NOT NULL,
    `tax_minor` BIGINT NOT NULL,
    `total_minor` BIGINT NOT NULL,
    `notes` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `quotations_tenant_id_status_idx`(`tenant_id`, `status`),
    UNIQUE INDEX `quotations_tenant_id_number_revision_key`(`tenant_id`, `number`, `revision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quote_conversion_sagas` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `lead_id` CHAR(36) NOT NULL,
    `event_date` DATE NOT NULL,
    `customer_id` CHAR(36) NULL,
    `booking_id` CHAR(36) NULL,
    `state` ENUM('PENDING_CUSTOMER', 'COMPLETED') NOT NULL DEFAULT 'PENDING_CUSTOMER',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `last_error` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quote_conversion_sagas_quotation_id_key`(`quotation_id`),
    UNIQUE INDEX `quote_conversion_sagas_booking_id_key`(`booking_id`),
    INDEX `quote_conversion_sagas_tenant_id_state_updated_at_idx`(`tenant_id`, `state`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_approvals` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `requested_by` CHAR(36) NOT NULL,
    `decided_by` CHAR(36) NULL,
    `decision` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reason` VARCHAR(191) NULL,
    `decided_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `quotation_approvals_tenant_id_quotation_id_decision_idx`(`tenant_id`, `quotation_id`, `decision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_negotiations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `author_type` VARCHAR(191) NOT NULL,
    `author_id` CHAR(36) NULL,
    `message` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `quotation_negotiations_tenant_id_quotation_id_created_at_idx`(`tenant_id`, `quotation_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `electronic_acceptances` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `acceptor_name` VARCHAR(191) NOT NULL,
    `acceptor_email` VARCHAR(191) NULL,
    `ip_hash` VARCHAR(191) NULL,
    `user_agent_hash` VARCHAR(191) NULL,
    `accepted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `terms_version` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `electronic_acceptances_quotation_id_key`(`quotation_id`),
    INDEX `electronic_acceptances_tenant_id_accepted_at_idx`(`tenant_id`, `accepted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_lines` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unit_price_minor` BIGINT NOT NULL,
    `tax_rate_bps` INTEGER NOT NULL,
    `optional` BOOLEAN NOT NULL DEFAULT false,

    INDEX `quotation_lines_tenant_id_quotation_id_idx`(`tenant_id`, `quotation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `quotation_id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING_DEPOSIT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_DEPOSIT',
    `event_date` DATE NOT NULL,
    `confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookings_quotation_id_key`(`quotation_id`),
    INDEX `bookings_tenant_id_event_date_idx`(`tenant_id`, `event_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_package_snapshots` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `package_version` INTEGER NOT NULL,
    `event_type_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NOT NULL,
    `snapshot` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `booking_package_snapshots_booking_id_key`(`booking_id`),
    INDEX `booking_package_snapshots_tenant_id_package_id_package_versi_idx`(`tenant_id`, `package_id`, `package_version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_amendments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `requested_by_identity_id` CHAR(36) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPLIED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `change_snapshot` JSON NOT NULL,
    `amount_delta_minor` BIGINT NOT NULL DEFAULT 0,
    `payment_milestone_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `booking_amendments_tenant_id_booking_id_status_idx`(`tenant_id`, `booking_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checkout_sessions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `milestone_id` CHAR(36) NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'razorpay',
    `provider_order_id` VARCHAR(191) NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(191) NOT NULL DEFAULT 'creating',
    `failure` VARCHAR(191) NULL,
    `idempotency_hash` VARCHAR(191) NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `checkout_sessions_provider_order_id_key`(`provider_order_id`),
    INDEX `checkout_sessions_tenant_id_booking_id_status_idx`(`tenant_id`, `booking_id`, `status`),
    UNIQUE INDEX `checkout_sessions_tenant_id_idempotency_hash_key`(`tenant_id`, `idempotency_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_payment_id` VARCHAR(191) NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('CREATED', 'CAPTURED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
    `captured_at` DATETIME(3) NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'RAZORPAY',
    `payer_reference` VARCHAR(191) NULL,
    `paid_at` DATETIME(6) NULL,
    `evidence_document_id` CHAR(36) NULL,
    `submitted_by` CHAR(36) NULL,
    `verified_by` CHAR(36) NULL,
    `verified_at` DATETIME(6) NULL,
    `verification_note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payments_tenant_id_booking_id_idx`(`tenant_id`, `booking_id`),
    INDEX `payments_tenant_id_status_method_idx`(`tenant_id`, `status`, `method`),
    UNIQUE INDEX `payments_provider_provider_payment_id_key`(`provider`, `provider_payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'VOID') NOT NULL DEFAULT 'DRAFT',
    `terms` JSON NOT NULL,
    `sent_at` DATETIME(3) NULL,
    `accepted_at` DATETIME(3) NULL,
    `accepted_by_name` VARCHAR(191) NULL,
    `acceptance_hash` VARCHAR(191) NULL,
    `acceptance_token_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contracts_tenant_id_booking_id_status_idx`(`tenant_id`, `booking_id`, `status`),
    UNIQUE INDEX `contracts_tenant_id_number_version_key`(`tenant_id`, `number`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_milestones` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `due_on` DATE NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `allocated_minor` BIGINT NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('PENDING', 'DUE', 'PARTIALLY_PAID', 'PAID', 'WAIVED') NOT NULL DEFAULT 'PENDING',
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `payment_milestones_tenant_id_booking_id_due_on_idx`(`tenant_id`, `booking_id`, `due_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_allocations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `milestone_id` CHAR(36) NULL,
    `invoice_id` CHAR(36) NULL,
    `amount_minor` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_allocations_tenant_id_payment_id_idx`(`tenant_id`, `payment_id`),
    INDEX `payment_allocations_tenant_id_milestone_id_idx`(`tenant_id`, `milestone_id`),
    INDEX `payment_allocations_tenant_id_invoice_id_idx`(`tenant_id`, `invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `kind` ENUM('PROFORMA', 'TAX_INVOICE', 'FINAL') NOT NULL DEFAULT 'TAX_INVOICE',
    `status` ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID') NOT NULL DEFAULT 'DRAFT',
    `issue_date` DATE NULL,
    `due_date` DATE NOT NULL,
    `subtotal_minor` BIGINT NOT NULL,
    `tax_minor` BIGINT NOT NULL,
    `total_minor` BIGINT NOT NULL,
    `paid_minor` BIGINT NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `gstin` VARCHAR(191) NULL,
    `place_of_supply` VARCHAR(191) NULL,
    `immutable_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `invoices_tenant_id_booking_id_status_idx`(`tenant_id`, `booking_id`, `status`),
    UNIQUE INDEX `invoices_tenant_id_number_key`(`tenant_id`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_lines` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `hsn_sac_code` VARCHAR(191) NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unit_price_minor` BIGINT NOT NULL,
    `tax_rate_bps` INTEGER NOT NULL,
    `subtotal_minor` BIGINT NOT NULL,
    `tax_minor` BIGINT NOT NULL,

    INDEX `invoice_lines_tenant_id_invoice_id_idx`(`tenant_id`, `invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_notes` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `subtotal_minor` BIGINT NOT NULL,
    `tax_minor` BIGINT NOT NULL,
    `total_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `immutable_hash` VARCHAR(191) NOT NULL,

    INDEX `credit_notes_tenant_id_invoice_id_idx`(`tenant_id`, `invoice_id`),
    UNIQUE INDEX `credit_notes_tenant_id_number_key`(`tenant_id`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `provider_refund_id` VARCHAR(191) NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `reason` VARCHAR(191) NOT NULL,
    `status` ENUM('REQUESTED', 'PROCESSING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'REQUESTED',
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refunds_provider_refund_id_key`(`provider_refund_id`),
    INDEX `refunds_tenant_id_booking_id_status_idx`(`tenant_id`, `booking_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_budgets` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `target_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `contingency_bps` INTEGER NOT NULL DEFAULT 1000,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `booking_budgets_booking_id_key`(`booking_id`),
    INDEX `booking_budgets_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_lines` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `budget_id` CHAR(36) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `planned_minor` BIGINT NOT NULL,
    `committed_minor` BIGINT NOT NULL DEFAULT 0,
    `actual_minor` BIGINT NOT NULL DEFAULT 0,

    INDEX `budget_lines_tenant_id_budget_id_idx`(`tenant_id`, `budget_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_entries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `payment_id` CHAR(36) NOT NULL,
    `account_code` VARCHAR(191) NOT NULL,
    `side` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ledger_entries_tenant_id_payment_id_idx`(`tenant_id`, `payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_receipts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_event_id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `payload_hash` VARCHAR(191) NOT NULL,
    `processed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `webhook_receipts_tenant_id_processed_at_idx`(`tenant_id`, `processed_at`),
    UNIQUE INDEX `webhook_receipts_provider_provider_event_id_key`(`provider`, `provider_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_projects` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('PLANNING', 'READY', 'LIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNING',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `custom_fields` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `event_projects_booking_id_key`(`booking_id`),
    INDEX `event_projects_tenant_id_idx`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_tasks` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `checklist` JSON NOT NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE') NOT NULL DEFAULT 'TODO',
    `assignee_id` CHAR(36) NULL,
    `priority` INTEGER NOT NULL DEFAULT 2,
    `due_at` DATETIME(3) NULL,
    `approval_required` BOOLEAN NOT NULL DEFAULT false,
    `version` INTEGER NOT NULL DEFAULT 1,
    `completed_by` CHAR(36) NULL,
    `completed_at` DATETIME(3) NULL,

    INDEX `event_tasks_tenant_id_event_project_id_idx`(`tenant_id`, `event_project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_task_versions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `changed_by` CHAR(36) NOT NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_task_versions_tenant_id_task_id_changed_at_idx`(`tenant_id`, `task_id`, `changed_at`),
    UNIQUE INDEX `event_task_versions_tenant_id_task_id_version_key`(`tenant_id`, `task_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_task_approvals` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `task_id` CHAR(36) NOT NULL,
    `requested_version` INTEGER NOT NULL,
    `requested_by` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `checker_id` CHAR(36) NULL,
    `decision_reason` VARCHAR(191) NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decided_at` DATETIME(3) NULL,

    INDEX `event_task_approvals_tenant_id_status_requested_at_idx`(`tenant_id`, `status`, `requested_at`),
    INDEX `event_task_approvals_tenant_id_task_id_requested_at_idx`(`tenant_id`, `task_id`, `requested_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_task_dependencies` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `predecessor_id` CHAR(36) NOT NULL,
    `successor_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_task_dependencies_tenant_id_successor_id_idx`(`tenant_id`, `successor_id`),
    UNIQUE INDEX `event_task_dependencies_tenant_id_predecessor_id_successor_i_key`(`tenant_id`, `predecessor_id`, `successor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_ceremonies` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `starts_at` DATETIME(6) NULL,
    `ends_at` DATETIME(6) NULL,
    `location` VARCHAR(191) NULL,
    `custom_fields` JSON NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `event_ceremonies_tenant_id_event_project_id_sort_order_idx`(`tenant_id`, `event_project_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_comments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_comments_tenant_id_event_project_id_created_at_idx`(`tenant_id`, `event_project_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_media` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `captured_at` DATETIME(6) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_media_tenant_id_event_project_id_kind_idx`(`tenant_id`, `event_project_id`, `kind`),
    UNIQUE INDEX `event_media_tenant_id_event_project_id_document_id_key`(`tenant_id`, `event_project_id`, `document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_households` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `primary_phone` VARCHAR(191) NULL,
    `primary_email` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `guest_households_tenant_id_event_project_id_idx`(`tenant_id`, `event_project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guests` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `household_id` CHAR(36) NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `rsvp_status` ENUM('PENDING', 'ATTENDING', 'DECLINED', 'MAYBE') NOT NULL DEFAULT 'PENDING',
    `party_size` INTEGER NOT NULL DEFAULT 1,
    `dietary_notes` VARCHAR(191) NULL,
    `invitation_code` VARCHAR(191) NOT NULL,
    `invited_at` DATETIME(3) NULL,
    `responded_at` DATETIME(3) NULL,
    `checked_in_at` DATETIME(6) NULL,
    `checked_in_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `guests_invitation_code_key`(`invitation_code`),
    INDEX `guests_tenant_id_event_project_id_rsvp_status_idx`(`tenant_id`, `event_project_id`, `rsvp_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_check_ins` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `guest_id` CHAR(36) NOT NULL,
    `scan_event_id` CHAR(36) NOT NULL,
    `scanned_by` CHAR(36) NOT NULL,
    `device_id` VARCHAR(191) NULL,
    `occurred_at` DATETIME(6) NOT NULL,
    `accepted` BOOLEAN NOT NULL,
    `reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `guest_check_ins_tenant_id_guest_id_occurred_at_idx`(`tenant_id`, `guest_id`, `occurred_at`),
    UNIQUE INDEX `guest_check_ins_tenant_id_scan_event_id_key`(`tenant_id`, `scan_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seating_tables` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `x` DOUBLE NULL,
    `y` DOUBLE NULL,
    `version` INTEGER NOT NULL DEFAULT 1,

    INDEX `seating_tables_tenant_id_event_project_id_idx`(`tenant_id`, `event_project_id`),
    UNIQUE INDEX `seating_tables_event_project_id_name_key`(`event_project_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat_assignments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `table_id` CHAR(36) NOT NULL,
    `guest_id` CHAR(36) NOT NULL,
    `seat_label` VARCHAR(191) NULL,

    UNIQUE INDEX `seat_assignments_guest_id_key`(`guest_id`),
    INDEX `seat_assignments_tenant_id_table_id_idx`(`tenant_id`, `table_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resources` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `kind` ENUM('EQUIPMENT', 'VEHICLE', 'VENUE_SPACE', 'STAFF', 'VENDOR_RESOURCE') NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `branch_id` CHAR(36) NULL,
    `metadata` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `resources_tenant_id_kind_active_idx`(`tenant_id`, `kind`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_availability_blocks` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `resource_id` CHAR(36) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `starts_at` DATETIME(6) NOT NULL,
    `ends_at` DATETIME(6) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resource_availability_blocks_tenant_id_resource_id_starts_at_idx`(`tenant_id`, `resource_id`, `starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_allocations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `resource_id` CHAR(36) NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('TENTATIVE', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'TENTATIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `resource_allocations_tenant_id_resource_id_starts_at_ends_at_idx`(`tenant_id`, `resource_id`, `starts_at`, `ends_at`),
    INDEX `resource_allocations_tenant_id_event_project_id_idx`(`tenant_id`, `event_project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `run_of_show_items` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NULL,
    `owner_id` CHAR(36) NULL,
    `location` VARCHAR(191) NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE') NOT NULL DEFAULT 'TODO',
    `notes` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `run_of_show_items_tenant_id_event_project_id_starts_at_idx`(`tenant_id`, `event_project_id`, `starts_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logistics_items` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_project_id` CHAR(36) NOT NULL,
    `kind` ENUM('GUEST_EVENT', 'ACCOMMODATION', 'DRIVER', 'DELIVERY', 'SECURITY', 'MEDICAL') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `starts_at` DATETIME(3) NULL,
    `ends_at` DATETIME(3) NULL,
    `provider_name` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `confirmation` VARCHAR(191) NULL,
    `guest_id` CHAR(36) NULL,
    `event_mode` VARCHAR(191) NULL,
    `reference` VARCHAR(191) NULL,
    `origin` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `driver_name` VARCHAR(191) NULL,
    `vehicle_registration` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PLANNED',
    `details` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logistics_items_tenant_id_event_project_id_kind_idx`(`tenant_id`, `event_project_id`, `kind`),
    INDEX `logistics_items_tenant_id_event_project_id_status_idx`(`tenant_id`, `event_project_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_packages` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_type_id` CHAR(36) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `version` INTEGER NOT NULL DEFAULT 1,
    `duration_days` INTEGER NOT NULL DEFAULT 1,
    `base_price_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `tax_rate_bps` INTEGER NOT NULL DEFAULT 1800,
    `deposit_kind` ENUM('PERCENTAGE', 'FIXED') NOT NULL DEFAULT 'PERCENTAGE',
    `deposit_rate_bps` INTEGER NOT NULL DEFAULT 2500,
    `deposit_fixed_minor` BIGINT NULL,
    `min_guests` INTEGER NOT NULL DEFAULT 1,
    `max_guests` INTEGER NULL,
    `booking_cutoff_days` INTEGER NOT NULL DEFAULT 7,
    `amendment_cutoff_days` INTEGER NOT NULL DEFAULT 14,
    `terms` JSON NOT NULL,
    `hero_image_url` VARCHAR(191) NULL,
    `gallery` JSON NOT NULL,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` VARCHAR(191) NULL,
    `meta_keywords` JSON NOT NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `event_packages_tenant_id_event_type_id_status_idx`(`tenant_id`, `event_type_id`, `status`),
    INDEX `event_packages_tenant_id_status_published_at_idx`(`tenant_id`, `status`, `published_at`),
    UNIQUE INDEX `event_packages_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_package_versions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_package_versions_tenant_id_package_id_created_at_idx`(`tenant_id`, `package_id`, `created_at`),
    UNIQUE INDEX `event_package_versions_package_id_version_key`(`package_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_tiers` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `min_guests` INTEGER NOT NULL,
    `max_guests` INTEGER NULL,
    `price_minor` BIGINT NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `package_tiers_tenant_id_package_id_sort_order_idx`(`tenant_id`, `package_id`, `sort_order`),
    UNIQUE INDEX `package_tiers_package_id_name_key`(`package_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_components` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'item',
    `supplier_service_id` CHAR(36) NULL,
    `resource_id` CHAR(36) NULL,
    `internal_cost_minor` BIGINT NULL,
    `public` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `package_components_tenant_id_package_id_sort_order_idx`(`tenant_id`, `package_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_add_ons` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price_minor` BIGINT NOT NULL,
    `tax_rate_bps` INTEGER NULL,
    `capacity_units` INTEGER NOT NULL DEFAULT 0,
    `customer_selectable` BOOLEAN NOT NULL DEFAULT true,
    `cutoff_days` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `package_add_ons_tenant_id_package_id_active_sort_order_idx`(`tenant_id`, `package_id`, `active`, `sort_order`),
    UNIQUE INDEX `package_add_ons_package_id_name_key`(`package_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_locations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `venue_name` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `price_delta_minor` BIGINT NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `package_locations_tenant_id_city_state_active_idx`(`tenant_id`, `city`, `state`, `active`),
    INDEX `package_locations_tenant_id_package_id_active_idx`(`tenant_id`, `package_id`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_availability_rules` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NOT NULL,
    `starts_on` DATE NOT NULL,
    `ends_on` DATE NOT NULL,
    `weekdays` JSON NOT NULL,
    `daily_capacity` INTEGER NOT NULL DEFAULT 1,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `package_availability_rules_tenant_id_package_id_location_id__idx`(`tenant_id`, `package_id`, `location_id`, `starts_on`, `ends_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_date_overrides` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `location_id` CHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `status` ENUM('OPEN', 'BLOCKED') NOT NULL DEFAULT 'OPEN',
    `capacity` INTEGER NULL,
    `price_delta_minor` BIGINT NULL,

    INDEX `package_date_overrides_tenant_id_date_status_idx`(`tenant_id`, `date`, `status`),
    UNIQUE INDEX `package_date_overrides_package_id_location_id_date_key`(`package_id`, `location_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `package_holds` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `package_id` CHAR(36) NOT NULL,
    `package_version` INTEGER NOT NULL,
    `location_id` CHAR(36) NOT NULL,
    `customer_account_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NULL,
    `starts_on` DATE NOT NULL,
    `ends_on` DATE NOT NULL,
    `units` INTEGER NOT NULL DEFAULT 1,
    `status` ENUM('ACTIVE', 'CONVERTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `pricing_snapshot` JSON NOT NULL,
    `idempotency_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `package_holds_tenant_id_package_id_location_id_starts_on_end_idx`(`tenant_id`, `package_id`, `location_id`, `starts_on`, `ends_on`, `status`),
    INDEX `package_holds_tenant_id_customer_account_id_created_at_idx`(`tenant_id`, `customer_account_id`, `created_at`),
    UNIQUE INDEX `package_holds_tenant_id_idempotency_hash_key`(`tenant_id`, `idempotency_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_categories` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `parent_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vendor_categories_tenant_id_parent_id_active_idx`(`tenant_id`, `parent_id`, `active`),
    UNIQUE INDEX `vendor_categories_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_profiles` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `legal_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `gstin` VARCHAR(191) NULL,
    `pan_masked` VARCHAR(191) NULL,
    `verification_status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'DRAFT',
    `provider_kind` ENUM('VENDOR', 'ORGANIZER') NOT NULL DEFAULT 'VENDOR',
    `organization_id` CHAR(36) NULL,
    `service_areas` JSON NOT NULL,
    `profile_completeness` INTEGER NOT NULL DEFAULT 0,
    `rating_average` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `last_verification_reminder_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vendor_profiles_tenant_id_verification_status_idx`(`tenant_id`, `verification_status`),
    INDEX `vendor_profiles_tenant_id_city_idx`(`tenant_id`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_portfolio_items` (
    `id` CHAR(36) NOT NULL,
    `public_id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `caption` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendor_portfolio_items_public_id_key`(`public_id`),
    INDEX `vendor_portfolio_items_tenant_id_vendor_id_sort_order_idx`(`tenant_id`, `vendor_id`, `sort_order`),
    UNIQUE INDEX `vendor_portfolio_items_tenant_id_vendor_id_document_id_key`(`tenant_id`, `vendor_id`, `document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_bank_accounts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `beneficiary_name` VARCHAR(191) NOT NULL,
    `bank_name` VARCHAR(191) NOT NULL,
    `account_ciphertext` VARCHAR(191) NOT NULL,
    `account_last4` CHAR(4) NOT NULL,
    `ifsc` VARCHAR(11) NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_by` CHAR(36) NOT NULL,
    `verified_by` CHAR(36) NULL,
    `verification_reason` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `vendor_bank_accounts_tenant_id_vendor_id_status_idx`(`tenant_id`, `vendor_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_services` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `category_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price_from_minor` BIGINT NULL,
    `event_type_slugs` JSON NOT NULL,

    UNIQUE INDEX `vendor_services_tenant_id_vendor_id_category_id_title_key`(`tenant_id`, `vendor_id`, `category_id`, `title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_service_publications` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_service_id` CHAR(36) NOT NULL,
    `event_type_id` CHAR(36) NOT NULL,
    `published_by` CHAR(36) NOT NULL,
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vsp_tenant_event_published_idx`(`tenant_id`, `event_type_id`, `published_at`),
    UNIQUE INDEX `vsp_tenant_service_event_uq`(`tenant_id`, `vendor_service_id`, `event_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_listings` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `provider_kind` ENUM('VENDOR', 'ORGANIZER') NOT NULL DEFAULT 'VENDOR',
    `slug` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `category_slugs` JSON NOT NULL,
    `event_type_slugs` JSON NOT NULL,
    `services` JSON NOT NULL,
    `service_areas` JSON NOT NULL,
    `portfolio` JSON NOT NULL,
    `price_from_minor` BIGINT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `rating_average` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `marketplace_listings_vendor_id_key`(`vendor_id`),
    INDEX `marketplace_listings_tenant_id_published_city_idx`(`tenant_id`, `published`, `city`),
    INDEX `marketplace_listings_tenant_id_published_provider_kind_idx`(`tenant_id`, `published`, `provider_kind`),
    UNIQUE INDEX `marketplace_listings_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provider_applications` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `provider_kind` ENUM('VENDOR', 'ORGANIZER') NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'SUBMITTED',
    `business_name` VARCHAR(191) NOT NULL,
    `contact_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `category_slugs` JSON NOT NULL,
    `event_type_slugs` JSON NOT NULL,
    `service_areas` JSON NOT NULL,
    `website` VARCHAR(191) NULL,
    `experience_years` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `consented_at` DATETIME(3) NOT NULL,
    `reviewed_by` CHAR(36) NULL,
    `review_notes` VARCHAR(191) NULL,
    `vendor_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `provider_applications_tenant_id_status_created_at_idx`(`tenant_id`, `status`, `created_at`),
    INDEX `provider_applications_tenant_id_email_idx`(`tenant_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `concierge_requests` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `contact_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `event_date` DATE NULL,
    `city` VARCHAR(191) NOT NULL,
    `guest_count` INTEGER NULL,
    `budget_minor` BIGINT NULL,
    `message` VARCHAR(191) NULL,
    `consented_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `concierge_requests_tenant_id_created_at_idx`(`tenant_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_availability` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,

    INDEX `vendor_availability_tenant_id_vendor_id_starts_at_ends_at_idx`(`tenant_id`, `vendor_id`, `starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_reviews` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NULL,
    `reviewer_name` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `body` VARCHAR(191) NOT NULL,
    `moderation_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `moderated_by` CHAR(36) NULL,
    `moderated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `marketplace_reviews_tenant_id_vendor_id_moderation_status_idx`(`tenant_id`, `vendor_id`, `moderation_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_requests` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `type` ENUM('AVAILABILITY', 'BOOKING') NOT NULL,
    `status` ENUM('NEW', 'ACKNOWLEDGED', 'ACCEPTED', 'DECLINED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `contact_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `event_date` DATE NOT NULL,
    `guest_count` INTEGER NULL,
    `budget_minor` BIGINT NULL,
    `message` VARCHAR(191) NULL,
    `requester_identity_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `marketplace_requests_tenant_id_vendor_id_status_idx`(`tenant_id`, `vendor_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketplace_disputes` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `booking_id` CHAR(36) NULL,
    `requester_name` VARCHAR(191) NOT NULL,
    `requester_email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'TRIAGED', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `marketplace_disputes_tenant_id_status_created_at_idx`(`tenant_id`, `status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendor_portal_memberships` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `vendor_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'owner',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vendor_portal_memberships_tenant_id_identity_id_active_idx`(`tenant_id`, `identity_id`, `active`),
    UNIQUE INDEX `vendor_portal_memberships_tenant_id_vendor_id_identity_id_key`(`tenant_id`, `vendor_id`, `identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shortlists` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `listing_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `shortlists_tenant_id_identity_id_created_at_idx`(`tenant_id`, `identity_id`, `created_at`),
    UNIQUE INDEX `shortlists_tenant_id_identity_id_listing_id_key`(`tenant_id`, `identity_id`, `listing_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discount_type` VARCHAR(191) NOT NULL,
    `value` INTEGER NOT NULL,
    `minimum_minor` BIGINT NULL,
    `maximum_uses` INTEGER NULL,
    `uses` INTEGER NOT NULL DEFAULT 0,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coupons_tenant_id_active_starts_at_ends_at_idx`(`tenant_id`, `active`, `starts_at`, `ends_at`),
    UNIQUE INDEX `coupons_tenant_id_code_key`(`tenant_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_redemptions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `coupon_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `order_ref` VARCHAR(191) NOT NULL,
    `discount_minor` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `coupon_redemptions_tenant_id_identity_id_idx`(`tenant_id`, `identity_id`),
    UNIQUE INDEX `coupon_redemptions_tenant_id_coupon_id_identity_id_order_ref_key`(`tenant_id`, `coupon_id`, `identity_id`, `order_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_codes` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `successful_count` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `referral_codes_tenant_id_code_key`(`tenant_id`, `code`),
    UNIQUE INDEX `referral_codes_tenant_id_identity_id_key`(`tenant_id`, `identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_uses` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `referral_code_id` CHAR(36) NOT NULL,
    `referred_identity_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `referral_uses_tenant_id_referral_code_id_idx`(`tenant_id`, `referral_code_id`),
    UNIQUE INDEX `referral_uses_tenant_id_referred_identity_id_key`(`tenant_id`, `referred_identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_accounts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `tier` VARCHAR(191) NOT NULL DEFAULT 'member',
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `loyalty_accounts_tenant_id_identity_id_key`(`tenant_id`, `identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_entries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `points` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_entries_tenant_id_account_id_created_at_idx`(`tenant_id`, `account_id`, `created_at`),
    UNIQUE INDEX `loyalty_entries_tenant_id_account_id_reference_key`(`tenant_id`, `account_id`, `reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gift_registries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `identity_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `event_date` DATE NULL,
    `share_code` VARCHAR(191) NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gift_registries_share_code_key`(`share_code`),
    INDEX `gift_registries_tenant_id_identity_id_idx`(`tenant_id`, `identity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gift_registry_items` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `registry_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `external_url` VARCHAR(191) NULL,
    `target_minor` BIGINT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `reserved_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gift_registry_items_tenant_id_registry_id_status_idx`(`tenant_id`, `registry_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_consents` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'GRANTED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `source` VARCHAR(191) NOT NULL,
    `granted_at` DATETIME(3) NULL,
    `revoked_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `communication_consents_tenant_id_status_idx`(`tenant_id`, `status`),
    UNIQUE INDEX `communication_consents_tenant_id_subject_id_channel_purpose_key`(`tenant_id`, `subject_id`, `channel`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_templates` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en-IN',
    `subject` VARCHAR(191) NULL,
    `body` VARCHAR(191) NOT NULL,
    `variables` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `message_templates_tenant_id_name_channel_locale_key`(`tenant_id`, `name`, `channel`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localization_entries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `namespace` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `localization_entries_tenant_id_locale_active_idx`(`tenant_id`, `locale`, `active`),
    UNIQUE INDEX `localization_entries_tenant_id_locale_namespace_key_key`(`tenant_id`, `locale`, `namespace`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `external_address` VARCHAR(191) NOT NULL,
    `assigned_to` CHAR(36) NULL,
    `closed_at` DATETIME(3) NULL,
    `last_message_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `conversations_tenant_id_last_message_at_idx`(`tenant_id`, `last_message_at` DESC),
    INDEX `conversations_tenant_id_assigned_to_idx`(`tenant_id`, `assigned_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `direction` ENUM('INBOUND', 'OUTBOUND') NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `provider_message_id` VARCHAR(191) NULL,
    `failure_code` VARCHAR(191) NULL,
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_tenant_id_conversation_id_created_at_idx`(`tenant_id`, `conversation_id`, `created_at`),
    INDEX `messages_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_inbound_receipts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_event_id` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `external_address` VARCHAR(191) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `message_id` CHAR(36) NULL,
    `occurred_at` DATETIME(6) NOT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `communication_inbound_receipts_tenant_id_conversation_id_rec_idx`(`tenant_id`, `conversation_id`, `received_at`),
    UNIQUE INDEX `communication_inbound_receipts_tenant_id_provider_provider_e_key`(`tenant_id`, `provider`, `provider_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_delivery_receipts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_event_id` VARCHAR(191) NOT NULL,
    `message_id` CHAR(36) NOT NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED') NOT NULL,
    `applied` BOOLEAN NOT NULL,
    `occurred_at` DATETIME(6) NOT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `communication_delivery_receipts_tenant_id_message_id_occurre_idx`(`tenant_id`, `message_id`, `occurred_at`),
    UNIQUE INDEX `communication_delivery_receipts_tenant_id_provider_provider__key`(`tenant_id`, `provider`, `provider_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `communication_policies` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `quiet_start` VARCHAR(191) NOT NULL DEFAULT '21:00',
    `quiet_end` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `marketing_purpose` VARCHAR(191) NOT NULL DEFAULT 'marketing',
    `service_purpose` VARCHAR(191) NOT NULL DEFAULT 'service',
    `max_attempts` INTEGER NOT NULL DEFAULT 5,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `communication_policies_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_attempts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `message_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `attempt` INTEGER NOT NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED') NOT NULL,
    `provider_request_id` VARCHAR(191) NULL,
    `response_code` INTEGER NULL,
    `failure_code` VARCHAR(191) NULL,
    `failure_message` VARCHAR(191) NULL,
    `retry_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `delivery_attempts_tenant_id_status_retry_at_idx`(`tenant_id`, `status`, `retry_at`),
    UNIQUE INDEX `delivery_attempts_message_id_attempt_key`(`message_id`, `attempt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaigns` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `channel` ENUM('WHATSAPP', 'SMS', 'EMAIL', 'PUSH', 'IN_APP', 'VOICE') NOT NULL,
    `purpose` VARCHAR(191) NOT NULL DEFAULT 'marketing',
    `template_id` CHAR(36) NOT NULL,
    `audience` JSON NOT NULL,
    `status` ENUM('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `scheduled_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `recipient_count` INTEGER NOT NULL DEFAULT 0,
    `delivered_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `campaigns_tenant_id_status_scheduled_at_idx`(`tenant_id`, `status`, `scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign_recipients` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `campaign_id` CHAR(36) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'QUEUED',
    `message_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `campaign_recipients_message_id_key`(`message_id`),
    INDEX `campaign_recipients_tenant_id_campaign_id_status_idx`(`tenant_id`, `campaign_id`, `status`),
    UNIQUE INDEX `campaign_recipients_campaign_id_subject_id_key`(`campaign_id`, `subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledge_articles` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en-IN',
    `tags` JSON NOT NULL,
    `status` ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `author_id` CHAR(36) NOT NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `knowledge_articles_tenant_id_status_updated_at_idx`(`tenant_id`, `status`, `updated_at`),
    UNIQUE INDEX `knowledge_articles_tenant_id_slug_locale_key`(`tenant_id`, `slug`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cms_pages` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` VARCHAR(191) NULL,
    `content` JSON NOT NULL,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` VARCHAR(191) NULL,
    `canonical_url` VARCHAR(191) NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en-IN',
    `status` ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `author_id` CHAR(36) NOT NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cms_pages_tenant_id_status_published_at_idx`(`tenant_id`, `status`, `published_at`),
    UNIQUE INDEX `cms_pages_tenant_id_slug_locale_key`(`tenant_id`, `slug`, `locale`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_links` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `external_meeting_id` VARCHAR(191) NULL,
    `join_url` VARCHAR(191) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `organizer_id` CHAR(36) NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `meeting_links_tenant_id_subject_type_subject_id_idx`(`tenant_id`, `subject_type`, `subject_id`),
    INDEX `meeting_links_tenant_id_starts_at_idx`(`tenant_id`, `starts_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voice_call_records` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subject_type` VARCHAR(191) NOT NULL,
    `subject_id` CHAR(36) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_call_id` VARCHAR(191) NULL,
    `from_masked` VARCHAR(191) NOT NULL,
    `to_masked` VARCHAR(191) NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `outcome` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `recorded_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `voice_call_records_tenant_id_subject_type_subject_id_started_idx`(`tenant_id`, `subject_type`, `subject_id`, `started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `action_url` VARCHAR(191) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_tenant_id_user_id_read_at_created_at_idx`(`tenant_id`, `user_id`, `read_at`, `created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_tickets` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `requester_type` VARCHAR(191) NOT NULL,
    `requester_id` CHAR(36) NOT NULL,
    `assignee_id` CHAR(36) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `due_at` DATETIME(3) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `support_tickets_tenant_id_status_priority_idx`(`tenant_id`, `status`, `priority`),
    UNIQUE INDEX `support_tickets_tenant_id_number_key`(`tenant_id`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_comments` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `ticket_id` CHAR(36) NOT NULL,
    `author_id` CHAR(36) NOT NULL,
    `body` VARCHAR(191) NOT NULL,
    `internal` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ticket_comments_tenant_id_ticket_id_created_at_idx`(`tenant_id`, `ticket_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_objects` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `owner_type` VARCHAR(191) NOT NULL,
    `owner_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `size_bytes` BIGINT NOT NULL,
    `object_key` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `scan_status` ENUM('PENDING', 'CLEAN', 'QUARANTINED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `sha256` VARCHAR(191) NULL,
    `scanned_at` DATETIME(3) NULL,
    `scan_failure` VARCHAR(191) NULL,
    `access_revoked_at` DATETIME(3) NULL,
    `access_revoked_by` CHAR(36) NULL,
    `uploaded_by` CHAR(36) NOT NULL,
    `retention_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `document_objects_tenant_id_owner_type_owner_id_idx`(`tenant_id`, `owner_type`, `owner_id`),
    UNIQUE INDEX `document_objects_tenant_id_object_key_version_key`(`tenant_id`, `object_key`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metric_definitions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `formula` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `dimensions` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `metric_definitions_tenant_id_active_idx`(`tenant_id`, `active`),
    UNIQUE INDEX `metric_definitions_tenant_id_key_key`(`tenant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metric_snapshots` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `metric_key` VARCHAR(191) NOT NULL,
    `period_start` DATETIME(6) NOT NULL,
    `period_end` DATETIME(6) NOT NULL,
    `dimension_key` VARCHAR(191) NOT NULL DEFAULT 'all',
    `dimension_value` VARCHAR(191) NOT NULL DEFAULT 'all',
    `value_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NULL,
    `source_count` INTEGER NOT NULL DEFAULT 0,
    `computed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `source_watermark` DATETIME(6) NULL,

    INDEX `metric_snapshots_tenant_id_metric_key_period_start_idx`(`tenant_id`, `metric_key`, `period_start`),
    UNIQUE INDEX `metric_snapshots_tenant_id_metric_key_period_start_period_en_key`(`tenant_id`, `metric_key`, `period_start`, `period_end`, `dimension_key`, `dimension_value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projection_checkpoints` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `projection` VARCHAR(191) NOT NULL,
    `last_event_id` CHAR(36) NULL,
    `last_occurred_at` DATETIME(6) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ready',
    `last_error` VARCHAR(191) NULL,
    `refreshed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `projection_checkpoints_tenant_id_projection_key`(`tenant_id`, `projection`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_schedules` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `metric_keys` JSON NOT NULL,
    `cadence` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `recipients` JSON NOT NULL,
    `format` VARCHAR(191) NOT NULL DEFAULT 'csv',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `next_run_at` DATETIME(6) NOT NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `report_schedules_tenant_id_active_next_run_at_idx`(`tenant_id`, `active`, `next_run_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lake_exports` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `object_key` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NULL,
    `range_from` DATETIME(6) NOT NULL,
    `range_to` DATETIME(6) NOT NULL,
    `row_count` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `failure` VARCHAR(191) NULL,
    `created_by` CHAR(36) NOT NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lake_exports_tenant_id_status_created_at_idx`(`tenant_id`, `status`, `created_at`),
    UNIQUE INDEX `lake_exports_tenant_id_object_key_key`(`tenant_id`, `object_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketing_source_costs` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `marketing_source_costs_tenant_id_period_start_period_end_idx`(`tenant_id`, `period_start`, `period_end`),
    INDEX `marketing_source_costs_tenant_id_source_idx`(`tenant_id`, `source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prompt_versions` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `use_case` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `system_prompt` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `prompt_versions_tenant_id_use_case_active_idx`(`tenant_id`, `use_case`, `active`),
    UNIQUE INDEX `prompt_versions_tenant_id_use_case_version_key`(`tenant_id`, `use_case`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `runs` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `use_case` VARCHAR(191) NOT NULL,
    `requested_by` CHAR(36) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `prompt_version` INTEGER NOT NULL,
    `input_hash` VARCHAR(191) NOT NULL,
    `input` JSON NOT NULL,
    `output` JSON NULL,
    `source_references` JSON NOT NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'COMPLETED', 'BLOCKED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `risk_flags` JSON NOT NULL,
    `requires_approval` BOOLEAN NOT NULL DEFAULT true,
    `input_tokens` INTEGER NOT NULL DEFAULT 0,
    `output_tokens` INTEGER NOT NULL DEFAULT 0,
    `cost_micros` BIGINT NOT NULL DEFAULT 0,
    `latency_ms` INTEGER NULL,
    `feedback` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `runs_tenant_id_use_case_created_at_idx`(`tenant_id`, `use_case`, `created_at` DESC),
    INDEX `runs_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `run_id` CHAR(36) NOT NULL,
    `reviewer_id` CHAR(36) NOT NULL,
    `decision` ENUM('APPROVED', 'REJECTED') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `approvals_run_id_key`(`run_id`),
    INDEX `approvals_tenant_id_reviewed_at_idx`(`tenant_id`, `reviewed_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledge_documents` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `classification` VARCHAR(191) NOT NULL DEFAULT 'internal',
    `status` ENUM('PENDING', 'INDEXED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `indexed_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_documents_tenant_id_status_idx`(`tenant_id`, `status`),
    UNIQUE INDEX `knowledge_documents_tenant_id_document_id_key`(`tenant_id`, `document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `knowledge_chunks` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `knowledge_id` CHAR(36) NOT NULL,
    `ordinal` INTEGER NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `token_count` INTEGER NOT NULL,
    `embedding` JSON NULL,
    `metadata` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `knowledge_chunks_tenant_id_knowledge_id_idx`(`tenant_id`, `knowledge_id`),
    UNIQUE INDEX `knowledge_chunks_tenant_id_knowledge_id_ordinal_key`(`tenant_id`, `knowledge_id`, `ordinal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_rules` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `trigger_event` VARCHAR(191) NOT NULL,
    `use_case` VARCHAR(191) NOT NULL,
    `draft_action` VARCHAR(191) NOT NULL,
    `requires_approval` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `automation_rules_tenant_id_trigger_event_active_idx`(`tenant_id`, `trigger_event`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_records` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `membership_id` CHAR(36) NOT NULL,
    `employee_number` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `department_id` CHAR(36) NULL,
    `branch_id` CHAR(36) NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `employment_status` ENUM('ACTIVE', 'ON_LEAVE', 'EXITED') NOT NULL DEFAULT 'ACTIVE',
    `joined_on` DATE NOT NULL,
    `exited_on` DATE NULL,
    `compensation_minor` BIGINT NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `pan_masked` VARCHAR(191) NULL,
    `bank_masked` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `employee_records_tenant_id_employment_status_idx`(`tenant_id`, `employment_status`),
    UNIQUE INDEX `employee_records_tenant_id_membership_id_key`(`tenant_id`, `membership_id`),
    UNIQUE INDEX `employee_records_tenant_id_employee_number_key`(`tenant_id`, `employee_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_entries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `work_date` DATE NOT NULL,
    `check_in_at` DATETIME(6) NULL,
    `check_out_at` DATETIME(6) NULL,
    `minutes_worked` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('SUBMITTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    `notes` VARCHAR(191) NULL,
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `attendance_entries_tenant_id_status_work_date_idx`(`tenant_id`, `status`, `work_date`),
    UNIQUE INDEX `attendance_entries_tenant_id_employee_id_work_date_key`(`tenant_id`, `employee_id`, `work_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_requests` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `requested_by` CHAR(36) NOT NULL,
    `checker_id` CHAR(36) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payload` JSON NOT NULL,
    `decision_reason` VARCHAR(191) NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decided_at` DATETIME(3) NULL,

    INDEX `approval_requests_tenant_id_status_requested_at_idx`(`tenant_id`, `status`, `requested_at`),
    UNIQUE INDEX `approval_requests_tenant_id_entity_type_entity_id_key`(`tenant_id`, `entity_type`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_claims` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `incurred_on` DATE NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `receipt_document_id` CHAR(36) NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED') NOT NULL DEFAULT 'SUBMITTED',
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `expense_claims_tenant_id_status_incurred_on_idx`(`tenant_id`, `status`, `incurred_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_records` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `beneficiary_type` VARCHAR(191) NOT NULL,
    `beneficiary_id` CHAR(36) NOT NULL,
    `source_type` VARCHAR(191) NOT NULL,
    `source_id` CHAR(36) NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `status` ENUM('PENDING', 'APPROVED', 'PAYABLE', 'PAID', 'VOID') NOT NULL DEFAULT 'PENDING',
    `earned_on` DATE NOT NULL,
    `approved_by` CHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `commission_records_tenant_id_status_earned_on_idx`(`tenant_id`, `status`, `earned_on`),
    UNIQUE INDEX `commission_records_tenant_id_beneficiary_type_beneficiary_id_key`(`tenant_id`, `beneficiary_type`, `beneficiary_id`, `source_type`, `source_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_records` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `asset_tag` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `serial_number` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    `assigned_to` CHAR(36) NULL,
    `purchased_on` DATE NULL,
    `purchase_value_minor` BIGINT NULL,
    `maintenance_due_on` DATE NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `asset_records_tenant_id_status_maintenance_due_on_idx`(`tenant_id`, `status`, `maintenance_due_on`),
    UNIQUE INDEX `asset_records_tenant_id_asset_tag_key`(`tenant_id`, `asset_tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_maintenance_work_orders` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `asset_id` CHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `priority` INTEGER NOT NULL DEFAULT 2,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `assignee_type` VARCHAR(191) NULL,
    `assignee_id` CHAR(36) NULL,
    `scheduled_for` DATETIME(6) NULL,
    `due_at` DATETIME(6) NULL,
    `estimated_cost_minor` BIGINT NULL,
    `actual_cost_minor` BIGINT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `resolution_notes` VARCHAR(191) NULL,
    `created_by` CHAR(36) NOT NULL,
    `completed_by` CHAR(36) NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `asset_maintenance_work_orders_tenant_id_status_due_at_idx`(`tenant_id`, `status`, `due_at`),
    INDEX `asset_maintenance_work_orders_tenant_id_asset_id_created_at_idx`(`tenant_id`, `asset_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_periods` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `starts_on` DATE NOT NULL,
    `ends_on` DATE NOT NULL,
    `status` ENUM('OPEN', 'CLOSING', 'LOCKED') NOT NULL DEFAULT 'OPEN',
    `locked_by` CHAR(36) NULL,
    `locked_at` DATETIME(3) NULL,
    `lock_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `financial_periods_tenant_id_status_starts_on_idx`(`tenant_id`, `status`, `starts_on`),
    UNIQUE INDEX `financial_periods_tenant_id_starts_on_ends_on_key`(`tenant_id`, `starts_on`, `ends_on`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `period_reconciliations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `period_id` CHAR(36) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `ledger_debit_minor` BIGINT NOT NULL,
    `ledger_credit_minor` BIGINT NOT NULL,
    `expected_settlement_minor` BIGINT NOT NULL,
    `ledger_settlement_minor` BIGINT NOT NULL,
    `variance_minor` BIGINT NOT NULL,
    `ledger_entry_count` INTEGER NOT NULL,
    `captured_payment_count` INTEGER NOT NULL,
    `refund_count` INTEGER NOT NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `computed_by` CHAR(36) NOT NULL,
    `computed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `period_reconciliations_tenant_id_period_id_computed_at_idx`(`tenant_id`, `period_id`, `computed_at`),
    INDEX `period_reconciliations_tenant_id_status_computed_at_idx`(`tenant_id`, `status`, `computed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payroll_exports` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `employee_count` INTEGER NOT NULL,
    `gross_total_minor` BIGINT NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `format` VARCHAR(191) NOT NULL DEFAULT 'csv',
    `object_key` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `status` ENUM('GENERATED', 'APPROVED', 'EXPORTED', 'VOID') NOT NULL DEFAULT 'GENERATED',
    `generated_by` CHAR(36) NOT NULL,
    `approved_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payroll_exports_tenant_id_period_start_period_end_idx`(`tenant_id`, `period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_centers` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `branch_id` CHAR(36) NULL,
    `parent_id` CHAR(36) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cost_centers_tenant_id_branch_id_idx`(`tenant_id`, `branch_id`),
    UNIQUE INDEX `cost_centers_tenant_id_code_key`(`tenant_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `branding_configurations` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `product_name` VARCHAR(191) NOT NULL DEFAULT 'EventOS',
    `logo_object_key` VARCHAR(191) NULL,
    `favicon_object_key` VARCHAR(191) NULL,
    `primary_color` VARCHAR(191) NOT NULL DEFAULT '#111111',
    `support_email` VARCHAR(191) NULL,
    `legal_name` VARCHAR(191) NULL,
    `updated_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `branding_configurations_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_domains` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `hostname` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING_DNS', 'VERIFYING', 'ACTIVE', 'FAILED', 'DISABLED') NOT NULL DEFAULT 'PENDING_DNS',
    `verification_token` VARCHAR(191) NOT NULL,
    `ownership_record_name` VARCHAR(191) NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `certificate_arn` VARCHAR(191) NULL,
    `certificate_status` VARCHAR(191) NULL,
    `validation_record_name` VARCHAR(191) NULL,
    `validation_record_value` VARCHAR(191) NULL,
    `target_hostname` VARCHAR(191) NULL,
    `tls_issued_at` DATETIME(3) NULL,
    `last_checked_at` DATETIME(3) NULL,
    `next_check_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(191) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `custom_domains_tenant_id_status_idx`(`tenant_id`, `status`),
    UNIQUE INDEX `custom_domains_hostname_key`(`hostname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `franchise_nodes` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region_code` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `franchise_nodes_tenant_id_parent_id_idx`(`tenant_id`, `parent_id`),
    UNIQUE INDEX `franchise_nodes_tenant_id_code_key`(`tenant_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `franchise_journals` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `node_id` CHAR(36) NOT NULL,
    `occurred_on` DATE NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `source_type` VARCHAR(191) NULL,
    `source_id` CHAR(36) NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `posted_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `franchise_journals_tenant_id_node_id_occurred_on_idx`(`tenant_id`, `node_id`, `occurred_on`),
    UNIQUE INDEX `franchise_journals_tenant_id_checksum_key`(`tenant_id`, `checksum`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `franchise_journal_lines` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `journal_id` CHAR(36) NOT NULL,
    `account_code` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `side` VARCHAR(191) NOT NULL,
    `amount_minor` BIGINT NOT NULL,
    `counterparty_node_id` CHAR(36) NULL,

    INDEX `franchise_journal_lines_tenant_id_journal_id_idx`(`tenant_id`, `journal_id`),
    INDEX `franchise_journal_lines_tenant_id_counterparty_node_id_idx`(`tenant_id`, `counterparty_node_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regional_controls` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `region_code` VARCHAR(191) NOT NULL,
    `data_region` VARCHAR(191) NOT NULL DEFAULT 'ap-south-1',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Kolkata',
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en-IN',
    `tax_configuration` JSON NOT NULL,
    `communication_quiet_hours` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regional_controls_tenant_id_region_code_key`(`tenant_id`, `region_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_credentials` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key_prefix` VARCHAR(191) NOT NULL,
    `key_hash` VARCHAR(191) NOT NULL,
    `scopes` JSON NOT NULL,
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `expires_at` DATETIME(3) NULL,
    `last_used_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `revoked_by` CHAR(36) NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_credentials_tenant_id_status_idx`(`tenant_id`, `status`),
    UNIQUE INDEX `api_credentials_key_hash_key`(`key_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_endpoints` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `event_types` JSON NOT NULL,
    `secret_hash` VARCHAR(191) NOT NULL,
    `secret_ciphertext` VARCHAR(191) NOT NULL,
    `signing_key_id` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `failure_count` INTEGER NOT NULL DEFAULT 0,
    `last_success_at` DATETIME(3) NULL,
    `last_failure_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `webhook_endpoints_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_deliveries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `endpoint_id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('QUEUED', 'DELIVERING', 'DELIVERED', 'FAILED', 'DEAD_LETTER') NOT NULL DEFAULT 'QUEUED',
    `attempt` INTEGER NOT NULL DEFAULT 0,
    `response_code` INTEGER NULL,
    `response_body_hash` VARCHAR(191) NULL,
    `last_error` VARCHAR(191) NULL,
    `next_attempt_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `webhook_deliveries_tenant_id_status_next_attempt_at_idx`(`tenant_id`, `status`, `next_attempt_at`),
    UNIQUE INDEX `webhook_deliveries_endpoint_id_event_id_key`(`endpoint_id`, `event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sso_connections` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `protocol` VARCHAR(191) NOT NULL,
    `issuer` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `client_secret_hash` VARCHAR(191) NULL,
    `domains` JSON NOT NULL,
    `status` ENUM('DRAFT', 'VERIFYING', 'ACTIVE', 'DISABLED') NOT NULL DEFAULT 'DRAFT',
    `enforce_for_domains` BOOLEAN NOT NULL DEFAULT false,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sso_connections_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ip_allowlist_entries` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `cidr` VARCHAR(191) NOT NULL,
    `applies_to` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ip_allowlist_entries_tenant_id_cidr_key`(`tenant_id`, `cidr`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `isolation_profiles` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `mode` ENUM('SHARED_RLS', 'DEDICATED_SCHEMA', 'DEDICATED_DATABASE', 'DEDICATED_DEPLOYMENT') NOT NULL DEFAULT 'SHARED_RLS',
    `primary_region` VARCHAR(191) NOT NULL DEFAULT 'ap-south-1',
    `dr_region` VARCHAR(191) NOT NULL DEFAULT 'ap-south-2',
    `deployment_id` VARCHAR(191) NULL,
    `encryption_key_alias` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `updated_by` CHAR(36) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `isolation_profiles_tenant_id_key`(`tenant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_accounts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `plan_key` VARCHAR(191) NOT NULL,
    `status` ENUM('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
    `seat_limit` INTEGER NOT NULL DEFAULT 5,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `billing_provider` VARCHAR(191) NULL,
    `provider_customer_id` VARCHAR(191) NULL,
    `provider_subscription_id` VARCHAR(191) NULL,
    `provider_plan_id` VARCHAR(191) NULL,
    `cancel_at_period_end` BOOLEAN NOT NULL DEFAULT false,
    `last_provider_event_at` DATETIME(6) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_accounts_tenant_id_key`(`tenant_id`),
    UNIQUE INDEX `subscription_accounts_provider_subscription_id_key`(`provider_subscription_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_invoices` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subscription_account_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_invoice_id` VARCHAR(191) NOT NULL,
    `provider_payment_id` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'PAID', 'FAILED', 'VOID') NOT NULL DEFAULT 'OPEN',
    `amount_due_minor` BIGINT NOT NULL,
    `amount_paid_minor` BIGINT NOT NULL DEFAULT 0,
    `currency` CHAR(3) NOT NULL DEFAULT 'INR',
    `period_start` DATETIME(6) NULL,
    `period_end` DATETIME(6) NULL,
    `due_at` DATETIME(6) NULL,
    `paid_at` DATETIME(6) NULL,
    `failed_at` DATETIME(6) NULL,
    `payload_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subscription_invoices_tenant_id_status_due_at_idx`(`tenant_id`, `status`, `due_at`),
    INDEX `subscription_invoices_tenant_id_subscription_account_id_crea_idx`(`tenant_id`, `subscription_account_id`, `created_at`),
    UNIQUE INDEX `subscription_invoices_provider_provider_invoice_id_key`(`provider`, `provider_invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_webhook_receipts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `subscription_account_id` CHAR(36) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_event_id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `payload_hash` VARCHAR(191) NOT NULL,
    `occurred_at` DATETIME(6) NOT NULL,
    `processed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `subscription_webhook_receipts_tenant_id_subscription_account_idx`(`tenant_id`, `subscription_account_id`, `processed_at`),
    UNIQUE INDEX `subscription_webhook_receipts_provider_provider_event_id_key`(`provider`, `provider_event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entitlement_grants` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `limit_value` BIGINT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'plan',
    `valid_until` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `entitlement_grants_tenant_id_key_key`(`tenant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usage_counters` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `metric_key` VARCHAR(191) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `quantity` BIGINT NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `usage_counters_tenant_id_period_end_idx`(`tenant_id`, `period_end`),
    UNIQUE INDEX `usage_counters_tenant_id_metric_key_period_start_period_end_key`(`tenant_id`, `metric_key`, `period_start`, `period_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usage_event_receipts` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `event_id` CHAR(36) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `metric_key` VARCHAR(191) NOT NULL,
    `quantity` BIGINT NOT NULL,
    `occurred_at` DATETIME(6) NOT NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `usage_event_receipts_tenant_id_metric_key_occurred_at_idx`(`tenant_id`, `metric_key`, `occurred_at`),
    UNIQUE INDEX `usage_event_receipts_tenant_id_event_id_key`(`tenant_id`, `event_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tenant_id` CHAR(36) NULL,
    `actor_id` CHAR(36) NULL,
    `correlation_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource_type` VARCHAR(191) NOT NULL,
    `resource_id` VARCHAR(191) NULL,
    `metadata` JSON NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `entries_tenant_id_occurred_at_idx`(`tenant_id`, `occurred_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outbox_events` (
    `id` CHAR(36) NOT NULL,
    `tenant_id` CHAR(36) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `aggregate_type` VARCHAR(191) NOT NULL,
    `aggregate_id` CHAR(36) NOT NULL,
    `payload` JSON NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_at` DATETIME(3) NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,

    INDEX `outbox_events_published_at_occurred_at_idx`(`published_at`, `occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_identity_id_fkey` FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `memberships` ADD CONSTRAINT `memberships_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `profile_badges`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_preferences` ADD CONSTRAINT `staff_preferences_membership_id_fkey` FOREIGN KEY (`membership_id`) REFERENCES `memberships`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_badges` ADD CONSTRAINT `profile_badges_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_definitions` ADD CONSTRAINT `role_definitions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `branches` ADD CONSTRAINT `branches_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_types` ADD CONSTRAINT `event_types_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_types` ADD CONSTRAINT `event_types_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `event_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_groups` ADD CONSTRAINT `event_groups_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_accounts` ADD CONSTRAINT `customer_accounts_identity_id_fkey` FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_accounts` ADD CONSTRAINT `customer_accounts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `families` ADD CONSTRAINT `families_primary_customer_id_fkey` FOREIGN KEY (`primary_customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_family_id_fkey` FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_lead_id_fkey` FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quote_conversion_sagas` ADD CONSTRAINT `quote_conversion_sagas_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_approvals` ADD CONSTRAINT `quotation_approvals_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_negotiations` ADD CONSTRAINT `quotation_negotiations_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `electronic_acceptances` ADD CONSTRAINT `electronic_acceptances_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_lines` ADD CONSTRAINT `quotation_lines_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_package_snapshots` ADD CONSTRAINT `booking_package_snapshots_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_package_snapshots` ADD CONSTRAINT `booking_package_snapshots_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_amendments` ADD CONSTRAINT `booking_amendments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout_sessions` ADD CONSTRAINT `checkout_sessions_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_milestones` ADD CONSTRAINT `payment_milestones_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_milestone_id_fkey` FOREIGN KEY (`milestone_id`) REFERENCES `payment_milestones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_lines` ADD CONSTRAINT `invoice_lines_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_notes` ADD CONSTRAINT `credit_notes_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_budgets` ADD CONSTRAINT `booking_budgets_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_lines` ADD CONSTRAINT `budget_lines_budget_id_fkey` FOREIGN KEY (`budget_id`) REFERENCES `booking_budgets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_projects` ADD CONSTRAINT `event_projects_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_tasks` ADD CONSTRAINT `event_tasks_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_task_versions` ADD CONSTRAINT `event_task_versions_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `event_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_task_approvals` ADD CONSTRAINT `event_task_approvals_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `event_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_task_dependencies` ADD CONSTRAINT `event_task_dependencies_predecessor_id_fkey` FOREIGN KEY (`predecessor_id`) REFERENCES `event_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_task_dependencies` ADD CONSTRAINT `event_task_dependencies_successor_id_fkey` FOREIGN KEY (`successor_id`) REFERENCES `event_tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_ceremonies` ADD CONSTRAINT `event_ceremonies_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_comments` ADD CONSTRAINT `event_comments_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_media` ADD CONSTRAINT `event_media_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_households` ADD CONSTRAINT `guest_households_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guests` ADD CONSTRAINT `guests_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guests` ADD CONSTRAINT `guests_household_id_fkey` FOREIGN KEY (`household_id`) REFERENCES `guest_households`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guest_check_ins` ADD CONSTRAINT `guest_check_ins_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seating_tables` ADD CONSTRAINT `seating_tables_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_assignments` ADD CONSTRAINT `seat_assignments_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `seating_tables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seat_assignments` ADD CONSTRAINT `seat_assignments_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_availability_blocks` ADD CONSTRAINT `resource_availability_blocks_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_allocations` ADD CONSTRAINT `resource_allocations_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_allocations` ADD CONSTRAINT `resource_allocations_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `run_of_show_items` ADD CONSTRAINT `run_of_show_items_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistics_items` ADD CONSTRAINT `logistics_items_event_project_id_fkey` FOREIGN KEY (`event_project_id`) REFERENCES `event_projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logistics_items` ADD CONSTRAINT `logistics_items_guest_id_fkey` FOREIGN KEY (`guest_id`) REFERENCES `guests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_packages` ADD CONSTRAINT `event_packages_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `event_package_versions` ADD CONSTRAINT `event_package_versions_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_tiers` ADD CONSTRAINT `package_tiers_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_components` ADD CONSTRAINT `package_components_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_add_ons` ADD CONSTRAINT `package_add_ons_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_locations` ADD CONSTRAINT `package_locations_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_availability_rules` ADD CONSTRAINT `package_availability_rules_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_availability_rules` ADD CONSTRAINT `package_availability_rules_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `package_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_date_overrides` ADD CONSTRAINT `package_date_overrides_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_date_overrides` ADD CONSTRAINT `package_date_overrides_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `package_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_holds` ADD CONSTRAINT `package_holds_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `event_packages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_holds` ADD CONSTRAINT `package_holds_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `package_locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_holds` ADD CONSTRAINT `package_holds_customer_account_id_fkey` FOREIGN KEY (`customer_account_id`) REFERENCES `customer_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `package_holds` ADD CONSTRAINT `package_holds_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_categories` ADD CONSTRAINT `vendor_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `vendor_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_portfolio_items` ADD CONSTRAINT `vendor_portfolio_items_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_bank_accounts` ADD CONSTRAINT `vendor_bank_accounts_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_services` ADD CONSTRAINT `vendor_services_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_services` ADD CONSTRAINT `vendor_services_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `vendor_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_service_publications` ADD CONSTRAINT `vendor_service_publications_vendor_service_id_fkey` FOREIGN KEY (`vendor_service_id`) REFERENCES `vendor_services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_service_publications` ADD CONSTRAINT `vendor_service_publications_event_type_id_fkey` FOREIGN KEY (`event_type_id`) REFERENCES `event_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_listings` ADD CONSTRAINT `marketplace_listings_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_availability` ADD CONSTRAINT `vendor_availability_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_reviews` ADD CONSTRAINT `marketplace_reviews_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_requests` ADD CONSTRAINT `marketplace_requests_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketplace_disputes` ADD CONSTRAINT `marketplace_disputes_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendor_portal_memberships` ADD CONSTRAINT `vendor_portal_memberships_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `vendor_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shortlists` ADD CONSTRAINT `shortlists_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `marketplace_listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referral_uses` ADD CONSTRAINT `referral_uses_referral_code_id_fkey` FOREIGN KEY (`referral_code_id`) REFERENCES `referral_codes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_entries` ADD CONSTRAINT `loyalty_entries_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `loyalty_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gift_registry_items` ADD CONSTRAINT `gift_registry_items_registry_id_fkey` FOREIGN KEY (`registry_id`) REFERENCES `gift_registries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication_inbound_receipts` ADD CONSTRAINT `communication_inbound_receipts_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication_inbound_receipts` ADD CONSTRAINT `communication_inbound_receipts_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communication_delivery_receipts` ADD CONSTRAINT `communication_delivery_receipts_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_attempts` ADD CONSTRAINT `delivery_attempts_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `message_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_recipients` ADD CONSTRAINT `campaign_recipients_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `campaign_recipients` ADD CONSTRAINT `campaign_recipients_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_ticket_id_fkey` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `knowledge_chunks` ADD CONSTRAINT `knowledge_chunks_knowledge_id_fkey` FOREIGN KEY (`knowledge_id`) REFERENCES `knowledge_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_entries` ADD CONSTRAINT `attendance_entries_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_claims` ADD CONSTRAINT `expense_claims_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employee_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_maintenance_work_orders` ADD CONSTRAINT `asset_maintenance_work_orders_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `asset_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `period_reconciliations` ADD CONSTRAINT `period_reconciliations_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `financial_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `franchise_journals` ADD CONSTRAINT `franchise_journals_node_id_fkey` FOREIGN KEY (`node_id`) REFERENCES `franchise_nodes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `franchise_journal_lines` ADD CONSTRAINT `franchise_journal_lines_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `franchise_journals`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_endpoint_id_fkey` FOREIGN KEY (`endpoint_id`) REFERENCES `webhook_endpoints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_invoices` ADD CONSTRAINT `subscription_invoices_subscription_account_id_fkey` FOREIGN KEY (`subscription_account_id`) REFERENCES `subscription_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_webhook_receipts` ADD CONSTRAINT `subscription_webhook_receipts_subscription_account_id_fkey` FOREIGN KEY (`subscription_account_id`) REFERENCES `subscription_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
