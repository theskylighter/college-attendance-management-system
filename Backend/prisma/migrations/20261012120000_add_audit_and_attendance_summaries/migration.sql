-- CreateTable
CREATE TABLE `CorrectionEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `correctionRequestId` INTEGER NOT NULL,
    `attendanceRecordId` INTEGER NOT NULL,
    `actorId` INTEGER NOT NULL,
    `action` ENUM('SUBMITTED', 'FACULTY_APPROVED', 'FACULTY_REJECTED', 'ESCALATED', 'ADMIN_APPROVED', 'ADMIN_REJECTED') NOT NULL,
    `previousStatus` ENUM('PRESENT', 'ABSENT', 'LATE') NULL,
    `newStatus` ENUM('PRESENT', 'ABSENT', 'LATE') NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CorrectionEvent_correctionRequestId_idx`(`correctionRequestId`),
    INDEX `CorrectionEvent_attendanceRecordId_idx`(`attendanceRecordId`),
    INDEX `CorrectionEvent_actorId_idx`(`actorId`),
    INDEX `CorrectionEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceSummary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `sectionSubjectId` INTEGER NOT NULL,
    `heldSessionCount` INTEGER NOT NULL DEFAULT 0,
    `attendedSessionCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AttendanceSummary_studentId_sectionSubjectId_key`(`studentId`, `sectionSubjectId`),
    INDEX `AttendanceSummary_studentId_idx`(`studentId`),
    INDEX `AttendanceSummary_sectionSubjectId_idx`(`sectionSubjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CorrectionEvent`
    ADD CONSTRAINT `CorrectionEvent_correctionRequestId_fkey`
    FOREIGN KEY (`correctionRequestId`) REFERENCES `CorrectionRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CorrectionEvent`
    ADD CONSTRAINT `CorrectionEvent_attendanceRecordId_fkey`
    FOREIGN KEY (`attendanceRecordId`) REFERENCES `AttendanceRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `CorrectionEvent`
    ADD CONSTRAINT `CorrectionEvent_actorId_fkey`
    FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AttendanceSummary`
    ADD CONSTRAINT `AttendanceSummary_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AttendanceSummary`
    ADD CONSTRAINT `AttendanceSummary_sectionSubjectId_fkey`
    FOREIGN KEY (`sectionSubjectId`) REFERENCES `SectionSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
