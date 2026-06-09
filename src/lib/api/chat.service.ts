import { apiClient } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message?: string
  messages?: ChatMessage[]
}

export interface ChatResponse {
  reply: string
  products?: Array<{
    id: number
    name: string
    price: number
    stock: number
    images: string[]
    description?: string
  }>
}

export function sendChatMessage(body: ChatRequest) {
  return apiClient<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}
