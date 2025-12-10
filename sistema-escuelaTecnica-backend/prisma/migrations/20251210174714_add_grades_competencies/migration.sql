/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `grades` MODIFY `evaluation_type` ENUM('SPEAKING', 'LISTENING', 'READING', 'WRITING', 'VOCABULARY', 'GRAMMAR', 'QUIZ', 'EXAM', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `report_cards` ADD COLUMN `absences` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `username` VARCHAR(50) NULL,
    MODIFY `email` VARCHAR(150) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);
