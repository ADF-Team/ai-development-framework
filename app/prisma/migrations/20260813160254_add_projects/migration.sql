-- CreateEnum
CREATE TYPE "project_overall_status" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "project_stage_status" AS ENUM ('not_started', 'in_progress', 'quality_gate_pending', 'completed');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template_id" UUID NOT NULL,
    "current_stage" "stage_key" NOT NULL DEFAULT 'requirements',
    "overall_status" "project_overall_status" NOT NULL DEFAULT 'in_progress',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "stage_key" "stage_key" NOT NULL,
    "status" "project_stage_status" NOT NULL DEFAULT 'not_started',
    "answers" JSONB NOT NULL DEFAULT '{}',
    "generated_prompt" TEXT,
    "quality_gate_result" JSONB NOT NULL DEFAULT '{}',
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "project_stages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_organization_id_idx" ON "projects"("organization_id");

-- CreateIndex
CREATE INDEX "projects_overall_status_idx" ON "projects"("overall_status");

-- CreateIndex
CREATE INDEX "projects_template_id_idx" ON "projects"("template_id");

-- CreateIndex
CREATE INDEX "project_stages_project_id_idx" ON "project_stages"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_stages_project_id_stage_key_key" ON "project_stages"("project_id", "stage_key");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_stages" ADD CONSTRAINT "project_stages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

