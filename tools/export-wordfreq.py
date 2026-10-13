import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, "/private/tmp/daily-banana-wordfreq")
from wordfreq import get_frequency_dict

words = get_frequency_dict("en", "large")
export = sorted(
    (word, round(math.log(frequency), 4))
    for word, frequency in words.items()
    if len(word) >= 3 and re.fullmatch(r"[a-z]+", word)
)
Path("dist/wordfreq-en-large.json").write_text(json.dumps(export, separators=(",", ":")), encoding="utf-8")
print(f"Exported {len(export)} English words.")
