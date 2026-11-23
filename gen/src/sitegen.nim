# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Entrypoint

import std/[osproc, strutils]
import convert

proc pinnedTypstVersion(): string =
  readFile("gen/typst.version").strip

proc main() =
  echo "sitegen: hello world"

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

  convertAll()

when isMainModule:
  main()
