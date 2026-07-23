import { atom } from 'jotai'
import type { ProjectListItem } from '@/types/Project'

export const projectsAtom = atom<ProjectListItem[]>([])
