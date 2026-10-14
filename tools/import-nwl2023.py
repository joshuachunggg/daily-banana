from json import dumps
from pathlib import Path
from urllib.request import urlopen

SOURCE = "https://raw.githubusercontent.com/ililim/liv-word-finder/386e730f774425541173c8f7488c846b1c9d455b/wordlists/nwl2023-words.txt"
words = urlopen(SOURCE).read().decode().splitlines()
assert len(words) == 196601 and all(word.islower() and word.isalpha() for word in words)
Path("dist/nwl2023.json").write_text(dumps(words, separators=(",", ":")))
