# Card pipeline (raw -> bronze -> silver, MySQL 8)

    pip install -r requirements.txt
    cp .env.example .env        # ajuste DB e USER_AGENT
    python run.py --init-db
    python run.py --game mtg    # 1a vez: full. Depois: so roda se o bulk da Scryfall mudou

- raw:    data/raw/game=mtg/load_type=.../dt=.../<load_id>/default-cards.json.gz + _manifest.json
- bronze: bronze.scryfall_cards (append-only; no incremental so entram cartas novas ou alteradas, por hash)
- silver: card, card_set, card_mtg, card_face, card_image, card_price (upsert por chave; preco = historico)
- ops.sync_log controla full/incremental e permite retomar uma carga interrompida
