---
name: bestof
description: Generate multiple independent candidate solutions to the same non-obvious decision and have them judged, instead of committing to the first idea. Use for design/approach choices where a single pass isn't clearly the best answer — architecture decisions, non-trivial algorithm choices, or anything worth comparing before committing.
allowed-tools: Agent, Read
---

`.claude/CLAUDE.md`の §1 実行フローにおける、重い判断が必要な箇所で使う補助フロー。

## 手順

1. **問題と完了条件を明確にする**：何を比較するのか、どの完了条件を満たす必要があるかを1〜2行で書き出す
2. **候補案を並列生成する**：`BESTOF_N`件（`.claude/CLAUDE.md`の§C。既定3）の独立した案を作る
   - それぞれ異なる切り口・前提を与える（同じ指示を3回投げても差が出ない。「シンプルさ優先」「既存パターンとの一貫性優先」「拡張性優先」のように軸を変える等）
   - 実装を伴う比較なら、実際に別々に実装してから比較する（コードを書かずに「案」だけ比較すると、実装してみて初めて分かる問題を見逃す）
3. **judgeを起動する**：`judge`サブエージェント（`.claude/agents/judge.md`）に、元の問題・完了条件と、全候補案への参照を渡す
4. **判定を受け取り、採用する**：judgeの判定を元に1つを選ぶ。決めきれないとjudgeが報告した場合は、トレードオフをユーザーに提示して判断を仰ぐ

## 注意

- コストが高い（素の1回に対しておよそ4倍）。§0ゲートで「重い判断」と判定した箇所にだけ使う。通常の実装判断にまで使わない
- 生成した候補のうち採用しなかったものは、計画ファイルの進捗ログか却下理由と一緒に一言残しておく（同じ比較を後で繰り返さないため）
