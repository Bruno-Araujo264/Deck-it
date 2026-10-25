/*
  Warnings:

  - The primary key for the `cards` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `user_collection` DROP FOREIGN KEY `user_collection_card_id_fkey`;

-- DropIndex
DROP INDEX `user_collection_card_id_fkey` ON `user_collection`;

-- AlterTable
ALTER TABLE `cards` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(36) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user_collection` MODIFY `card_id` VARCHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `user_collection` ADD CONSTRAINT `user_collection_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
