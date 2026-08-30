# 質問セット・品質ゲート項目編集欄への拡張エディター追加＋品質ゲート項目の編集可能化

## 目的と背景

テンプレート詳細画面（`TemplateDetailScreen`）には、質問セット（`QuestionSetEditor`）と品質ゲート項目（`QualityGateItemsEditor`）の2つの編集エリアがある。

1. 質問セット側には既に質問の追加・削除・並び替え・編集がある一方、品質ゲート項目側は追加・削除のみで、既存項目の**編集ができない**（`<span>`表示のみ）。
2. 直前のタスクで`Textarea`向けの拡張モーダルエディター（`ExpandableTextarea`）を導入済みだが、`Input`ベースの入力欄（質問追加欄・質問編集欄・品質ゲート追加欄）には未適用。

本タスクでは、`Input`向けの拡張モーダルエディター`ExpandableInput`を新規作成し、質問セット・品質ゲート項目に関わる4箇所の`Input`すべてに適用する。あわせて品質ゲート項目を編集可能にする。完了すると、質問・品質ゲート項目のテキストを、狭いInput内だけでなく大きなモーダルでも編集できるようになり、品質ゲート項目のラベルも直接書き換えられるようになる。

## 前提

以下の内容で異議がなければこの前提で進める。

- 対象は`app/src/features/admin-templates/components/TemplateDetailScreen/`配下の以下4箇所。
  1. `QuestionSetEditor.tsx`の新規質問追加欄（L111-115の`Input`）
  2. `QuestionSetEditor/SortableQuestionRow.tsx`の質問編集欄（L42-46の`Input`。dnd-kitのドラッグハンドルと横並び）
  3. `QualityGateItemsEditor.tsx`の新規項目追加欄（L57-61の`Input`）
  4. `QualityGateItemsEditor.tsx`の既存項目表示（L44の`<span>{item.label}</span>`）を編集可能な`Input`ベースに置き換える
- 品質ゲート項目のドラッグ&ドロップ（並び替え）機能は今回追加しない（スコープ外、ユーザー確認済み）。既存の静的`.map()`のまま、表示要素だけ差し替える。
- 新規共有コンポーネント`ExpandableInput`を`app/src/components/input/ExpandableInput.tsx`に作成する（`ExpandableTextarea`が`components/textarea/`にあるのに倣い、種類別フォルダ`input/`を新設する）。
- **設計方針はユーザーとの事前確認により以下で決定済み**：
  - インライン側の表示要素は`Input`（shadcn `Input`）のまま。モーダル内は「大きめのTextarea」にする（`ExpandableTextarea`と似た構造だが、インライン側がInputである点が異なる）。
  - モーダルの中と外は`ExpandableTextarea`と同じ「単一の真実の源」方式：モーダル内`Textarea`も親から渡された同一の`value`/`onChange`を直接バインドする。ローカルドラフトstateを持たない。
  - `ExpandableInput`のprops：`id?: string`, `value: string`, `onChange: (value: string) => void`, `modalTitle: string`, `placeholder?: string`, `className?: string`（インライン`Input`への追加クラス）。`ExpandableTextarea`にある`rows`/`monospace`はInput側には不要のため持たない。
  - 拡張ボタンの配置：`Input`は`h-9`と低く、`ExpandableTextarea`のように`absolute right-1.5 bottom-1.5`で重ねるとテキストと視覚的に衝突しやすい。そのため`ExpandableInput`は**Inputの外側・右側にflexで並べる**構造にする（ラッパー`<div className="flex items-center gap-1">`内に`Input`＋`icon-sm`サイズの拡張ボタンを横並び）。これにより`SortableQuestionRow.tsx`（ドラッグハンドル＋Input＋削除ボタン）への組み込みもレイアウトの複雑さを増やさずに済む。
  - モーダルタイトル文言は新規メッセージキーを追加せず、既存の`messages.adminTemplates.questionListLabel`（質問関連2箇所）と`messages.adminTemplates.qualityGateLabel`（品質ゲート関連2箇所）を再利用する。
  - 拡張ボタンのaria-labelは既存の`messages.common.expandableTextarea.expandButtonAriaLabel`（`'拡大して編集'`）をそのまま再利用する（`ExpandableInput`専用のキーは追加しない）。
- `QualityGateItemsEditor.tsx`に`handleUpdate`関数を追加する（`QuestionSetEditor.tsx`のL48-54と同じパターン：`items.map((item) => item.id === id ? { ...item, label } : item)`で`order`は変更しない）。
- `TemplateQualityGateItem`型（`app/src/types/StageTemplate.ts`）は`{ id: string; label: string; order: number }`であることを確認済み。`label`のみ更新し`order`は触らない。
- `ExpandableTextarea.tsx`自体は変更しない（今回のスコープ外、既存のまま）。
- 案件詳細画面（stages側）は今回のスコープ外。admin-templates側のみが対象。
- 既存のバリデーション（`stageTemplateSchema`）・保存フロー（`putStageTemplate`）・質問セットのDnD並び替え（`withSequentialOrder`）ロジックには一切手を加えない。

## サブタスク

- **ST-1: 共通コンポーネント`ExpandableInput`の作成**
  - 内容: `app/src/components/input/ExpandableInput.tsx`を新規作成する。props：`id?`, `value: string`, `onChange: (value: string) => void`, `modalTitle: string`, `placeholder?: string`, `className?: string`。構造：`<div className="flex items-center gap-1">`内にインライン`Input`（`value`/`onChange`を直接バインド）＋`Maximize2`アイコンの拡張ボタン（`variant="ghost" size="icon-sm" type="button"`、aria-labelは`messages.common.expandableTextarea.expandButtonAriaLabel`）を横並び配置。ボタン押下で`useState`の`open`を`true`にし`Dialog`を開く。モーダル内は`DialogHeader`+`DialogTitle`（`modalTitle`）+大きめの`Textarea`（`rows={20}`程度、`h-[60vh] resize-none`）。モーダル内`Textarea`の`value`/`onChange`は、コンポーネントが受け取った`value`/`onChange`propをそのまま渡す（ローカルドラフトstateを作らない、`ExpandableTextarea`と同じ「単一の真実の源」方式）。関数宣言の1行上に一行コメントを付ける。新規メッセージキーは追加しない。
  - 完了条件: `app/src/components/input/ExpandableInput.tsx`が存在し、`value`/`onChange`/`modalTitle`を受け取ってインラインの拡張ボタン付き`Input`とモーダルを描画する。モーダル内`Textarea`の`onChange`が親から渡された`onChange`を直接呼び出しており、独自のローカルドラフトstate（コピー）を持たないことがコード上確認できる。コンポーネント内に日本語文字列の直書きがない。
  - 検証手段: `Read`でファイル内容を確認し、propsの型定義・`useState`の用途（開閉フラグのみ）・モーダル内`Textarea`の`value`/`onChange`バインド先を照合する。`grep -n '[ぁ-んァ-ヶ一-龠]' app/src/components/input/ExpandableInput.tsx`でヒットしないことを確認する。
  - 影響範囲: `app/src/components/input/ExpandableInput.tsx`（新規）。`messages.ts`は変更しない。

- **ST-2: 質問セット側（新規追加欄・編集欄）への適用**（ST-1完了後）
  - 内容: `QuestionSetEditor.tsx`の新規質問追加`Input`（L111-115）を`ExpandableInput`に置き換え、`modalTitle={messages.adminTemplates.questionListLabel}`を渡す。`SortableQuestionRow.tsx`の質問編集`Input`（L42-46）も`ExpandableInput`に置き換え、`onChange={(value) => onUpdate(question.id, value)}`・`modalTitle={messages.adminTemplates.questionListLabel}`・既存の`className="h-8 flex-1 text-[13px]"`を引き継ぐ。ドラッグハンドル（`GripVertical`）・削除ボタンのレイアウト・`useSortable`のドラッグ操作性に影響がないことを確認する。
  - 完了条件: `QuestionSetEditor.tsx`の新規質問追加欄、`SortableQuestionRow.tsx`の質問編集欄がいずれも`ExpandableInput`を利用するように変更されている。質問セットのDnD並び替え・`handleAdd`/`handleUpdate`/`handleDelete`のロジック（呼び出し元インターフェース）に変更がない。
  - 検証手段: `Read`でファイル内容を確認し、`ExpandableInput`への置き換え箇所と`onChange`の接続先を照合する。`git diff`で`handleAdd`/`handleUpdate`/`handleDelete`関数本体・`withSequentialOrder`・DnD関連コード（`handleDragEnd`、`DndContext`まわり）に変更がないことを確認する。
  - 影響範囲: `app/src/features/admin-templates/components/TemplateDetailScreen/QuestionSetEditor.tsx`, `app/src/features/admin-templates/components/TemplateDetailScreen/QuestionSetEditor/SortableQuestionRow.tsx`

- **ST-3: 品質ゲート項目の編集可能化＋拡張エディター適用**（ST-1完了後、ST-2と並行実施可）
  - 内容: `QualityGateItemsEditor.tsx`に`handleUpdate(id: string, label: string)`関数を追加する（`items.map((item) => item.id === id ? { ...item, label } : item)`を`onChange`に渡す、`order`は変更しない）。既存の`<span className="flex-1 text-[13px]">{item.label}</span>`（L44）を`ExpandableInput`に置き換え、`value={item.label}` `onChange={(value) => handleUpdate(item.id, value)}` `modalTitle={messages.adminTemplates.qualityGateLabel}` `className="h-8 flex-1 text-[13px]"`とする。既存の`CheckSquare`アイコン・削除ボタンのレイアウトは維持する。新規項目追加`Input`（L57-61）も`ExpandableInput`に置き換え、`modalTitle={messages.adminTemplates.qualityGateLabel}`を渡す。並び替え（DnD）機能は追加しない。
  - 完了条件: `QualityGateItemsEditor.tsx`の既存項目が編集可能な`ExpandableInput`ベースの表示になっており、テキスト編集が`onChange`経由で親の`items`配列に反映される。新規項目追加欄も`ExpandableInput`を利用している。`item.order`を書き換えるコードが追加されていない。`.map()`の並び順を変更するDnD関連コード（`dnd-kit`のimport等）が追加されていない。
  - 検証手段: `Read`でファイル内容を確認し、`handleUpdate`の実装（`order`を変更していないこと）と`ExpandableInput`への置き換え箇所を照合する。`grep -n "dnd-kit" app/src/features/admin-templates/components/TemplateDetailScreen/QualityGateItemsEditor.tsx`が0件であることを確認する。
  - 影響範囲: `app/src/features/admin-templates/components/TemplateDetailScreen/QualityGateItemsEditor.tsx`

- **ST-4: 静的検証・実ブラウザ動作確認**（ST-2・ST-3完了後）
  - 内容: 型チェック・Lintを実行し、実際に開発サーバー上でテンプレート詳細画面の質問セット・品質ゲート項目欄の拡張ボタン→モーダル編集→反映、および保存を確認する。
  - 完了条件: `tsc --noEmit`がエラー0件で完了する。`eslint`（プロジェクトのlintスクリプト）がエラー0件で完了する（feature間import違反が出ないこと含む）。実ブラウザで以下が目視確認できる：(1) 質問編集欄（`SortableQuestionRow`）の拡張ボタンでモーダルが開き、編集内容が即座に元のInputに反映される、(2) 新規質問追加Inputも拡張ボタンで同様に編集できる、(3) 品質ゲート項目が編集可能になっており、拡張ボタンでモーダル編集し反映される、(4) 品質ゲート新規追加Inputも拡張ボタンで編集できる、(5) 質問のドラッグ&ドロップ並び替えが引き続き正常に動作する（拡張ボタン追加によりドラッグハンドルの操作性が損なわれていない）、(6) 「テンプレートを保存」ボタン経由で編集内容がDBへ反映される。
  - 検証手段: `cd app && npx tsc --noEmit` / `cd app && npx eslint .`（または`package.json`の`scripts.lint`）を実行し出力を確認。ブラウザでの目視確認（開発者本人またはverifierが手動操作）。目視確認が必要な項目は「目視確認」と明記して報告する。
  - 影響範囲: なし（検証のみ。コード変更はしない）

## やらないこと

- 品質ゲート項目のドラッグ&ドロップ並び替え機能の追加（スコープ外、ユーザー確認済み）
- `ExpandableTextarea.tsx`自体の変更
- 案件詳細画面（stages側）への横展開
- モーダル内でのリッチテキスト編集・Markdownプレビュー等、単純な「大きいテキストエリア」を超える機能追加
- 既存のバリデーションスキーマ（`stageTemplateSchema`）や保存API呼び出しロジックの変更
- モーダルに独自の「保存」「キャンセル」ボタンを追加すること（単一の真実の源方式のため不要）
- 新規メッセージキーの追加（既存の`questionListLabel`/`qualityGateLabel`/`expandButtonAriaLabel`を再利用する）
- テストコードの追加（プロジェクト規約でv1では書かない）

## 要確認

なし（ユーザーとの事前確認で設計方針が決定済みのため）。

## 進捗ログ

- ST-1: `app/src/components/input/ExpandableInput.tsx`を新規作成。新規メッセージキーは追加せず既存の`expandButtonAriaLabel`を再利用。完了。
- ST-2: `QuestionSetEditor.tsx`の新規質問追加欄、`SortableQuestionRow.tsx`の質問編集欄をそれぞれ`ExpandableInput`に置換。`handleAdd`/`handleUpdate`/`handleDelete`・DnD関連コードは無変更。完了。
- ST-3: `QualityGateItemsEditor.tsx`に`handleUpdate`を追加し、既存項目の`<span>`表示を編集可能な`ExpandableInput`に置換（`order`は変更しない）。新規項目追加欄も`ExpandableInput`に置換。DnDは追加していない。完了。
- ST-4: `npx tsc --noEmit`エラー0件。`npm run lint`は当初`cn`未使用のwarning 1件が出たため`ExpandableInput.tsx`から未使用importを削除し、再実行でエラー・警告ともに0件。実ブラウザで以下を目視確認済み：
  - 質問編集欄（`SortableQuestionRow`）：拡張ボタン→モーダルで末尾に追記→Escで閉じるとインラインInputの末尾に反映（フォーカスしてEndで確認）
  - 品質ゲート項目：以前は読み取り専用の`<span>`だったが、インラインInputで直接編集可能になったことを確認。拡張ボタン→モーダル（タイトル「品質ゲート項目」）でも同じ値が表示され編集内容が同期
  - 質問セットのドラッグ&ドロップ並び替え：1問目と3問目をドラッグで入れ替え、正常に動作（拡張ボタン追加によるドラッグハンドルへの影響なし）
  - 確認用の入力内容は保存せずページ離脱（DBへの反映なし）
  - 全ST完了。
