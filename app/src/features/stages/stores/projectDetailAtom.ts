import { atom } from 'jotai'
import type { ProjectDetail } from '@/types/Project'

export const projectDetailAtom = atom<ProjectDetail | null>(null)
