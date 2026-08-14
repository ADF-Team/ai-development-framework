---
name: checkpoint
description: Re-ground against the active plan during a long or multi-step run to catch drift before it compounds. Use periodically during long EXECUTE stretches (many subtasks, long conversation, or after a context summarization) — not for short tasks.
allowed-tools: Read, Grep
---

`.claude/CLAUDE.md`の §1 実行フローで、長時間ランのドリフトを検知するために使う。

## 手順

1. **計画ファイルを読み直す**：`plans/`配下の、現在進行中のタスクの計画ファイルを最初から読む（要約や記憶に頼らず、実ファイルを読む）
2. **現在地と突き合わせる**：
   - 完了したはずのサブタスク（ST）は、実際に完了条件を満たしているか（`/verify`済みか、あるいは今すぐ簡単に確認できるか）
   - 今取り組んでいる作業は、計画のどのSTに対応しているか。対応しないことをしていないか
   - 「やらないこと」に書いた範囲を越境していないか
3. **ズレを検知したら報告する**：
   - 計画に無い作業をしていた → 一旦止めて、計画に追加すべきか、別タスクとして切り出すべきかユーザーに確認する
   - 計画のSTが粗すぎて実態と合わなくなっていた → 残りのSTを計画ファイル上で分割し直す
   - 特にズレが無ければ「計画通り。ST-Nまで完了、ST-N+1に着手」のように一言確認して続行する

## 調整シグナル（`.claude/CLAUDE.md`の運用調整に使う）

- `/verify`が毎回形式的にPASSしている → 完了条件が甘すぎる。計画の書き方を見直す
- 小さなタスクにまで`/plan`が走っている → §0ゲートの閾値が厳しすぎる
- `/checkpoint`のたびにドリフトが見つかる → 計画の粒度が粗すぎる。STをもっと細かく割る

これらに気づいたら、その場で`.claude/CLAUDE.md`の該当箇所を直接調整してよいとユーザーに提案する。
