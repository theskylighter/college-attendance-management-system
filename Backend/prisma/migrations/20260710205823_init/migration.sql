-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'FACULTY', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Department_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `batchYear` INTEGER NOT NULL,
    `programType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `rollNumber` VARCHAR(191) NOT NULL,
    `sectionId` INTEGER NOT NULL,

    UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
    UNIQUE INDEX `StudentProfile_rollNumber_key`(`rollNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacultyProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,

    UNIQUE INDEX `FacultyProfile_userId_key`(`userId`),
    UNIQUE INDEX `FacultyProfile_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `totalPlannedLectures` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Subject_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SectionSubject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `facultyProfileId` INTEGER NOT NULL,

    UNIQUE INDEX `SectionSubject_sectionId_subjectId_key`(`sectionId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LectureSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionSubjectId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'HELD', 'CANCELLED', 'MAKEUP') NOT NULL DEFAULT 'SCHEDULED',
    `markedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lectureSessionId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    `markedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AttendanceRecord_lectureSessionId_studentId_key`(`lectureSessionId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CorrectionRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attendanceRecordId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `facultyDecision` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `facultyDecisionAt` DATETIME(3) NULL,
    `adminEscalated` BOOLEAN NOT NULL DEFAULT false,
    `adminDecision` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL,
    `adminDecisionAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultyProfile` ADD CONSTRAINT `FacultyProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultyProfile` ADD CONSTRAINT `FacultyProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionSubject` ADD CONSTRAINT `SectionSubject_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionSubject` ADD CONSTRAINT `SectionSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SectionSubject` ADD CONSTRAINT `SectionSubject_facultyProfileId_fkey` FOREIGN KEY (`facultyProfileId`) REFERENCES `FacultyProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LectureSession` ADD CONSTRAINT `LectureSession_sectionSubjectId_fkey` FOREIGN KEY (`sectionSubjectId`) REFERENCES `SectionSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LectureSession` ADD CONSTRAINT `LectureSession_markedById_fkey` FOREIGN KEY (`markedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_lectureSessionId_fkey` FOREIGN KEY (`lectureSessionId`) REFERENCES `LectureSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceRecord` ADD CONSTRAINT `AttendanceRecord_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CorrectionRequest` ADD CONSTRAINT `CorrectionRequest_attendanceRecordId_fkey` FOREIGN KEY (`attendanceRecordId`) REFERENCES `AttendanceRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CorrectionRequest` ADD CONSTRAINT `CorrectionRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
