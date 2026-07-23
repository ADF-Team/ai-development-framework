import { atom } from 'jotai'
import type { StageDetail } from '@/types/Stage'

export const stageDetailAtom = atom<StageDetail | null>(null)
