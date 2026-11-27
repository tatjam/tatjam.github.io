# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Entrypoint

import std/[osproc, strutils, tables, paths, strformat, dirs]
import convert, typst, templates, posts

# unhandledExceptionHook = proc(e: ref Exception) {.nimcall.} =
#   if e of Defect:
#     echo e.getStackTrace()

proc loadTheme(): Theme =
  result.postTheme = PostTemplate(readFile("theme/post.html"))
  result.categoryTheme = IndexTemplate(readFile("theme/category.html"))
  result.indexTheme = IndexTemplate(readFile("theme/index.html"))
  result.listingTheme = PostTemplate(readFile("theme/list.html"))

proc main() =
  echo "converting posts..."

  checkTypstAvailable()
  let loaded = loadAll()
  let theme = loadTheme()

  echo "templating posts..."
  let templated = loaded.templateAll(theme)

  echo "templating category pages..."
  let templatedCat = loaded.templateCatPages(theme)

  echo "templating index..."
  let templatedIndex = loaded.templateIndex(theme)

  echo "writing posts..."
  for cat, posts in templated:
    for post in posts:
      writeFile(post.targetFilename.string, post.contents)
      echo &"\twrote {post.targetFilename.absolutePath.string}"

  echo "writing category pages..."
  for cat, contents in templatedCat:
    let path = Path(&".{cat.url}")
    path.parentDir.createDir()
    writeFile(path.string, contents)
    echo &"\twrote {path.absolutePath.string}"

  echo "writing index..."
  let indexPath = Path(&"index.html")
  writeFile(indexPath.string, templatedIndex)
  echo &"\twrote {indexPath.absolutePath.string}"

when isMainModule:
  main()
