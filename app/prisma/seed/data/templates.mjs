import { STAGES, buildPromptTemplate } from './adfStages.mjs'

const TEMPLATE_ID = '00000000-0000-0000-0000-000000000101'
const TEMPLATE_VERSION_ID = '00000000-0000-0000-0000-000000000102'
const TEMPLATE_TITLE = 'ADF標準テンプレート'

// 工程キー → question_templates/prompt_templates/quality_gate_items のUUID接尾辞（テンプレート版は常に1件のため固定IDでよい）
const STAGE_ROW_SUFFIX = {
  requirements: '1',
  design: '2',
  implementation: '3',
  review: '4',
  security: '5',
  test: '6',
  documentation: '7',
}

// ADF自身の開発で実際に使っている7工程の質問セット・プロンプトテンプレート・品質ゲート項目を「ADF標準テンプレート」として作成し、公開状態にする
// （docs/README.md A7/A8を正本とする内容。projects.mjsの案件シードはこのテンプレートを参照する）
export async function seedTemplates(prisma, { seedCompany, systemAdmin }) {
  const template = await prisma.template.upsert({
    where: { id: TEMPLATE_ID },
    update: {},
    create: {
      id: TEMPLATE_ID,
      organizationId: seedCompany.id,
      title: TEMPLATE_TITLE,
      publishedAt: new Date(),
    },
  })

  await prisma.templateVersion.upsert({
    where: { id: TEMPLATE_VERSION_ID },
    update: {},
    create: {
      id: TEMPLATE_VERSION_ID,
      templateId: template.id,
      title: TEMPLATE_TITLE,
      version: 1,
      createdBy: systemAdmin.id,
    },
  })

  for (const stage of STAGES) {
    const suffix = STAGE_ROW_SUFFIX[stage.key]

    await prisma.questionTemplate.upsert({
      where: { id: `00000000-0000-0000-0000-00000000011${suffix}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000011${suffix}`,
        templateVersionId: TEMPLATE_VERSION_ID,
        stageKey: stage.key,
        questions: stage.questions,
      },
    })

    await prisma.promptTemplate.upsert({
      where: { id: `00000000-0000-0000-0000-00000000012${suffix}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000012${suffix}`,
        templateVersionId: TEMPLATE_VERSION_ID,
        stageKey: stage.key,
        templateText: buildPromptTemplate(stage),
      },
    })

    await prisma.qualityGateItem.upsert({
      where: { id: `00000000-0000-0000-0000-00000000013${suffix}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-00000000013${suffix}`,
        templateVersionId: TEMPLATE_VERSION_ID,
        stageKey: stage.key,
        items: stage.qualityGateItems,
      },
    })
  }

  return { adfTemplate: template }
}
