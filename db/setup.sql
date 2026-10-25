-- Rodar UMA vez em cada maquina:  mysql -u root -p < db/setup.sql
CREATE DATABASE IF NOT EXISTS deck_it_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS ops        CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS bronze     CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS silver     CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'deckit'@'%' IDENTIFIED BY 'deckit';

GRANT ALL PRIVILEGES ON deck_it_db.* TO 'deckit'@'%';
GRANT ALL PRIVILEGES ON ops.*        TO 'deckit'@'%';
GRANT ALL PRIVILEGES ON bronze.*     TO 'deckit'@'%';
GRANT ALL PRIVILEGES ON silver.*     TO 'deckit'@'%';

-- DO PRISMA 
GRANT ALL PRIVILEGES ON `prisma\_migrate\_shadow\_db\_%`.* TO 'deckit'@'%';