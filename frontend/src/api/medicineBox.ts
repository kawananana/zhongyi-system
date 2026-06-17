import { request } from '@/utils/request'

export interface MedicineBoxToggleResult {
  isCollected: boolean
  favoriteId?: number | null
}

export function toggleMedicineBox(herbId: number, action: 'add' | 'remove') {
  return request<MedicineBoxToggleResult>({
    url: '/user/medicine-box/toggle',
    method: 'post',
    data: { herbId, action },
  })
}

export function fetchMedicineBoxStatus(herbIds: number[]) {
  if (!herbIds.length) return Promise.resolve({} as Record<number, boolean>)
  return request<Record<number, boolean>>({
    url: '/user/medicine-box/status',
    method: 'post',
    data: { herbIds },
  })
}
