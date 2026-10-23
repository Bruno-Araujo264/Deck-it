import logging
import sys
from pathlib import Path

log = logging.getLogger("pipeline")


def setup(level=logging.INFO):
    Path("logs").mkdir(exist_ok=True)
    fmt = logging.Formatter("%(asctime)s %(levelname)-7s %(message)s", "%Y-%m-%d %H:%M:%S")
    root = logging.getLogger()
    root.setLevel(level)
    root.handlers.clear()
    for h in (logging.StreamHandler(sys.stdout), logging.FileHandler("logs/pipeline.log", encoding="utf-8")):
        h.setFormatter(fmt)
        root.addHandler(h)
    logging.getLogger("urllib3").setLevel(logging.WARNING)