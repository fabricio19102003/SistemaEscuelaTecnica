/*
  Warnings:

  - You are about to drop the column `max_age` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `min_age` on the `courses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sie_code]` on the table `schools` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `courses` DROP COLUMN `max_age`,
    DROP COLUMN `min_age`,
    ADD COLUMN `classroom_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `teacher_id` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `schedules` ADD COLUMN `course_id` INTEGER UNSIGNED NULL,
    MODIFY `group_id` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `schools` ADD COLUMN `director_name` VARCHAR(150) NULL,
    ADD COLUMN `director_phone` VARCHAR(20) NULL,
    ADD COLUMN `levels` JSON NULL,
    ADD COLUMN `sie_code` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `teachers` ADD COLUMN `cv_url` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `classrooms` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `location` VARCHAR(150) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `classrooms_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `courses_teacher_id_idx` ON `courses`(`teacher_id`);

-- CreateIndex
CREATE INDEX `courses_classroom_id_idx` ON `courses`(`classroom_id`);

-- CreateIndex
CREATE INDEX `schedules_course_id_idx` ON `schedules`(`course_id`);

-- CreateIndex
CREATE UNIQUE INDEX `schools_sie_code_key` ON `schools`(`sie_code`);

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
