# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Post metadata and state

import std/[os, paths, strformat, times, hashes, json, strutils, algorithm, tables, dirs]
import typst

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

const cacheDir = Path(".cache/sitegen/")

proc cachePaths(cat: Category, postPath: Path): tuple[html, meta: Path] =
  let (_, name, _) = postPath.splitFile()
  let h = $hash(readFile(postPath.string))
  let base = cacheDir / Path(cat) / Path(&"{name}.{h}")
  (Path(&"{base}.html"), Path(&"{base}.json"))

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

proc loadPost*(cat: Category, postPath: Path): LoadedPost =
  let post = postPath.extractFilename
  let (htmlCache, metaCache) = cachePaths(cat, postPath)

  var contents: string
  var metadata: JsonNode

  if fileExists(htmlCache.string) and fileExists(metaCache.string):
    echo "\tusing cache for " & string(postPath)
    contents = readFile(htmlCache.string)
    metadata = parseJson(readFile(metaCache.string))
  else:
    echo "\tconverting " & string(postPath)
    contents = postPath.runTypst()
    metadata = postPath.runTypstMetadata()

    htmlCache.parentDir.createDir()
    writeFile(htmlCache.string, contents)
    writeFile(metaCache.string, $metadata)

  let title = metadata["title"].getStr()
  if title == "":
    raise newException(ValueError, &"Post {postPath} missing title")

  let dateStr = metadata["date"].getStr()
  if dateStr == "":
    raise newException(ValueError, &"Post {postPath} missing date")

  let date = parse(dateStr, "yyyy-MM-dd")

  let summary = metadata["summary"].getStr()
  if summary == "":
    raise newException(ValueError, &"Post {postPath} missing summary")

  let extraHead = metadata["extra-head"].getStr()

  let bodyStart = contents.find("<body>") + 6
  let bodyEnd = contents.rfind("</body>") - 1

  let body = contents.substr(bodyStart, bodyEnd)

  LoadedPost(
    sourceFilename: post,
    body: body,
    title: title,
    cat: cat,
    date: date,
    summary: summary,
    extraHead: extraHead,
  )

proc orderByDate*(posts: var seq[LoadedPost]) =
  posts.sort do(x, y: LoadedPost) -> int:
    cmp(y.date, x.date)

func allPostsSorted*(
    categories: OrderedTable[Category, seq[LoadedPost]]
): seq[LoadedPost] =
  for cat, posts in categories:
    for post in posts:
      result.add(post)

  result.orderByDate()
