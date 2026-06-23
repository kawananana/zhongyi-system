import { request } from '@/utils/request'

export interface StudyChatMessagePayload {
  role: 'user' | 'assistant'
  content: string
}

export interface StudyChatPayload {
  message: string
  history?: StudyChatMessagePayload[]
  constitutionContext?: string
}

export interface StudyChatResult {
  reply: string
}

export function sendStudyChatMessage(payload: StudyChatPayload) {
  return request<StudyChatResult>({
    url: '/study/chat',
    method: 'post',
    data: payload,
    timeout: 90000,
  })
}
