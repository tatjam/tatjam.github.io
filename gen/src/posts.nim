# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Post metadata and state

import std/paths

type Post* = object
  title*: string
  date*: string
  summary*: string
  extraHead*: string

  htmlPath*: Path
