package com.crochub.wear

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.WatchNotification
import com.google.gson.Gson

class DebugNotifReceiver : BroadcastReceiver() {
    private val gson = Gson()

    override fun onReceive(context: Context, intent: Intent) {
        val json = intent.getStringExtra("json")
        if (json != null) {
            try {
                val notification = gson.fromJson(json, WatchNotification::class.java)
                NotificationStore.add(notification)
                Log.d("DebugNotifReceiver", "Injected notification refId=${notification.refId}, total=${NotificationStore.notifications.value.size}")
            } catch (e: Exception) {
                Log.e("DebugNotifReceiver", "Parse error: $e")
            }
        } else {
            val fake = WatchNotification(
                refId = (System.currentTimeMillis() % 10000).toInt(),
                type = "comment",
                body = "에뮬레이터 직접 주입 테스트입니다.",
                senderName = "디버그",
                timestamp = System.currentTimeMillis(),
                isRead = false
            )
            NotificationStore.add(fake)
            Log.d("DebugNotifReceiver", "Injected fake notification refId=${fake.refId}, total=${NotificationStore.notifications.value.size}")
        }
    }
}
