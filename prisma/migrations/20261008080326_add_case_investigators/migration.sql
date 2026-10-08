-- CreateTable
CREATE TABLE `case_investigators` (
    `case_id` INTEGER NOT NULL,
    `investigator_id` INTEGER NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `case_investigators_investigator_id_idx`(`investigator_id`),
    PRIMARY KEY (`case_id`, `investigator_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `case_investigators` ADD CONSTRAINT `case_investigators_case_id_fkey` FOREIGN KEY (`case_id`) REFERENCES `cases`(`case_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `case_investigators` ADD CONSTRAINT `case_investigators_investigator_id_fkey` FOREIGN KEY (`investigator_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
