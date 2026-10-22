-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "source_api" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "external_id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "release_date" DATE,
    "total_cards" INTEGER,
    "image_url" TEXT,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "set_id" INTEGER NOT NULL,
    "external_id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "collector_number" VARCHAR(20),
    "rarity" VARCHAR(50),
    "image_url" TEXT,
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_collection" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "variant" VARCHAR(50) NOT NULL DEFAULT 'normal',
    "condition" VARCHAR(30) NOT NULL DEFAULT 'near_mint',
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tracked_games" (
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,

    CONSTRAINT "user_tracked_games_pkey" PRIMARY KEY ("user_id","game_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sets_game_id_external_id_key" ON "sets"("game_id", "external_id");

-- CreateIndex
CREATE INDEX "cards_set_id_idx" ON "cards"("set_id");

-- CreateIndex
CREATE UNIQUE INDEX "cards_game_id_external_id_key" ON "cards"("game_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_collection_user_id_idx" ON "user_collection"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_collection_user_id_card_id_variant_key" ON "user_collection"("user_id", "card_id", "variant");

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collection" ADD CONSTRAINT "user_collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collection" ADD CONSTRAINT "user_collection_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tracked_games" ADD CONSTRAINT "user_tracked_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tracked_games" ADD CONSTRAINT "user_tracked_games_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
