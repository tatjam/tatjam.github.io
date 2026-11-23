# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Entrypoint

import std/[osproc, strutils]
import convert, typst

proc pinnedTypstVersion(): string =
  readFile("gen/typst.version").strip

proc main() =
  checkTypstAvailable()
  let categories = convertAll()

when isMainModule:
  main()
