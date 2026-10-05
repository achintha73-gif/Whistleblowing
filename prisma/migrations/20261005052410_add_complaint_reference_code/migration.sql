/*
  Warnings:

  - A unique constraint covering the columns `[reference_code]` on the table `complaints` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `complaints` ADD COLUMN `reference_code` VARCHAR(20) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `complaints_reference_code_key` ON `complaints`(`reference_code`);
