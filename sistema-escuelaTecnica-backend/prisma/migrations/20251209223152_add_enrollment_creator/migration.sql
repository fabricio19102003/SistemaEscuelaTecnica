/*
  Warnings:

  - You are about to drop the column `school_id` on the `agreements` table. All the data in the column will be lost.
  - Added the required column `name` to the `agreements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `agreements` DROP FOREIGN KEY `agreements_school_id_fkey`;

-- AlterTable
ALTER TABLE `agreements` DROP COLUMN `school_id`,
    ADD COLUMN `name` VARCHAR(150) NOT NULL;

-- AlterTable
ALTER TABLE `enrollments` ADD COLUMN `created_by` INTEGER UNSIGNED NULL;

-- AlterTable
ALTER TABLE `schools` ADD COLUMN `agreement_id` INTEGER UNSIGNED NULL;

-- CreateTable
CREATE TABLE `schedule_templates` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `schedule_templates_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_template_items` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER UNSIGNED NOT NULL,
    `day_of_week` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,

    INDEX `schedule_template_items_template_id_idx`(`template_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `enrollments_created_by_idx` ON `enrollments`(`created_by`);

-- CreateIndex
CREATE INDEX `schools_agreement_id_idx` ON `schools`(`agreement_id`);

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schools` ADD CONSTRAINT `schools_agreement_id_fkey` FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_template_items` ADD CONSTRAINT `schedule_template_items_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `schedule_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
