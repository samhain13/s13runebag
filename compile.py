#! /usr/bin/env python
"""
    This script generates the static HTML page that contains the rune
    definitions, SVG rune drawings, and other stuff contained in the HTML
    assets directory.
"""
import os
import json
import tempita
from page_settings import strings

context = dict()

# We'll just include our page settings in the context.
for k, v in strings.items():
    context[k] = v

# Include the script and the styles.
for x in ["styles.css", "script.js"]:
    with open(os.path.join("html-assets", x)) as f:
        context[x.split(".")[0]] = f.read().decode("utf-8")

# Include the rune definitions.
context["runes"] = []
for d in sorted(os.listdir("rune-defs")):
    with open(os.path.join("rune-defs", d)) as f:
        context["runes"].append(json.loads(f.read().decode("utf-8")))

# Do the template substitutions.
with open("html-assets/main-template.html") as t:
   page = tempita.sub(t.read().decode("utf-8"), **context)

# Write to file.
with open("out.html", "w") as f:
    f.write(page.encode("utf-8"))
