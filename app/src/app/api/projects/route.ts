import { NextResponse } from 'next/server'
import type { ProjectListItem } from '@/types/Project'

// TODO: インフラ（Cloud SQL）準備後、getCurrentUserによる認証チェック＋
// lib/services/projects経由でPrismaから取得する実装に置き換える
const MOCK_PROJECTS: ProjectListItem[] = [
  {
    id: 'p1',
    name: 'ECサイトリニューアル',
    overallStatus: 'in_progress',
    currentStage: 'design',
    stageStatuses: {
      requirements: 'completed',
      design: 'in_progress',
      implementation: 'not_started',
      review: 'not_started',
      security: 'not_started',
      test: 'not_started',
      documentation: 'not_started',
    },
    createdAt: '2026-06-01',
  },
  {
    id: 'p2',
    name: '社内問い合わせBot',
    overallStatus: 'in_progress',
    currentStage: 'security',
    stageStatuses: {
      requirements: 'completed',
      design: 'completed',
      implementation: 'completed',
      review: 'completed',
      security: 'in_progress',
      test: 'not_started',
      documentation: 'not_started',
    },
    createdAt: '2026-05-15',
  },
  {
    id: 'p3',
    name: '請求書自動化ツール',
    overallStatus: 'in_progress',
    currentStage: 'requirements',
    stageStatuses: {
      requirements: 'not_started',
      design: 'not_started',
      implementation: 'not_started',
      review: 'not_started',
      security: 'not_started',
      test: 'not_started',
      documentation: 'not_started',
    },
    createdAt: '2026-07-20',
  },
  {
    id: 'p4',
    name: '社内ナレッジ検索',
    overallStatus: 'completed',
    currentStage: 'documentation',
    stageStatuses: {
      requirements: 'completed',
      design: 'completed',
      implementation: 'completed',
      review: 'completed',
      security: 'completed',
      test: 'completed',
      documentation: 'completed',
    },
    createdAt: '2026-03-10',
  },
]

// 案件一覧取得API（現在はモックデータを返す。docs/README.md C2「GET /api/projects」参照）
export async function GET() {
  return NextResponse.json({ projects: MOCK_PROJECTS })
}
