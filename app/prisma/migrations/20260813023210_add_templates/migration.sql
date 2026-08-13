-- CreateEnum
CREATE TYPE "stage_key" AS ENUM ('requirements', 'design', 'implementation', 'review', 'security', 'test', 'documentation');

-- CreateTable
CREATE TABLE "templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "published_at" TIMESTAMPTZ,
    "source_published_template_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_version_id" UUID NOT NULL,
    "stage_key" "stage_key" NOT NULL,
    "questions" JSONB NOT NULL,

    CONSTRAINT "question_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_version_id" UUID NOT NULL,
    "stage_key" "stage_key" NOT NULL,
    "template_text" TEXT NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_gate_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_version_id" UUID NOT NULL,
    "stage_key" "stage_key" NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "quality_gate_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_organization_id_idx" ON "templates"("organization_id");

-- CreateIndex
CREATE INDEX "templates_published_at_idx" ON "templates"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "template_versions_template_id_version_key" ON "template_versions"("template_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "question_templates_template_version_id_stage_key_key" ON "question_templates"("template_version_id", "stage_key");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_template_version_id_stage_key_key" ON "prompt_templates"("template_version_id", "stage_key");

-- CreateIndex
CREATE UNIQUE INDEX "quality_gate_items_template_version_id_stage_key_key" ON "quality_gate_items"("template_version_id", "stage_key");

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_source_published_template_id_fkey" FOREIGN KEY ("source_published_template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_templates" ADD CONSTRAINT "question_templates_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_gate_items" ADD CONSTRAINT "quality_gate_items_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
