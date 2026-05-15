package com.crochub.wear.data

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow

object NotificationStore {
    val notifications = MutableStateFlow<List<WatchNotification>>(emptyList())

    fun add(notification: WatchNotification) {
        val current = notifications.value.toMutableList()
        current.add(0, notification)
        if (current.size > 20) current.removeAt(current.size - 1)
        notifications.value = current
    }

    fun markRead(refId: Int) {
        notifications.value = notifications.value.map {
            if (it.refId == refId) it.copy(isRead = true) else it
        }
    }

    fun unreadCount() = notifications.value.count { !it.isRead }
}

class WatchMessageService : WearableListenerService() {
    private val gson = Gson()

    override fun onMessageReceived(event: MessageEvent) {
        if (event.path != "/crochub/notification") return
        try {
            val json = String(event.data)
            val notification = gson.fromJson(json, WatchNotification::class.java)
            NotificationStore.add(notification)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
