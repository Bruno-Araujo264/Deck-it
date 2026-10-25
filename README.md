# Deck-it

App de coleção de cartas (Magic, Yu-Gi-Oh e Pokémon). Os dados das cartas vêm das APIs públicas através de um pipeline em Python (ETL), caem no MySQL e o backend (Prisma) consome direto desse banco.

Hoje só o **Magic (Scryfall)** está pronto no ETL. Yu-Gi-Oh e Pokémon entram depois, no mesmo molde.

## Como funciona

```
API  ->  raw  ->  bronze  ->  silver  ->  views do Prisma  ->  backend
```

| Camada | O que é |
|---|---|
| raw | arquivo bruto da API, do jeito que veio (`etl/data/raw`) |
| bronze | o mesmo dado em tabela, sem tratar (`bronze.scryfall_cards`) |
| silver | dado tratado, sem duplicar, com upsert (`silver.card` e `silver.card_price`) |
| views | `cards` e `card_prices` no banco do app, só leem a silver (sem copiar dado) |

O ETL decide sozinho se faz carga **full** (primeira vez) ou **incremental** (depois). Se a fonte não mudou desde a última carga, ele não baixa nada.

Tudo roda em **um único MySQL local**, com estes bancos:

| Banco | Quem usa |
|---|---|
| `deck_it_db` | backend (Prisma): usuários, coleção, jogos e as views das cartas |
| `ops` | ETL: controle das cargas (`sync_log`) |
| `bronze` | ETL |
| `silver` | ETL |

## Estrutura

```
Deck-it/
  db/setup.sql      cria os bancos e o usuário (roda uma vez)
  etl/              pipeline em Python
  backend/          API + Prisma
```

## Requisitos

- MySQL 8.0 ou mais novo, rodando em `127.0.0.1:3306`
- Python 3.10 ou mais novo
- Node.js e npm
- Prisma **7** (já está no `package.json`; não usar o 8, que ainda é release candidate)

## Rodando do zero

A ordem importa: o backend cria views em cima da silver, então o ETL precisa criar as tabelas **antes** das migrations do Prisma.

### 1. Banco

Com o MySQL ligado (no Mac: `brew services start mysql`), rode na raiz do projeto:

```bash
mysql -u root -p < db/setup.sql
```

Isso cria os 4 bancos e o usuário `deckit` (senha `deckit`). É só para ambiente local, na nuvem as senhas mudam.

Para conferir:

```bash
mysql -h 127.0.0.1 -P 3306 -u deckit -pdeckit -e "SHOW DATABASES;"
```

Tem que aparecer `deck_it_db`, `ops`, `bronze` e `silver`.

### 2. ETL

```bash
cd etl
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python3 run.py --init-db         # cria as tabelas do ETL
python3 run.py --game mtg        # carga do Magic
```

A primeira carga baixa o arquivo inteiro da Scryfall (algumas centenas de MB) e leva alguns minutos. Dá para acompanhar de outro terminal:

```bash
tail -f logs/pipeline.log
```

No final tem que aparecer `carga concluida`.

### 3. Backend

```bash
cd backend
cp .env.example .env             # preencha PORT, JWT_* etc.
npm install
npx prisma migrate deploy        # aplica as migrations (inclui as views)
npx prisma generate
```

Cadastre o jogo. Sem isso as views ficam vazias, **sem dar erro**. O `slug` tem que ser igual ao `game` da silver (`mtg`, depois `ygo` e `pokemon`):

```bash
mysql -h 127.0.0.1 -P 3306 -u deckit -pdeckit deck_it_db -e "
INSERT INTO games (slug, name, source_api)
VALUES ('mtg', 'Magic: The Gathering', JSON_OBJECT('provider', 'scryfall'));"
```

Para conferir se as views estão lendo a silver:

```bash
mysql -h 127.0.0.1 -P 3306 -u deckit -pdeckit -e "
SELECT COUNT(*) FROM deck_it_db.cards;
SELECT COUNT(*) FROM silver.card;"
```

Os dois números têm que ser iguais. Depois é só subir o backend (veja o script no `package.json`, normalmente `npm run dev`).

## Uso no dia a dia

Atualizar as cartas (pode rodar quando quiser, só baixa se a Scryfall publicou arquivo novo):

```bash
cd etl && source .venv/bin/activate
python3 run.py --game mtg
```

Forçar uma carga full de novo:

```bash
python3 run.py --game mtg --mode full
```

Ver as últimas cargas:

```sql
SELECT load_id, load_type, status, records_bronze, started_at, error_message
FROM ops.sync_log ORDER BY started_at DESC LIMIT 5;
```

Se uma carga for interrompida (Ctrl+C, internet caiu), é só rodar o mesmo comando de novo: ele retoma de onde parou, sem baixar tudo outra vez.

## Problemas comuns

**`Access denied for user 'deckit'`**
Faltou rodar o `db/setup.sql`.

**`Can't connect to MySQL server` / `Connection refused`**
O MySQL não está ligado. No Mac: `brew services start mysql`.

**`CERTIFICATE_VERIFY_FAILED` no ETL (macOS)**
O Python não achou os certificados. Rode `python3 -m pip install --upgrade certifi` e, se precisar, o `Install Certificates.command` que vem na pasta do Python em `/Applications`. Se estiver em VPN ou antivírus que intercepta conexão, teste desligando.

**`The datasource.url property is required` (Prisma)**
O `backend/.env` não existe ou está sem `DATABASE_URL`. O arquivo precisa se chamar `.env` e estar dentro de `backend/`.

**`npx prisma` tentando baixar a versão 8**
Você está fora da pasta `backend`. Entre nela e confira com `npx prisma -v` (tem que mostrar 7.x).

**Erro no Prisma ao criar a migration (`migrate dev`)**
Na nossa base o `migrate dev` quebra por causa de um bug do motor do Prisma. Use `npx prisma migrate deploy` para aplicar e, se precisar criar uma migration nova, escreva a pasta e o `migration.sql` à mão.

**`Table 'silver.card' doesn't exist` ao aplicar as migrations**
O ETL ainda não criou a silver. Rode `python3 run.py --init-db` antes.

**View `cards` vazia**
Ou o ETL ainda não rodou, ou falta o jogo em `games` (veja o passo do seed acima).

## Observações

- Os `.env` não vão para o git. Cada pessoa copia o `.env.example` de cada pasta.
- O histórico de preços (`silver.card_price`) ganha uma linha por carta por dia, então cresce rápido. Vale decidir mais pra frente se mantemos tudo ou só uma parte.
- Cartas "de arte" (`art_series`), tokens e emblemas também ficam na silver. O filtro é feito no app, pelo `layout` dentro de `attributes`.