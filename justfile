arch := "x86_64-unknown-linux-musl"
pinned_typst := `cat gen/typst.version`
tools_dir := ".tools"

export PATH := justfile_directory() + "/" + tools_dir + ":" + env_var("PATH")

default:
    @just --list

install-tools:
    #!/bin/sh
    set -e
    mkdir -p "{{tools_dir}}"
    current="$(typst --version 2>/dev/null | cut -d' ' -f2)"
    if [ "$current" = "{{pinned_typst}}" ]; then
        echo "typst {{pinned_typst}} already installed"
        exit 0
    fi
    echo "installing typst {{pinned_typst}} (found: ${current:-none})"
    curl -sL "https://github.com/typst/typst/releases/download/v{{pinned_typst}}/typst-{{arch}}.tar.xz" -o /tmp/typst.tar.xz
    tar -xJf /tmp/typst.tar.xz -C /tmp
    install -m 755 "/tmp/typst-{{arch}}/typst" "{{tools_dir}}/typst"
    rm -rf /tmp/typst.tar.xz /tmp/typst-{{arch}}
    typst --version

[working-directory: 'gen']
build:
    nimble build -d:release

[working-directory: 'gen']
build-debug:
    nimble build -d:debug --stacktrace:on --linetrace:on

site: build
    ./gen/sitegen

site-debug: build-debug
    ./gen/sitegen

watch:
    watchexec -w content -w static -w gen/src -w theme -- just site

watch-debug:
    watchexec -w content -w static -w gen/src -w theme -- just site-debug

serve:
    python3 -m http.server

clean:
    rm -f gen/sitegen
    rm -rf ~/.cache/nim/sitegen_*
