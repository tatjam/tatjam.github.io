# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Invoking typst for the conversion and storing posts / categories

import std/[paths, strformat, dirs, tables, times]
import posts, themes

const contentDir = Path("content/")

func themePost*(
    post: LoadedPost, prev: LoadedPost, next: LoadedPost, theme: PostTheme
): ThemedPost =
  ThemedPost(
    targetPath: Path(&"{post.targetPath}"), contents: theme.apply(post, prev, next)
  )

func templatePosts*(posts: seq[LoadedPost], theme: PostTheme): seq[ThemedPost] =
  for i in 0 ..< posts.len:
    let prev = max(i - 1, 0)
    let next = min(i + 1, posts.len - 1)
    result.add(posts[i].themePost(posts[prev], posts[next], theme))

func templateCatPage*(
    cat: Category,
    posts: OrderedTable[Category, seq[LoadedPost]],
    theme: IndexTheme,
    listing: PostTheme,
): string =
  theme.apply(listing, cat, posts)

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

  result.orderByDate()

proc loadAll*(): OrderedTable[Category, seq[LoadedPost]] =
  for kind, category in walkDir(contentDir, relative = true, checkDir = true):
    if kind != pcDir:
      continue

    let path = contentDir / category
    result[Category(category)] = Category(category).loadPosts(path)

func templateAll*(
    loaded: OrderedTable[Category, seq[LoadedPost]], theme: Theme
): OrderedTable[Category, seq[ThemedPost]] =
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

func genRss*(loaded: OrderedTable[Category, seq[LoadedPost]]): string =
  result = """
  <rss version="2.0">
    <channel>
    <title>Tatjam's Blog</title>
    <description>Tatjam's Blog</description>
    <link>https://tatjam.github.io</link>
    <atom:link href="https://tatjam.github.io/feed.xml" rel="self" type="application/rss+xml"/>
  """

  let allPosts = loaded.allPostsSorted()

  for post in allPosts:
    let datefmt = format(post.date, "yyyy-MM-dd")
    result.add(
      &"""
      <item>
        <title>{post.title}</title>
        <link>https://tatjam.github.io/{post.url}</link>
        <guid>https://tatjam.github.io/{post.url}</guid>
        <pubDate>{datefmt} 00:00:00 GMT</pubDate>
        <description>
          {post.summary}
        </description>
        <category>
          {post.cat}
        </category>
      </item>
    """
    )

  result.add(
    """
    </channel>
    </rss>
  """
  )
