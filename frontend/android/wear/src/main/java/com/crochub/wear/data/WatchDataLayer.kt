package com.crochub.wear.data

import android.content.Context
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.Wearable
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private val gson = Gson()
private const val ACTION_PATH = "/crochub/action"

suspend fun sendActionToPhone(context: Context, action: QuickAction) {
    withContext(Dispatchers.IO) {
        try {
            val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
            val payload = gson.toJson(action).toByteArray()
            nodes.forEach { node ->
                Tasks.await(
                    Wearable.getMessageClient(context).sendMessage(node.id, ACTION_PATH, payload)
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
