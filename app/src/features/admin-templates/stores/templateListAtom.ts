import { atom } from 'jotai'
import type { TemplateSummary } from '@/types/StageTemplate'

export const templateListAtom = atom<TemplateSummary[]>([])
