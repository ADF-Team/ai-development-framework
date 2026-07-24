import { atom } from 'jotai'
import type { UserListItem } from '@/types/User'

export const userListAtom = atom<UserListItem[]>([])
