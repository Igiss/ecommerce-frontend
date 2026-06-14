import { apiClient } from "./client"

export interface UserNotification {
  _id: string
  userId: string
  title: string
  message: string
  type: string
  metadata?: Record<string, any>
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export function getMyNotifications() {
  return apiClient<UserNotification[]>("/notifications/me")
}

export function markNotificationRead(id: string) {
  return apiClient<UserNotification>(`/notifications/${id}/read`, {
    method: "PATCH",
  })
}

export function markAllNotificationsRead() {
  return apiClient<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
  })
}
