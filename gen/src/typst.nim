# Copyright (C) 2026 tatjam
# SPDX-License-Identifier: GPL-3.0-or-later
# ------------------------------------------
# Util to call typst

import std/[osproc, strutils, paths, strformat, streams, json]
import system/exceptions

proc pinnedTypstVersion(): string =
  readFile("gen/typst.version").strip

proc checkTypstAvailable*() =
  let (outp, code) = execCmdEx("typst --version")
  if code != 0:
    echo "typst not found in PATH; run 'just install-tools'"
    quit(1)

  let parts = outp.strip.split(" ")
  if parts.len < 2 or parts[1] != pinnedTypstVersion():
    echo "expected typst " & pinnedTypstVersion() & " but found: " & outp.strip
    echo "run 'just install-tools'"
    quit(1)

  echo "using ", outp.strip

proc runTypstCommand(args: openArray[string]): string =
  let p = startProcess("typst", "", args, options = {poUsePath})
  result = p.outputStream.readAll()
  let err = p.errorStream.readAll()

  let code = p.waitForExit()

  if code != 0:
    echo err
    raise newException(ValueError, &"Typst failed for invocation 'typst {args}'")

proc runTypst*(file: Path): string =
  runTypstCommand(
    @["compile", "--root", ".", "--features", "html", "--format", "html", $file, "-"]
  )

proc runTypstMetadata*(file: Path): JsonNode =
  parseJson(
    runTypstCommand(
      @[
        "eval",
        "--root",
        ".",
        "--features",
        "html",
        "--format",
        "json",
        "query(<post-meta>).first().value",
        "--in",
        $file,
      ]
    )
  )
