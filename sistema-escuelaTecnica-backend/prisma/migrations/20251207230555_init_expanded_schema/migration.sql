-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `paternal_surname` VARCHAR(100) NOT NULL,
    `maternal_surname` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `profile_image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `role_id` INTEGER UNSIGNED NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_roles_user_id_idx`(`user_id`),
    INDEX `user_roles_role_id_idx`(`role_id`),
    UNIQUE INDEX `user_roles_user_id_role_id_key`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `registration_code` VARCHAR(20) NOT NULL,
    `document_type` ENUM('DNI', 'CE', 'PASSPORT', 'OTHER') NOT NULL,
    `document_number` VARCHAR(20) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `gender` ENUM('M', 'F', 'OTHER') NULL,
    `address` VARCHAR(255) NULL,
    `previous_school` VARCHAR(200) NULL,
    `school_id` INTEGER UNSIGNED NULL,
    `emergency_contact_name` VARCHAR(150) NULL,
    `emergency_contact_phone` VARCHAR(20) NULL,
    `medical_notes` TEXT NULL,
    `enrollment_status` ENUM('ACTIVE', 'INACTIVE', 'GRADUATED') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `students_user_id_key`(`user_id`),
    UNIQUE INDEX `students_registration_code_key`(`registration_code`),
    INDEX `students_user_id_idx`(`user_id`),
    INDEX `students_document_number_idx`(`document_number`),
    INDEX `students_registration_code_idx`(`registration_code`),
    INDEX `students_school_id_idx`(`school_id`),
    INDEX `students_enrollment_status_idx`(`enrollment_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guardians` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `document_type` ENUM('DNI', 'CE', 'PASSPORT', 'OTHER') NOT NULL,
    `document_number` VARCHAR(20) NOT NULL,
    `relationship` ENUM('FATHER', 'MOTHER', 'LEGAL_GUARDIAN', 'OTHER') NOT NULL,
    `occupation` VARCHAR(100) NULL,
    `workplace` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `guardians_user_id_key`(`user_id`),
    INDEX `guardians_user_id_idx`(`user_id`),
    INDEX `guardians_document_number_idx`(`document_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_guardians` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `guardian_id` INTEGER UNSIGNED NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,
    `can_pickup` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `student_guardians_student_id_idx`(`student_id`),
    INDEX `student_guardians_guardian_id_idx`(`guardian_id`),
    UNIQUE INDEX `student_guardians_student_id_guardian_id_key`(`student_id`, `guardian_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teachers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER UNSIGNED NOT NULL,
    `document_type` ENUM('DNI', 'CE', 'PASSPORT', 'OTHER') NOT NULL,
    `document_number` VARCHAR(20) NOT NULL,
    `specialization` VARCHAR(150) NULL,
    `hire_date` DATE NOT NULL,
    `contract_type` ENUM('FULL_TIME', 'PART_TIME', 'FREELANCE') NOT NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `teachers_user_id_key`(`user_id`),
    INDEX `teachers_user_id_idx`(`user_id`),
    INDEX `teachers_document_number_idx`(`document_number`),
    INDEX `teachers_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `description` TEXT NULL,
    `min_age` INTEGER NOT NULL,
    `max_age` INTEGER NOT NULL,
    `duration_months` INTEGER NULL,
    `image_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `courses_code_key`(`code`),
    INDEX `courses_code_idx`(`code`),
    INDEX `courses_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `order_index` INTEGER NOT NULL,
    `description` TEXT NULL,
    `duration_weeks` INTEGER NOT NULL,
    `total_hours` INTEGER NOT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `objectives` TEXT NULL,
    `requirements` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `levels_course_id_idx`(`course_id`),
    INDEX `levels_is_active_idx`(`is_active`),
    UNIQUE INDEX `levels_course_id_code_key`(`course_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `level_id` INTEGER UNSIGNED NOT NULL,
    `teacher_id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `max_capacity` INTEGER NOT NULL,
    `min_capacity` INTEGER NOT NULL DEFAULT 5,
    `current_enrolled` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `classroom` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `groups_code_key`(`code`),
    INDEX `groups_code_idx`(`code`),
    INDEX `groups_level_id_idx`(`level_id`),
    INDEX `groups_teacher_id_idx`(`teacher_id`),
    INDEX `groups_status_idx`(`status`),
    INDEX `groups_start_date_idx`(`start_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedules` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER UNSIGNED NOT NULL,
    `day_of_week` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `schedules_group_id_idx`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `group_id` INTEGER UNSIGNED NOT NULL,
    `enrollment_date` DATE NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `agreed_price` DECIMAL(10, 2) NOT NULL,
    `discount_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `agreement_id` INTEGER UNSIGNED NULL,
    `enrollment_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `enrollments_student_id_idx`(`student_id`),
    INDEX `enrollments_group_id_idx`(`group_id`),
    INDEX `enrollments_status_idx`(`status`),
    INDEX `enrollments_enrollment_date_idx`(`enrollment_date`),
    INDEX `enrollments_agreement_id_idx`(`agreement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER UNSIGNED NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,
    `arrival_time` TIME NULL,
    `notes` TEXT NULL,
    `recorded_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attendances_enrollment_id_idx`(`enrollment_id`),
    INDEX `attendances_attendance_date_idx`(`attendance_date`),
    INDEX `attendances_status_idx`(`status`),
    UNIQUE INDEX `attendances_enrollment_id_attendance_date_key`(`enrollment_id`, `attendance_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER UNSIGNED NOT NULL,
    `evaluation_name` VARCHAR(150) NOT NULL,
    `evaluation_type` ENUM('QUIZ', 'EXAM', 'HOMEWORK', 'PROJECT', 'PARTICIPATION', 'OTHER') NOT NULL,
    `grade_value` DECIMAL(5, 2) NOT NULL,
    `max_grade` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    `weight` DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
    `evaluation_date` DATE NOT NULL,
    `comments` TEXT NULL,
    `recorded_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `grades_enrollment_id_idx`(`enrollment_id`),
    INDEX `grades_evaluation_type_idx`(`evaluation_type`),
    INDEX `grades_evaluation_date_idx`(`evaluation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_cards` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER UNSIGNED NOT NULL,
    `period_name` VARCHAR(100) NOT NULL,
    `period_start` DATE NOT NULL,
    `period_end` DATE NOT NULL,
    `final_grade` DECIMAL(5, 2) NOT NULL,
    `max_grade` DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    `attendance_percentage` DECIMAL(5, 2) NULL,
    `teacher_comments` TEXT NULL,
    `status` ENUM('IN_PROGRESS', 'APPROVED', 'FAILED', 'INCOMPLETE') NOT NULL,
    `issued_date` DATE NULL,
    `issued_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `report_cards_enrollment_id_idx`(`enrollment_id`),
    INDEX `report_cards_status_idx`(`status`),
    INDEX `report_cards_issued_date_idx`(`issued_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER UNSIGNED NOT NULL,
    `certificate_number` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(200) NOT NULL,
    `level_name` VARCHAR(150) NOT NULL,
    `course_name` VARCHAR(150) NOT NULL,
    `issue_date` DATE NOT NULL,
    `completion_date` DATE NOT NULL,
    `final_grade` DECIMAL(5, 2) NOT NULL,
    `attendance_percentage` DECIMAL(5, 2) NOT NULL,
    `total_hours` INTEGER NOT NULL,
    `certificate_file_url` VARCHAR(500) NULL,
    `issued_by` INTEGER UNSIGNED NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `certificates_certificate_number_key`(`certificate_number`),
    INDEX `certificates_certificate_number_idx`(`certificate_number`),
    INDEX `certificates_enrollment_id_idx`(`enrollment_id`),
    INDEX `certificates_issue_date_idx`(`issue_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schools` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `address` VARCHAR(255) NULL,
    `district` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(150) NULL,
    `contact_person` VARCHAR(150) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `schools_code_key`(`code`),
    INDEX `schools_code_idx`(`code`),
    INDEX `schools_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agreements` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `school_id` INTEGER UNSIGNED NOT NULL,
    `agreement_code` VARCHAR(30) NOT NULL,
    `discount_type` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `agreements_agreement_code_key`(`agreement_code`),
    INDEX `agreements_agreement_code_idx`(`agreement_code`),
    INDEX `agreements_school_id_idx`(`school_id`),
    INDEX `agreements_is_active_idx`(`is_active`),
    INDEX `agreements_start_date_end_date_idx`(`start_date`, `end_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER UNSIGNED NULL,
    `invoice_number` VARCHAR(30) NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `tax_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `balance` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_deadline_days` INTEGER NOT NULL DEFAULT 30,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    INDEX `invoices_invoice_number_idx`(`invoice_number`),
    INDEX `invoices_enrollment_id_idx`(`enrollment_id`),
    INDEX `invoices_status_idx`(`status`),
    INDEX `invoices_due_date_idx`(`due_date`),
    INDEX `invoices_issue_date_idx`(`issue_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_records` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER UNSIGNED NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('CASH', 'TRANSFER', 'CARD', 'CHEQUE', 'OTHER') NOT NULL,
    `reference_number` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `received_by` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_records_invoice_id_idx`(`invoice_id`),
    INDEX `payment_records_payment_date_idx`(`payment_date`),
    INDEX `payment_records_payment_method_idx`(`payment_method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debt_records` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER UNSIGNED NOT NULL,
    `total_debt` DECIMAL(10, 2) NOT NULL,
    `oldest_debt_date` DATE NULL,
    `last_payment_date` DATE NULL,
    `payment_plan` TEXT NULL,
    `status` ENUM('CURRENT', 'OVERDUE', 'IN_COLLECTION', 'RESOLVED') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `debt_records_student_id_idx`(`student_id`),
    INDEX `debt_records_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_registers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `opened_by` INTEGER UNSIGNED NOT NULL,
    `opened_at` DATETIME(3) NOT NULL,
    `closed_by` INTEGER UNSIGNED NULL,
    `closed_at` DATETIME(3) NULL,
    `opening_balance` DECIMAL(10, 2) NOT NULL,
    `closing_balance` DECIMAL(10, 2) NULL,
    `expected_balance` DECIMAL(10, 2) NULL,
    `difference` DECIMAL(10, 2) NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cash_registers_opened_by_idx`(`opened_by`),
    INDEX `cash_registers_opened_at_idx`(`opened_at`),
    INDEX `cash_registers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_flows` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cash_register_id` INTEGER UNSIGNED NOT NULL,
    `transaction_type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `payment_record_id` INTEGER UNSIGNED NULL,
    `reference` VARCHAR(100) NULL,
    `created_by` INTEGER UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cash_flows_cash_register_id_idx`(`cash_register_id`),
    INDEX `cash_flows_transaction_type_idx`(`transaction_type`),
    INDEX `cash_flows_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_email_logs` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `recipient_email` VARCHAR(150) NOT NULL,
    `recipient_user_id` INTEGER UNSIGNED NULL,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `email_type` VARCHAR(50) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'BOUNCED') NOT NULL DEFAULT 'PENDING',
    `sent_at` DATETIME(3) NULL,
    `error_message` TEXT NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notification_email_logs_recipient_email_idx`(`recipient_email`),
    INDEX `notification_email_logs_recipient_user_id_idx`(`recipient_user_id`),
    INDEX `notification_email_logs_status_idx`(`status`),
    INDEX `notification_email_logs_email_type_idx`(`email_type`),
    INDEX `notification_email_logs_sent_at_idx`(`sent_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guardians` ADD CONSTRAINT `guardians_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_guardians` ADD CONSTRAINT `student_guardians_guardian_id_fkey` FOREIGN KEY (`guardian_id`) REFERENCES `guardians`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `levels` ADD CONSTRAINT `levels_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_agreement_id_fkey` FOREIGN KEY (`agreement_id`) REFERENCES `agreements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grades` ADD CONSTRAINT `grades_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grades` ADD CONSTRAINT `grades_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_records` ADD CONSTRAINT `payment_records_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_records` ADD CONSTRAINT `payment_records_received_by_fkey` FOREIGN KEY (`received_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt_records` ADD CONSTRAINT `debt_records_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_registers` ADD CONSTRAINT `cash_registers_opened_by_fkey` FOREIGN KEY (`opened_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_registers` ADD CONSTRAINT `cash_registers_closed_by_fkey` FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_flows` ADD CONSTRAINT `cash_flows_cash_register_id_fkey` FOREIGN KEY (`cash_register_id`) REFERENCES `cash_registers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_flows` ADD CONSTRAINT `cash_flows_payment_record_id_fkey` FOREIGN KEY (`payment_record_id`) REFERENCES `payment_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_flows` ADD CONSTRAINT `cash_flows_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_email_logs` ADD CONSTRAINT `notification_email_logs_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
