#!/usr/bin/env bash
# src: ./scripts/prepare-code-msg.sh
# @(#) : prepare commit message using codegpt if no message exists
#
# Copyright (c) 2025 atsushifx <http://github.com/atsushifx>
# Released under the MIT License.
# https://opensource.org/licenses/MIT

set -euCo pipefail

## Constants
readonly REPO_ROOT="$(git rev-parse --show-toplevel)"

## Default message file
GIT_COMMIT_MSG=".git/COMMIT_EDITMSG"

## Allow custom message file as first argument
if [[ $# -ge 1 && -n "$1" ]]; then
  GIT_COMMIT_MSG="$1"
fi

## 関数: 既存ﾒ・bｾZｰ[ｼﾞWがあるかﾁ`ｪFｯbｸN
has_existing_message() {
  local file="$1"
  grep -vE '^\s*(#|$)' "$file" | grep -q '.'
}

## 関数: diff と log をまとめる
make_context_block() {
  echo "----- GIT LOGS -----"
  git log --oneline -10 || echo "No logs available."
  echo "----- END LOGS -----"
  echo
  echo "----- GIT DIFF -----"
  git diff --cached || echo "No diff available."
  echo "----- END DIFF -----"
}

## 関数: Claude agents を呼ぶ
generate_commit_message() {
  local full_output
  full_output=$({
    echo "--with-markers"
    echo
    cat .claude/agents/commit-message.md
    echo
    make_context_block
  } | codex exec --model gpt-5-codex
  )

  # コミットメッセージ部分のみを抽出し、不要なプレフィックスを除去
  echo "$full_output" | \
    sed 's/^GIT コミットメッセージ:[[:space:]]*//g' | \
    sed -n '/=== COMMIT MESSAGE START ===/,/=== COMMIT MESSAGE END ===/p' | \
    sed '1d;$d' | \
    sed '/^[[:space:]]*$/d'
}

generate_commit_by_codegpt() {
  dotenvx run -- \
    codegpt \
    --config ./configs/codegpt.config.yaml \
    commit \
    --no_confirm --preview \
    --file "$GIT_COMMIT_MSG"
}

## Main
cd "$REPO_ROOT"

if has_existing_message "$GIT_COMMIT_MSG"; then
  echo "✦ Detected existing Git-generated commit message. Skipping Claude agents."
  exit 0
fi

# commit
# rm -f ${GIT_COMMIT_MSG}
# generate_commit_message > $GIT_COMMIT_MSG
generate_commit_by_codegpt
