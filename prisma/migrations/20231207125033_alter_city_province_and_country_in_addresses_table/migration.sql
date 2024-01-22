/*
  Warnings:

  - You are about to alter the column `city` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `country` on the `addresses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `addresses` MODIFY `city` VARCHAR(100) NULL,
    MODIFY `province` VARCHAR(100) NULL,
    MODIFY `country` VARCHAR(100) NOT NULL;
