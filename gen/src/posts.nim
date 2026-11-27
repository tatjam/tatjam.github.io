# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Post metadata and state

import std/[paths, strformat, times, hashes]

type Category* = distinct string

func `$`*(c: Category): string =
  c.string

func hash*(cat: Category): Hash =
  string(cat).hash

func `==`*(a: Category, b: Category): bool =
  string(a) == string(b)

func url*(cat: Category): string =
  &"/category-{cat}.html"

func targetPath*(cat: Category): string =
  &"./category-{cat}.html"

type LoadedPost* = object
  sourceFilename*: Path
  cat*: Category
  # Raw body as rendered by Typst
  body*: string

  title*: string
  date*: DateTime
  summary*: string
  extraHead*: string

func url*(p: LoadedPost): string =
  let (_, name, _) = p.sourceFilename.splitFile()
  &"/{p.cat}/{name}.html"

func targetPath*(p: LoadedPost): string =
  let (_, name, _) = p.sourceFilename.splitFile()
  &"./{p.cat}/{name}.html"

type ThemedPost* = object
  targetPath*: Path
  contents*: string
