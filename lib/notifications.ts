export interface Notification {
  id: string
  reminder_id: string
  message: string
  created_at: string
}

export interface Reminder {
  id: string
  message: string
  remind_at: string
  recurrence: string | null
  created_by: string
  status: string
}

export async function fetchUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const res = await fetch(`/api/notifications/user/${userId}`)
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

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  try {
    const res = await fetch(`/api/reminders/user/${userId}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.reminders || []
  } catch {
    return []
  }
}

export async function createReminder(
  userId: string,
  message: string,
  remindAt: string,
  recurrence?: string,
): Promise<Reminder | null> {
  try {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        message,
        remind_at: remindAt,
        recurrence: recurrence || null,
        created_by: 'user',
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.reminder || null
  } catch {
    return null
  }
}
