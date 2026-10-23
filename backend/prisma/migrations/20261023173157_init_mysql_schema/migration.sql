-- CreateTable
CREATE TABLE `games` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `source_api` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `games_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `game_id` INTEGER NOT NULL,
    `external_id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `release_date` DATE NULL,
    `total_cards` INTEGER NULL,
    `image_url` TEXT NULL,

    UNIQUE INDEX `sets_game_id_external_id_key`(`game_id`, `external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `game_id` INTEGER NOT NULL,
    `set_id` INTEGER NOT NULL,
    `external_id` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `collector_number` VARCHAR(20) NULL,
    `rarity` VARCHAR(50) NULL,
    `image_url` TEXT NULL,
    `attributes` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cards_set_id_idx`(`set_id`),
    UNIQUE INDEX `cards_game_id_external_id_key`(`game_id`, `external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `google_id` VARCHAR(255) NULL,
    `avatar_url` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_google_id_key`(`google_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `card_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `variant` VARCHAR(50) NOT NULL DEFAULT 'normal',
    `condition` VARCHAR(30) NOT NULL DEFAULT 'near_mint',
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_collection_user_id_idx`(`user_id`),
    UNIQUE INDEX `user_collection_user_id_card_id_variant_key`(`user_id`, `card_id`, `variant`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_tracked_games` (
    `user_id` INTEGER NOT NULL,
    `game_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `game_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sets` ADD CONSTRAINT `sets_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_set_id_fkey` FOREIGN KEY (`set_id`) REFERENCES `sets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_collection` ADD CONSTRAINT `user_collection_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_collection` ADD CONSTRAINT `user_collection_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_tracked_games` ADD CONSTRAINT `user_tracked_games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_tracked_games` ADD CONSTRAINT `user_tracked_games_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
