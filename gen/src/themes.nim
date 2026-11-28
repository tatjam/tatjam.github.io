# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Filling the theme templates

import posts
import std/[tables, strutils, times, strformat, options]

type PostTheme* = distinct string
type IndexTheme* = distinct string

type Theme* = object
  indexTheme*: IndexTheme
  categoryTheme*: IndexTheme
  postTheme*: PostTheme
  listingTheme*: PostTheme

func navArrow(post: LoadedPost, label, arrow: string): string =
  &"<a href=\"{post.url}\" title=\"{label}: {post.title}\" class=\"nav-arrow\" aria-label=\"{label} post\">{arrow}</a>"

func pagerLink(post: LoadedPost, inner, direction: string): string =
  &"<a href=\"{post.url}\" class=\"pager-link pager-{direction}\">{inner}<strong>{post.title}</strong></a>"

func apply*(
    tmp: PostTheme, post: LoadedPost, prevPost: Option[LoadedPost], nextPost: Option[LoadedPost]
): string =
  let prevArrow = if prevPost.isSome:
      navArrow(prevPost.get, "Previous", "&#9664;")
    else:
      "<span class=\"nav-arrow nav-arrow-empty\" aria-hidden=\"true\">&#9664;</span>"
  let nextArrow = if nextPost.isSome:
      navArrow(nextPost.get, "Next", "&#9654;")
    else:
      "<span class=\"nav-arrow nav-arrow-empty\" aria-hidden=\"true\">&#9654;</span>"
  let prevPager = if prevPost.isSome:
      pagerLink(prevPost.get, "<span>&#9664; previous entry</span>", "prev")
    else:
      "<span class=\"pager-empty\" aria-hidden=\"true\"></span>"
  let nextPager = if nextPost.isSome:
      pagerLink(nextPost.get, "<span>next entry &#9654;</span>", "next")
    else:
      "<span class=\"pager-empty\" aria-hidden=\"true\"></span>"

  result = string(tmp).multiReplace(
      [
        ("<$POST_TITLE>", post.title),
        ("<$POST_URL>", post.url),
        ("<$EXTRA_HEAD>", post.extraHead),
        ("<$CATEGORY_LINK>", post.cat.url),
        ("<$CATEGORY_NAME>", $post.cat),
        ("<$PREV_ARROW>", prevArrow),
        ("<$NEXT_ARROW>", nextArrow),
        ("<$PREV_PAGER>", prevPager),
        ("<$NEXT_PAGER>", nextPager),
        ("<$POST_DATE>", post.date.format("yyyy-MM-dd")),
        ("<$POST_CONTENTS>", post.body),
        ("<$POST_SUMMARY>", post.summary),
      ]
    )

func allCategoriesContent(categories: OrderedTable[Category, seq[LoadedPost]]): string =
  for cat, _ in categories:
    result.add(&"<a href=\"{cat.url}\">{cat}</a>")

func allPostContent(listing: PostTheme, posts: seq[LoadedPost]): string =
  for i in 0 ..< posts.len:
    result.add(listing.apply(posts[i], none(LoadedPost), none(LoadedPost)))

func allPostContent(
    listing: PostTheme, categories: OrderedTable[Category, seq[LoadedPost]]
): string =
  listing.allPostContent(categories.allPostsSorted)

func apply*(
    tmp: IndexTheme,
    listing: PostTheme,
    category: Category,
    categories: OrderedTable[Category, seq[LoadedPost]],
): string =
  let allCats = categories.allCategoriesContent
  let posts = listing.allPostContent(categories[category])

  result = string(tmp).multiReplace(
      [
        ("<$CUR_CAT_NAME>", $category),
        ("<$ALL_CATEGORIES>", allCats),
        ("<$POST_LIST_CAT>", posts),
      ]
    )

func apply*(
    tmp: IndexTheme,
    listing: PostTheme,
    categories: OrderedTable[Category, seq[LoadedPost]],
): string =
  let allCats = categories.allCategoriesContent
  let posts = listing.allPostContent(categories)

  result =
    string(tmp).multiReplace([("<$ALL_CATEGORIES>", allCats), ("<$POST_LIST>", posts)])
