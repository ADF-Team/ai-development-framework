---
name: plan
description: Decompose a non-trivial task into a verifiable, user-approved plan before implementing. Use when the current task fails the §0 gate check in .claude/CLAUDE.md (irreversible, spans multiple areas, completion criteria unclear, or history of rework in this area) — explicitly via /plan, or proactively before starting such a task.
allowed-tools: Agent, Read, Write, Glob, Grep
---

`.claude/CLAUDE.md`の §1 実行フローにおけるPLANフェーズを実行する。

## 手順

1. **偵察が必要か判断する**：対象領域を最近読んでいない、または初めて触る場合は、領域ごとに`scout`サブエージェント（`.claude/agents/scout.md`）を並列で起動する（Agent toolを複数回、同じメッセージ内で呼ぶ）。既に十分読み込んでいて追加の偵察が不要なら省略してよい
2. **偵察結果を集約する**：各scoutの報告を待つ
3. **計画を作らせる**：`planner`サブエージェント（`.claude/agents/planner.md`）を起動し、以下を渡す
   - タスクの目的・背景（ユーザーの依頼そのもの）
   - scoutの偵察結果（あれば）
   - `PLAN_DIR`は`.claude/CLAUDE.md`の§Cを参照
4. **計画をユーザーに提示する**：plannerが書いた`plans/YYYYMMDD-slug.plan.md`の内容を、そのまま、または要点を絞って提示する。「この計画で進めてよいか」を明示的に尋ねる
5. **承認を待つ**：ユーザーが承認するまでEXECUTE（実装）へ進まない。修正依頼があれば計画ファイルを更新してから再提示する

## 注意

- scoutを並列起動する際は、領域が重ならないように分担を割り振る（同じファイルを2つのscoutに読ませない）
- 既に明白に自明なタスク（§0ゲートでNoが並ぶ）にこのスキルを使わない。ゲート判定自体はこのスキルの外（メインの会話）で行う
- 計画ファイルは`plans/`にコミット対象として残る想定。機密性の高い内容を含む場合は`.claude/CLAUDE.md`の§Cで案内している退避先を使う
