-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `building` VARCHAR(191) NULL,
    `capacity` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Room_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `LectureSession`
    ADD COLUMN `roomId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TimetableSlot`
    ADD COLUMN `roomId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `LectureSession`
    ADD CONSTRAINT `LectureSession_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimetableSlot`
    ADD CONSTRAINT `TimetableSlot_roomId_fkey`
    FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
