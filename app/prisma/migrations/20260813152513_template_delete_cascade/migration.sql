-- DropForeignKey
ALTER TABLE "prompt_templates" DROP CONSTRAINT "prompt_templates_template_version_id_fkey";

-- DropForeignKey
ALTER TABLE "quality_gate_items" DROP CONSTRAINT "quality_gate_items_template_version_id_fkey";

-- DropForeignKey
ALTER TABLE "question_templates" DROP CONSTRAINT "question_templates_template_version_id_fkey";

-- DropForeignKey
ALTER TABLE "template_versions" DROP CONSTRAINT "template_versions_template_id_fkey";

-- AddForeignKey
ALTER TABLE "template_versions" ADD CONSTRAINT "template_versions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_templates" ADD CONSTRAINT "question_templates_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_gate_items" ADD CONSTRAINT "quality_gate_items_template_version_id_fkey" FOREIGN KEY ("template_version_id") REFERENCES "template_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

