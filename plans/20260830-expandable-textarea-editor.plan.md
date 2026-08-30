# テンプレートプロンプト欄・回答欄への拡張エディター機能追加

## 目的と背景

現在、テンプレート作成画面の「プロンプトテンプレート」欄と、案件詳細画面の「質問への回答」欄は、通常サイズの`Textarea`で入力する形になっており、記入時にランが小さく編集しづらい。各欄の右下付近に「拡張」ボタンを設置し、押下すると大きなテキストエリアを持つモーダルが開いて編集できるようにする。モーダルの中と外（元のテキストエリア）は常に同じ内容を表示し、食い違いが発生しない状態を実現する。

## 前提

以下の内容で異議がなければこの前提で進める。

- 対象は次の2箇所のみ。
  1. `app/src/features/admin-templates/components/TemplateDetailScreen/PromptTemplateEditor.tsx`（プロンプトテンプレート欄、単一テキストエリア）
  2. `app/src/features/stages/components/StageWorkspace/StageQuestionForm.tsx`（質問への回答欄、`stage.questions`の数だけ繰り返し描画されるテキストエリア）
- `ExecutionModeToggle.tsx`の`pasteContent`欄（生成物本文の貼り付け欄）はスコープ外。今回は一切触らない。
- feature間import禁止のため、2箇所で共通利用するUIパーツは`app/src/components/`配下に「種類別フォルダ」として切り出す。配置は`app/src/components/textarea/ExpandableTextarea.tsx`とする（`table/` `card/` `button/`と同じ命名パターン）。
- **モーダル内外の一致方式**：モーダルの中と外で別々のローカルドラフトstateを持たず、両方とも親から渡された同一の`value`/`onChange`をそのままバインドする（単一の真実の源）。モーダルは値のコピーを保持しないため、構造的に「常に一致」が保証され、保存/キャンセルの分岐ロジックも不要になる。この方式を採用する（ユーザー要望「モーダルの中と外で記述している内容を一致させる」に対して最もシンプルかつ確実な実装）。
- モーダルはshadcn/uiの`Dialog`（`app/src/components/ui/dialog.tsx`）をそのまま利用し、独自のオーバーレイ実装は作らない。閉じる手段はDialog標準のXボタン／Escape／オーバーレイクリックのみとし、独自の「保存」「キャンセル」ボタンは追加しない（真実の源が1つのため不要）。
- 拡張ボタンのアイコンは`lucide-react`の`Maximize2`を使う（プロジェクトの`lucide-react`にexport済みであることを確認済み）。
- 既存のバリデーション（zod: `stageTemplateSchema` / `stageAnswersFormSchema`）・保存フロー（`useApiAction`経由の`putStageTemplate` / `postAnswers`等）・`handleQuestionAdded`のプレースホルダー自動挿入ロジックには一切手を加えない。あくまで入力体験（モーダル）の追加のみ。
- `StageQuestionForm.tsx`側は質問数分ループするため、`ExpandableTextarea`はループ内でそのまま複数回使用する（1インスタンス＝1モーダルの独立状態。使い回さない）。
- 日本語文字列は`app/src/constants/messages.ts`経由。共通コンポーネント自身が使う汎用文言（拡張ボタンのaria-label等）は`messages.common`配下に追加する。各画面固有のモーダルタイトルは、呼び出し側で既存の`messages.adminTemplates.promptTemplateLabel`（admin-templates側）や画面内で既に組み立てている質問テキスト（stages側、`${question.order}. ${question.text}`）を再利用し、新規メッセージキーの追加は最小限にする。
- 色はCSS変数経由（Tailwindのテーマトークン、`text-muted-foreground`等の既存トークンを使う。ハードコード色は使わない）。
- `'use client'`は`ExpandableTextarea.tsx`自身に付ける（Radix Dialogを使うクライアント専用コンポーネントであり、既存の親コンポーネントのみに`'use client'`を付ける原則の例外として、共有コンポーネント自体をクライアント境界にする。呼び出し側の親（`TemplateDetailScreen.tsx` / `StageWorkspace.tsx`）は既に`'use client'`済みのため問題ない）。

## サブタスク

- **ST-1: 共通コンポーネント`ExpandableTextarea`の作成**
  - 内容: `app/src/components/textarea/ExpandableTextarea.tsx`を新規作成する。props例：`id?: string`, `value: string`, `onChange: (value: string) => void`, `modalTitle: string`, `rows?: number`（インライン表示時の行数）, `placeholder?: string`, `monospace?: boolean`（trueならインライン・モーダル両方に`font-mono`系スタイルを適用）, `className?: string`（インラインの`Textarea`にマージする追加クラス。サイズ指定等呼び出し側の既存指定を吸収するため）。内部構造：`relative`なラッパー内に既存styleのインライン`Textarea`＋右下に`absolute`配置した`Maximize2`アイコンボタン（`variant="ghost" size="icon"`程度、`type="button"`）、クリックで`open` stateを`true`にし`Dialog`を開く。`Dialog`内は`DialogHeader`+`DialogTitle`（`modalTitle`を表示）+ 大きめの`Textarea`（`rows`を大きく、`h-[60vh]`程度、`resize-none`）。モーダル内`Textarea`の`value`/`onChange`は、ラッパーが受け取った`value`/`onChange`prop をそのまま渡す（ローカルドラフトstateを作らない）。開閉状態のみコンポーネント内`useState`で管理する。`messages.common`に拡張ボタンのaria-label文言（例：`expandableTextarea: { expandButtonAriaLabel: '拡大して編集' }`）を追加し、ハードコード日本語を使わない。関数宣言の1行上に一行コメントを付ける（プロジェクト規約）。
  - 完了条件: `app/src/components/textarea/ExpandableTextarea.tsx`が存在し、`value`/`onChange`/`modalTitle`を受け取ってインラインの拡張ボタン付きテキストエリアとモーダルを描画する。モーダル内テキストエリアの`onChange`が親コンポーネントに渡された`onChange`を直接呼び出しており、独自のローカルドラフトstate（コピー）を持たないことがコード上確認できる。`app/src/constants/messages.ts`の`common`配下に本コンポーネント用のaria-label文言が追加されている。
  - 検証手段: `Read`でファイル内容を確認し、propsの型定義・`useState`の用途（開閉フラグのみであること）・モーダル内`Textarea`の`value`/`onChange`バインド先をコード上で照合する。日本語文字列がコンポーネント内に直書きされていないことを目視確認する。
  - 影響範囲: `app/src/components/textarea/ExpandableTextarea.tsx`（新規）, `app/src/constants/messages.ts`（`common`配下に追記）

- **ST-2: admin-templates側（プロンプトテンプレート欄）への適用**（ST-1完了後）
  - 内容: `app/src/features/admin-templates/components/TemplateDetailScreen/PromptTemplateEditor.tsx`内の`Textarea`を`ExpandableTextarea`に置き換える。既存の`className="field-sizing-fixed h-96 overflow-y-auto font-mono text-[12.5px] leading-relaxed"`のサイズ指定はインライン側に引き継ぎ、`monospace`をtrueにする。`modalTitle`には`messages.adminTemplates.promptTemplateLabel`を渡す。`value`/`onChange`は既存の`TemplateDetailScreen.tsx`から渡される`promptTemplate`/`setPromptTemplate`をそのまま使う（呼び出し元の変更は不要な想定。propsの型が変わらないため）。
  - 完了条件: `PromptTemplateEditor.tsx`が`ExpandableTextarea`を利用するように変更されている。`TemplateDetailScreen.tsx`側の`handleQuestionAdded`によるプレースホルダー自動挿入（`setPromptTemplate`呼び出し）のロジックは変更されていない（diffに現れない）。
  - 検証手段: `Read`でファイル差分を確認。`git diff -- app/src/features/admin-templates/components/TemplateDetailScreen/TemplateDetailScreen.tsx`が変更なし（0行差分）であることを確認（呼び出し元インターフェースが変わらない設計であるため）。
  - 影響範囲: `app/src/features/admin-templates/components/TemplateDetailScreen/PromptTemplateEditor.tsx`

- **ST-3: stages側（質問への回答欄）への適用**（ST-1完了後、ST-2と並行実施可）
  - 内容: `app/src/features/stages/components/StageWorkspace/StageQuestionForm.tsx`の`stage.questions.map(...)`ループ内の`Textarea`を`ExpandableTextarea`に置き換える。`id={question.id}`（既存の`<Label htmlFor={question.id}>`とのひも付けを維持するため必須）、`value={answers[question.id] ?? ''}`、`onChange`は既存の`setAnswers`更新ロジックをそのまま使う、`placeholder`は既存の`messages.stages.questionForm.answerPlaceholder`を維持、`modalTitle`には`` `${question.order}. ${question.text}` ``（既存`Label`表示と同じ文字列）を渡す。`monospace`は指定しない（プレーンテキストのため）。
  - 完了条件: `StageQuestionForm.tsx`が`ExpandableTextarea`を利用するように変更されている。質問が複数ある場合に、各行の拡張ボタン・モーダルが独立して動作する構造（`.map()`内でコンポーネントをそのまま複数回使用しており、モーダルを使い回すグローバルな単一状態になっていない）であることがコード上確認できる。`<Label htmlFor={question.id}>`との対応関係が維持されている。
  - 検証手段: `Read`でファイル内容を確認し、`.map()`内での配置・`id`/`htmlFor`の対応・`onChange`の更新ロジックが変更前と同一であることを照合する。
  - 影響範囲: `app/src/features/stages/components/StageWorkspace/StageQuestionForm.tsx`

- **ST-4: 静的検証・実ブラウザ動作確認**（ST-2・ST-3完了後）
  - 内容: 型チェック・Lintを実行し、実際に開発サーバー上で両画面の拡張ボタン→モーダル編集→反映を確認する。
  - 完了条件: `tsc --noEmit`がエラー0件で完了する。`eslint`（プロジェクトのlintスクリプト）がエラー0件で完了する（featureをまたぐimportのESLintルール違反が出ないこと含む）。実ブラウザで以下が目視確認できる：(1) テンプレート詳細画面のプロンプトテンプレート欄右下に拡張ボタンが表示され、押下でモーダルが開き大きなテキストエリアで編集でき、モーダルを閉じると元の欄に編集内容が反映されている、(2) 案件詳細画面の質問回答欄（複数質問がある工程）で、各質問ごとに独立した拡張ボタンが表示され、ある質問のモーダルで編集した内容が他の質問の回答欄に影響しない、かつモーダルを閉じずに入力した時点で元のテキストエリアの表示も同時に更新されている（リアルタイム一致）。
  - 検証手段: `cd app && npx tsc --noEmit` / `cd app && npx eslint .`（プロジェクトのlint実行コマンドに合わせる。`package.json`の`scripts.lint`があればそれを使う）をコマンド実行し出力を確認。ブラウザでの目視確認（開発者本人またはverifierが手動操作）。目視確認が必要な項目は「目視確認」と明記して報告する。
  - 影響範囲: なし（検証のみ。コード変更はしない）

## やらないこと

- `ExecutionModeToggle.tsx`の`pasteContent`欄（生成物貼り付け欄）への拡張ボタン追加
- モーダル内でのリッチテキスト編集・Markdownプレビュー・シンタックスハイライト等、単純な「大きいテキストエリア」を超える機能追加
- 既存のバリデーションスキーマ（`stageTemplateSchema` / `stageAnswersFormSchema`）や保存API呼び出しロジックの変更
- モーダルに独自の「保存」「キャンセル」ボタンを追加すること（真実の源を1つにする設計方針のため不要と判断）
- `PromptTemplateEditor.tsx` / `StageQuestionForm.tsx`以外のテキストエリアへの横展開
- テストコードの追加（プロジェクト規約でv1では書かない）

## 要確認

なし（既存の設計方針・スコープで判断可能な範囲のため）。

## 進捗ログ

- ST-1: `app/src/components/textarea/ExpandableTextarea.tsx`を新規作成。`messages.common.expandableTextarea.expandButtonAriaLabel`を追加。完了。
- ST-2: `PromptTemplateEditor.tsx`を`ExpandableTextarea`利用に変更。`TemplateDetailScreen.tsx`は無変更。完了。
- ST-3: `StageQuestionForm.tsx`の質問ループ内`Textarea`を`ExpandableTextarea`に置換（`id`/`htmlFor`対応維持）。完了。
- ST-4: `npx tsc --noEmit`・`npm run lint`ともにエラー0件。実ブラウザで以下を目視確認済み：
  - テンプレート詳細画面のプロンプトテンプレート欄：拡張ボタン→モーダルで末尾に追記→モーダルを閉じてもインライン欄に反映され、「テンプレートを保存」ボタンが有効化された（変更検知も正常）
  - 案件詳細画面（レビュー工程）の質問回答欄：質問1の拡張ボタン→モーダルで追記→モーダルを閉じずに背後のインライン欄がリアルタイムで同期。質問2以降には影響なし（各行が独立して動作）
  - 確認用の入力内容は保存せずページ離脱（DBへの反映なし）
  - 全ST完了。
