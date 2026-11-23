# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Invoking typst for the conversion and storing posts / categories

import std/[paths, dirs, tables, hashes]
import posts, typst

type Category* = distinct string

const contentDir = Path("content/")

proc hash*(cat: Category): Hash =
  string(cat).hash

proc `==`*(a: Category, b: Category): bool =
  return string(a) == string(b)

proc convertPost*(cat: Category, postPath: Path): Post =
  echo "\tconverting " & string(postPath)
  let post = postPath.extractFilename
  let outPath = Path(cat) / post.changeFileExt("html")
  outPath.parentDir.createDir()
  postPath.runTypst(outPath)
  echo "\twrote to " & string(outPath)

proc convert*(cat: Category, basePath: Path): seq[Post] =
  echo "converting " & string(cat)
  for kind, post in walkDir(basePath, relative = true, checkDir = true):
    if kind != pcFile:
      continue

    let (_, _, ext) = post.splitFile
    if ext != ".typ":
      continue

    let postPath = contentDir / Path(cat) / post
    result.add cat.convertPost(postPath)

proc convertAll*(): OrderedTable[Category, seq[Post]] =
  for kind, category in walkDir(contentDir, relative = true, checkDir = true):
    if kind != pcDir:
      continue

    let path = contentDir / category
    result[Category(category)] = Category(category).convert(path)
