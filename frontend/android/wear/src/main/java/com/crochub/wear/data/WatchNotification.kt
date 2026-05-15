package com.crochub.wear.data

data class WatchNotification(
    val type: String,       // "comment" | "guestbook" | "reply"
    val refId: Int,
    val senderName: String,
    val body: String,
    val timestamp: Long,
    var isRead: Boolean = false,
)

data class QuickAction(
    val actionType: String, // "like" | "reply"
    val refId: Int,
    val body: String = "",
    val token: String = "",
)
