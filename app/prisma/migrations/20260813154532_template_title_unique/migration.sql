-- AlterTable（NOT NULL制約を持つ新規カラムを既存データに安全に追加するため、Nullable→バックフィル→NOT NULL化の順で行う）
ALTER TABLE "templates" ADD COLUMN "title" VARCHAR(255);

-- 既存テンプレートについて、現在有効な版（バージョン番号最大）のタイトルをバックフィルする
UPDATE "templates" t
SET "title" = tv.title
FROM "template_versions" tv
WHERE tv.template_id = t.id
  AND tv.version = (
    SELECT MAX(version) FROM "template_versions" WHERE template_id = t.id
  );

ALTER TABLE "templates" ALTER COLUMN "title" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "templates_organization_id_title_key" ON "templates"("organization_id", "title");
