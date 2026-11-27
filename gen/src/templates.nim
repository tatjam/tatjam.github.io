# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Filling the theme templates

import posts
import std/[tables, strutils, algorithm, times, strformat]

type PostTemplate* = distinct string
type IndexTemplate* = distinct string

type Theme* = object
  indexTheme*: IndexTemplate
  categoryTheme*: IndexTemplate
  postTheme*: PostTemplate
  listingTheme*: PostTemplate

proc apply*(
    tmp: PostTemplate, post: LoadedPost, prevPost: LoadedPost, nextPost: LoadedPost
): string =
  string(tmp).multiReplace(
    [
      ("<$POST_TITLE>", post.title),
      ("<$POST_URL>", post.url),
      ("<$EXTRA_HEAD>", post.extraHead),
      ("<$CATEGORY_LINK>", post.cat.url),
      ("<$CATEGORY_NAME>", $post.cat),
      ("<$PREV_POST>", prevPost.url),
      ("<$PREV_POST_TITLE>", prevPost.title),
      ("<$NEXT_POST>", nextPost.url),
      ("<$NEXT_POST_TITLE>", nextPost.title),
      ("<$POST_DATE>", post.date.format("yyyy-MM-dd")),
      ("<$POST_CONTENTS>", post.body),
      ("<$POST_SUMMARY>", post.summary),
    ]
  )

proc allCategoriesContent(categories: OrderedTable[Category, seq[LoadedPost]]): string =
  for cat, _ in categories:
    result.add(&"<a href={cat.url}>{cat}</a>")

proc allPostsSorted(
    categories: OrderedTable[Category, seq[LoadedPost]]
): seq[LoadedPost] =
  for cat, posts in categories:
    for post in posts:
      result.add(post)

  result.sort do(x, y: LoadedPost) -> int:
    cmp(y.date, x.date)

proc allPostContent(listing: PostTemplate, posts: seq[LoadedPost]): string =
  for i in 0 ..< posts.len:
    let prev = max(i - 1, 0)
    let next = min(i + 1, posts.len - 1)
    result.add(listing.apply(posts[i], posts[prev], posts[next]))

proc allPostContent(
    listing: PostTemplate, categories: OrderedTable[Category, seq[LoadedPost]]
): string =
  listing.allPostContent(categories.allPostsSorted)

proc apply*(
    tmp: IndexTemplate,
    listing: PostTemplate,
    category: Category,
    categories: OrderedTable[Category, seq[LoadedPost]],
): string =
  let allCats = categories.allCategoriesContent
  let posts = listing.allPostContent(categories[category])

  string(tmp).multiReplace(
    [
      ("<$CUR_CAT_NAME>", $category),
      ("<$ALL_CATEGORIES>", allCats),
      ("<$POST_LIST_CAT>", posts),
    ]
  )

proc apply*(
    tmp: IndexTemplate,
    listing: PostTemplate,
    categories: OrderedTable[Category, seq[LoadedPost]],
): string =
  let allCats = categories.allCategoriesContent
  let posts = listing.allPostContent(categories)

  string(tmp).multiReplace([("<$ALL_CATEGORIES>", allCats), ("<$POST_LIST>", posts)])
