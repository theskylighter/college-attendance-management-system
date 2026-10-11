-- Repair columns added to CorrectionRequest after the audit workflow migration.
ALTER TABLE `CorrectionRequest`
    ADD COLUMN `escalatedAt` DATETIME(3) NULL,
    ADD COLUMN `escalationReason` VARCHAR(191) NULL;
