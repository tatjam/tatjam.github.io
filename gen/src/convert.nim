# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Invoking typst for the conversion and storing posts / categories

import std/[paths, json, strformat, dirs, tables, times, strutils]
import posts, typst, templates

const contentDir = Path("content/")

proc loadPost*(cat: Category, postPath: Path): LoadedPost =
  echo "\tconverting " & string(postPath)
  let post = postPath.extractFilename

  let contents = postPath.runTypst()
  let metadata = postPath.runTypstMetadata()

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

proc loadPosts*(cat: Category, basePath: Path): seq[LoadedPost] =
  echo "converting " & string(cat)
  for kind, post in walkDir(basePath, relative = true, checkDir = true):
    if kind != pcFile:
      continue

    let (_, _, ext) = post.splitFile
    if ext != ".typ":
      continue

    let postPath = contentDir / Path(cat) / post
    result.add cat.loadPost(postPath)

func templatePost*(
    post: LoadedPost, prev: LoadedPost, next: LoadedPost, theme: PostTemplate
): TemplatedPost =
  TemplatedPost(
    targetFilename: Path(&".{post.url}"), contents: theme.apply(post, prev, next)
  )

func templatePosts*(posts: seq[LoadedPost], theme: PostTemplate): seq[TemplatedPost] =
  for i in 0 ..< posts.len:
    let prev = max(i - 1, 0)
    let next = min(i + 1, posts.len - 1)
    result.add(posts[i].templatePost(posts[prev], posts[next], theme))

func templateCatPage*(
    cat: Category,
    posts: OrderedTable[Category, seq[LoadedPost]],
    theme: IndexTemplate,
    listing: PostTemplate,
): string =
  theme.apply(listing, cat, posts)

proc loadAll*(): OrderedTable[Category, seq[LoadedPost]] =
  for kind, category in walkDir(contentDir, relative = true, checkDir = true):
    if kind != pcDir:
      continue

    let path = contentDir / category
    result[Category(category)] = Category(category).loadPosts(path)

func templateAll*(
    loaded: OrderedTable[Category, seq[LoadedPost]], theme: Theme
): OrderedTable[Category, seq[TemplatedPost]] =
  for cat, posts in loaded:
    result[cat] = posts.templatePosts(theme.postTheme)

func templateCatPages*(
    loaded: OrderedTable[Category, seq[LoadedPost]], theme: Theme
): OrderedTable[Category, string] =
  for cat, posts in loaded:
    result[cat] = cat.templateCatPage(loaded, theme.categoryTheme, theme.listingTheme)

func templateIndex*(
    loaded: OrderedTable[Category, seq[LoadedPost]], theme: Theme
): string =
  theme.indexTheme.apply(theme.listingTheme, loaded)
