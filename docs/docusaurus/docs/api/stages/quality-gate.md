---
sidebar_position: 6
sidebar_label: POST /quality-gate
title: "POST /api/projects/{id}/stages/{stageKey}/quality-gate"
---

# `POST /api/projects/{id}/stages/{stageKey}/quality-gate`

<ApiEndpoint method="POST" path="/api/projects/{id}/stages/{stageKey}/quality-gate" />

送信された`checkedItemIds`は、通過判定の結果によらず**毎回`quality_gate_result`に上書き保存する**（チェック状態がリロードで失われないようにするため）。

## Request

```json
{ "checkedItemIds": ["item1", "item2", "item3"] }
```

## Response 200（全項目通過・次工程がある場合）

```json
{ "passed": true, "nextStage": "design", "projectCompleted": false }
```

## Response 200（全項目通過・最終工程＝ドキュメントの場合）

```json
{ "passed": true, "nextStage": null, "projectCompleted": true }
```

最終工程を通過した場合、`nextStage`は`null`となり、`projects.overall_status`が`completed`に更新される（次工程の`project_stages`レコードは存在しないため作成しない）。

## Response 200（未通過）

```json
{ "passed": false, "missingItemIds": ["item4"] }
```

未通過の場合も`quality_gate_result`への保存は行われる（`project_stages.status`は`quality_gate_pending`のまま維持）。

`checkedItemIds`は`postQualityGateSchema`（`src/schemas/api/postQualityGateSchema.ts`）で検証する（文字列配列であること。空配列も許可される＝全項目未チェックとして扱われる）。

## エラー

- `404`：案件・工程が存在しない（他組織の案件を含む）
- `422`：`checkedItemIds`が文字列配列でない場合

「未通過」（一部項目が未チェック）はエラーではなく`200`で`{ passed: false, ... }`を返す点に注意（上記「Response 200（未通過）」参照）。

## ロジック概要

1. `project.template_id`から`template_versions`の最新`version`を取得し、その`id`＋`stage_key`に紐づく`quality_gate_items`の項目一覧を取得
2. リクエストの`checkedItemIds`を`quality_gate_result`に上書き保存する（通過判定の結果によらず、常に保存する）
3. 全項目が`checkedItemIds`に含まれているか判定
4. **全項目通過の場合**：該当`project_stages.status`を`completed`に更新
   - 次の`stage_key`が存在する場合：次工程の`project_stages.status`を`in_progress`に更新し、`projects.current_stage`を更新して`{ passed: true, nextStage: 次stage_key, projectCompleted: false }`を返す
   - 次の`stage_key`が存在しない（最終工程＝documentation）場合：`projects.overall_status`を`completed`に更新し、`{ passed: true, nextStage: null, projectCompleted: true }`を返す
5. **一部未達成の場合**：`project_stages.status`は`quality_gate_pending`のまま維持し、`{ passed: false, missingItemIds: [...] }`を返す（`quality_gate_result`の保存は手順2で完了済み）
