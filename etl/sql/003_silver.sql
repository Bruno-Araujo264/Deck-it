CREATE TABLE IF NOT EXISTS silver.card (
  game             VARCHAR(8)   NOT NULL,
  external_id      VARCHAR(64)  NOT NULL,
  name             VARCHAR(500) NOT NULL,
  lang             VARCHAR(8)   NULL,
  released_at      DATE         NULL,
  rarity           VARCHAR(16)  NULL,
  set_code         VARCHAR(16)  NULL,
  set_name         VARCHAR(255) NULL,
  collector_number VARCHAR(32)  NULL,
  card_type        VARCHAR(255) NULL,
  card_text        TEXT         NULL,
  image_small      VARCHAR(500) NULL,
  image_normal     VARCHAR(500) NULL,
  image_large      VARCHAR(500) NULL,
  faces            JSON         NULL,
  attributes       JSON         NULL,
  row_hash         CHAR(64)     NOT NULL,
  _load_id         VARCHAR(64)  NOT NULL,
  _created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (game, external_id),
  KEY idx_set (game, set_code),
  KEY idx_name (name(100))
);

-- Historico: uma linha por carta/dia/tipo de preco. Nunca e atualizada.
CREATE TABLE IF NOT EXISTS silver.card_price (
  game        VARCHAR(8)    NOT NULL,
  external_id VARCHAR(64)   NOT NULL,
  price_date  DATE          NOT NULL,
  price_type  VARCHAR(16)   NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  _load_id    VARCHAR(64)   NOT NULL,
  PRIMARY KEY (game, external_id, price_date, price_type)
);