-- CreateEnum
CREATE TYPE "deliverable_generation_method" AS ENUM ('manual', 'ai_executed');

-- CreateTable
CREATE TABLE "deliverables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_stage_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "generation_method" "deliverable_generation_method" NOT NULL,
    "version" INTEGER NOT NULL,
    "updated_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deliverables_project_stage_id_idx" ON "deliverables"("project_stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "deliverables_project_stage_id_version_key" ON "deliverables"("project_stage_id", "version");

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_project_stage_id_fkey" FOREIGN KEY ("project_stage_id") REFERENCES "project_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

