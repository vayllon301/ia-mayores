export interface Notification {
  id: string
  reminder_id: string
  message: string
  created_at: string
}

export async function fetchUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const res = await fetch(`/api/notifications/${userId}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.notifications || []
  } catch {
    return []
  }
}

export async function dismissReminder(reminderId: string): Promise<void> {
  await fetch(`/api/reminders/${reminderId}/dismiss`, { method: 'PATCH' })
}

export async function snoozeReminder(reminderId: string, minutes = 10): Promise<void> {
  await fetch(`/api/reminders/${reminderId}/snooze`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes }),
  })
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
}
