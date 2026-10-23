CREATE DATABASE IF NOT EXISTS ops    CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS bronze CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS silver CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ops.sync_log (
  load_id         VARCHAR(64)  NOT NULL PRIMARY KEY,
  game            VARCHAR(16)  NOT NULL,
  load_type       ENUM('full','incremental') NOT NULL,
  source_version  VARCHAR(64)  NULL,
  status          ENUM('started','extracted','bronze_loaded','done','failed') NOT NULL DEFAULT 'started',
  raw_path        VARCHAR(512) NULL,
  records_bronze  INT          NULL,
  error_message   TEXT         NULL,
  started_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_game_status (game, status)
);
