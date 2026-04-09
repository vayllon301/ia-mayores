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
    if (!res.ok) {
      console.error('[notifications] fetchUnreadNotifications failed:', res.status, await res.text().catch(() => ''))
      return []
    }
    const data = await res.json()
    return data.notifications || []
  } catch (err) {
    console.error('[notifications] fetchUnreadNotifications error:', err)
    return []
  }
}

export async function dismissReminder(reminderId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reminders/${reminderId}/dismiss`, { method: 'PATCH' })
    if (!res.ok) {
      console.error('[reminders] dismissReminder failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[reminders] dismissReminder error:', err)
    return false
  }
}

export async function snoozeReminder(reminderId: string, minutes = 10): Promise<boolean> {
  try {
    const res = await fetch(`/api/reminders/${reminderId}/snooze`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes }),
    })
    if (!res.ok) {
      console.error('[reminders] snoozeReminder failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[reminders] snoozeReminder error:', err)
    return false
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
    if (!res.ok) {
      console.error('[notifications] markNotificationRead failed:', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[notifications] markNotificationRead error:', err)
    return false
  }
}

export async function fetchReminders(userId: string): Promise<Reminder[]> {
  try {
    const res = await fetch(`/api/reminders/user/${userId}`)
    if (!res.ok) {
      console.error('[reminders] fetchReminders failed:', res.status, await res.text().catch(() => ''))
      return []
    }
    const data = await res.json()
    return data.reminders || []
  } catch (err) {
    console.error('[reminders] fetchReminders error:', err)
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
    if (!res.ok) {
      console.error('[reminders] createReminder failed:', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json()
    return data.reminder || null
  } catch (err) {
    console.error('[reminders] createReminder error:', err)
    return null
  }
}
