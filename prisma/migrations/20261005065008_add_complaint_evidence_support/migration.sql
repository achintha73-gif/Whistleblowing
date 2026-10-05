-- AlterTable
ALTER TABLE `evidence` ADD COLUMN `complaint_id` INTEGER NULL,
    ADD COLUMN `file_size` INTEGER NULL,
    ADD COLUMN `uploaded_by` INTEGER NULL,
    MODIFY `case_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `evidence_complaint_id_idx` ON `evidence`(`complaint_id`);

-- CreateIndex
CREATE INDEX `evidence_uploaded_by_idx` ON `evidence`(`uploaded_by`);

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`complaint_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
