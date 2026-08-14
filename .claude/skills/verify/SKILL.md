---
name: verify
description: Independently verify a just-completed subtask against its stated completion criteria before marking it done. Use after implementing any subtask from a plan created via /plan, or any time you're about to claim something works without having checked it with a fresh, unbiased pass.
allowed-tools: Agent, Read, Bash
---

`.claude/CLAUDE.md`の §1 実行フローにおけるVERIFYフェーズを実行する。

## 手順

1. **完了条件を確認する**：対象サブタスク（計画ファイルの該当ST）の「完了条件」「検証手段」を確認する
2. **verifierを起動する**：`verifier`サブエージェント（`.claude/agents/verifier.md`）に、以下**だけ**を渡す
   - 完了条件・検証手段
   - 成果物への参照（変更したファイルパス、実行すべきコマンド）

   実装の経緯・意図・「たぶんこうだと思う」という所感は渡さない。verifierは独立した文脈で判定する必要がある
3. **判定を受け取る**：
   - **PASS**：計画ファイルの進捗ログに記録し、次のサブタスクへ進む
   - **条件付きPASS**：③（目視要）の項目をユーザーに提示し、確認を仰ぐ。ユーザーの確認が取れたらPASS扱いにする
   - **FAIL**：不一致の内容を元に修正する。修正後、再度このスキルで`/verify`する
4. **連続FAILの扱い**：同じサブタスクで`MAX_FAIL`（`.claude/CLAUDE.md`の§C。既定2）回連続FAILしたら、同じ方向で修正を続けない。`/plan`に戻り、計画自体（サブタスクの分割・完了条件の妥当性）を見直す

## 注意

- verifierに実装時の会話履歴やこれまでのやり取りをそのまま渡さない。渡すのは完了条件と成果物への参照のみ
- verifierの判定を都合よく解釈し直さない（②〔機械照合NG〕をPASS扱いにする、等）
- 単発の小さな修正（typo等）にまで毎回このスキルを使う必要はない。ツール出力（tsc/eslint等）で十分確認できる場合はそれで済ませてよい
