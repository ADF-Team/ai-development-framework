import { atom } from 'jotai'
import type { StageKey } from '@/types/Project'

export const selectedStageKeyAtom = atom<StageKey>('requirements')
