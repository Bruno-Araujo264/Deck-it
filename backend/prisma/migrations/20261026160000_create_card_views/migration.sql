CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW `cards` AS
SELECT
    g.`id` AS `game_id`,
    c.`external_id`,
    c.`name`,
    c.`lang`,
    c.`released_at`,
    c.`rarity`,
    c.`set_code`,
    c.`set_name`,
    c.`collector_number`,
    c.`card_type`,
    c.`card_text`,
    c.`image_small`,
    c.`image_normal`,
    c.`image_large`,
    c.`faces`,
    c.`attributes`,
    c.`_updated_at` AS `updated_at`
FROM `silver`.`card` c
INNER JOIN `games` g
    ON g.`slug` COLLATE utf8mb4_unicode_ci = c.`game` COLLATE utf8mb4_unicode_ci;

CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW `card_prices` AS
SELECT
    g.`id` AS `game_id`,
    p.`external_id`,
    p.`price_date`,
    p.`price_type`,
    p.`price`
FROM `silver`.`card_price` p
INNER JOIN `games` g
    ON g.`slug` COLLATE utf8mb4_unicode_ci = p.`game` COLLATE utf8mb4_unicode_ci;
