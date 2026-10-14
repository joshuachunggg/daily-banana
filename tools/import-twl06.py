from importlib.util import module_from_spec, spec_from_loader
from json import dumps
from pathlib import Path
from urllib.request import urlopen

SOURCE = "https://raw.githubusercontent.com/fogleman/twl06/7e1ca3f9924018027408573ccdc7f22900f144d4/twl.py"
module = module_from_spec(spec_from_loader("twl", loader=None))
exec(compile(urlopen(SOURCE).read(), SOURCE, "exec"), module.__dict__)
Path("dist/twl06.json").write_text(dumps(list(module.iterator()), separators=(",", ":")))
