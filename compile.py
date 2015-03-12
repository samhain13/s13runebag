#! /usr/bin/env python
"""
    This script generates the static HTML page that contains the rune
    definitions, SVG rune drawings, and other stuff contained in the HTML
    assets directory.
"""
import os
import sys
import json
import tempita

app_title = "Samhain13's RuneBag Compiler"
templates_list = sorted([x[:-5].replace("-template", "") \
    for x in os.listdir("html-assets") \
    if "-template" in x and x.endswith(".html")])
usage = """
%s

Usage:
    ./compile.py -show-templates             : show available templates
    ./compile.py --template=<template_name>  : compile a template
""" % app_title

# We want 2 sys.argv items everytime. The last item must contain a valid option.
if len(sys.argv) != 2:
    sys.exit(usage)

if sys.argv[1] == "-show-templates":
    message = "%s\n\nAvailable Templates:\n    %s\n" % \
        (app_title, "\n    ".join(templates_list))
    sys.exit(message)

if not sys.argv[1].startswith("--template="):
    sys.exit(usage)

# Validate the requested template.
template_name = sys.argv[1].split("=")[-1]
if not template_name:
    sys.exit(usage)
if template_name not in templates_list:
    sys.exit(usage)

# Here we go.
source_template = "html-assets/%s-template.html" % template_name
compiled_template = "compiled/%s.html" % template_name
context = dict()

# Include the script and the styles.
for x in ["styles.css", "script.js", "copyright.html", "extras.html"]:
    with open(os.path.join("html-assets", x)) as f:
        context[x.split(".")[0]] = f.read().decode("utf-8")

# Include the rune definitions.
context["runes"] = []
for d in sorted(os.listdir("rune-defs")):
    with open(os.path.join("rune-defs", d)) as f:
        context["runes"].append(json.loads(f.read().decode("utf-8")))

# Do the template substitutions.
with open(source_template) as t:
   page = tempita.sub(t.read().decode("utf-8"), **context)

# Write to file.
with open(compiled_template, "w") as f:
    f.write(page.encode("utf-8"))

sys.exit("%s\n\nApplication has been compiled and saved to:\n    %s\nBye.\n" % \
    (app_title, compiled_template))

