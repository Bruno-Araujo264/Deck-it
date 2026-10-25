-- user_collection: deixa de apontar para cards.id e passa a guardar (game_id, card_external_id)
ALTER TABLE `user_collection` DROP FOREIGN KEY `user_collection_card_id_fkey`;
DROP INDEX `user_collection_user_id_card_id_variant_key` ON `user_collection`;

ALTER TABLE `user_collection`
    DROP COLUMN `card_id`,
    ADD COLUMN `game_id` INTEGER NOT NULL,
    ADD COLUMN `card_external_id` VARCHAR(64) NOT NULL;

CREATE UNIQUE INDEX `user_collection_user_id_game_id_card_external_id_variant_key`
    ON `user_collection`(`user_id`, `game_id`, `card_external_id`, `variant`);

ALTER TABLE `user_collection` ADD CONSTRAINT `user_collection_game_id_fkey`
    FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- cards e sets deixam de ser tabelas do app: viram views sobre a silver
DROP TABLE `cards`;
DROP TABLE `sets`;

CREATE OR REPLACE VIEW `cards` AS
SELECT g.id AS game_id, c.external_id, c.name, c.lang, c.released_at, c.rarity,
       c.set_code, c.set_name, c.collector_number, c.card_type, c.card_text,
       c.image_small, c.image_normal, c.image_large, c.faces, c.attributes,
       c._updated_at AS updated_at
FROM silver.card c
JOIN games g ON g.slug COLLATE utf8mb4_0900_ai_ci = c.game;

CREATE OR REPLACE VIEW `card_prices` AS
SELECT g.id AS game_id, p.external_id, p.price_date, p.price_type, p.price
FROM silver.card_price p
JOIN games g ON g.slug COLLATE utf8mb4_0900_ai_ci = p.game;
