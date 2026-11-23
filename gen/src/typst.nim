# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Util to call typst

import std/[osproc, strutils, paths, strformat]

proc pinnedTypstVersion(): string =
  readFile("gen/typst.version").strip

proc checkTypstAvailable*() =
  let (outp, code) = execCmdEx("typst --version")
  if code != 0:
    echo "typst not found in PATH; run 'just install-tools'"
    quit(1)

  let parts = outp.strip.split(" ")
  if parts.len < 2 or parts[1] != pinnedTypstVersion():
    echo "expected typst " & pinnedTypstVersion() & " but found: " & outp.strip
    echo "run 'just install-tools'"
    quit(1)

  echo "using ", outp.strip

proc runTypst*(file: Path, ofile: Path) =
  let (outp, code) =
    execCmdEx(&"typst compile --root . --features html --format html {file} {ofile}")

  echo outp

  if code != 0:
    var e: ref ValueError
    new(e)
    e.msg = &"Typst failed for {file}"
    raise e
