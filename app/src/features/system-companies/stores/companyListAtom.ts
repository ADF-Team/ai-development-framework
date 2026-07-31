import { atom } from 'jotai'
import type { CompanyListItem } from '@/types/Company'

export const companyListAtom = atom<CompanyListItem[]>([])
