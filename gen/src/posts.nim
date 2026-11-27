# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Post metadata and state

import std/[paths, strformat, times, hashes]

type Category* = distinct string

proc `$`*(c: Category): string =
  c.string

proc hash*(cat: Category): Hash =
  string(cat).hash

proc `==`*(a: Category, b: Category): bool =
  return string(a) == string(b)

proc url*(cat: Category): string =
  return &"/category-{cat}.html"

type LoadedPost* {.requiresInit.} = object
  sourceFilename*: Path
  cat*: Category
  # Raw body as rendered by Typst
  body*: string

  title*: string
  date*: DateTime
  summary*: string
  extraHead*: string

proc url*(p: LoadedPost): string =
  let (_, name, _) = p.sourceFilename.splitFile()
  &"/{p.cat}/{name}.html"

type TemplatedPost* {.requiresInit.} = object
  sourceFilename*: Path
  targetFilename*: Path
  contents*: string
