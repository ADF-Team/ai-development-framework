import { atom } from 'jotai'
import type { StageTemplateDetail } from '@/types/StageTemplate'

export const stageTemplateAtom = atom<StageTemplateDetail | null>(null)
