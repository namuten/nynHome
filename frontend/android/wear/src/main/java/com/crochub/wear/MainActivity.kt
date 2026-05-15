package com.crochub.wear

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.WatchNotification
import com.crochub.wear.presentation.NotificationDetailScreen
import com.crochub.wear.presentation.NotificationListScreen
import com.crochub.wear.presentation.QuickReplyScreen
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.Wearable
import com.google.gson.Gson

class MainActivity : ComponentActivity() {
    private val gson = Gson()
    private val messageListener = MessageClient.OnMessageReceivedListener { event ->
        Log.d("MainActivity", "MessageClient received path=${event.path} size=${event.data.size}")
        if (event.path == "/crochub/notification") {
            try {
                val notification = gson.fromJson(String(event.data), WatchNotification::class.java)
                NotificationStore.add(notification)
                Log.d("MainActivity", "Notification added via MessageClient, total=${NotificationStore.notifications.value.size}")
            } catch (e: Exception) {
                Log.e("MainActivity", "Parse error", e)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        Wearable.getMessageClient(this).addListener(messageListener)
        Log.d("MainActivity", "MessageClient listener registered")

        setContent {
            val navController = rememberSwipeDismissableNavController()
            val notifications by NotificationStore.notifications.collectAsState()

            SwipeDismissableNavHost(
                navController = navController,
                startDestination = "list"
            ) {
                composable("list") {
                    NotificationListScreen(
                        onNotificationClick = { notification ->
                            navController.navigate("detail/${notification.refId}")
                        }
                    )
                }
                
                composable("detail/{refId}") { backStackEntry ->
                    val refId = backStackEntry.arguments?.getString("refId")?.toIntOrNull() ?: 0
                    val notification = notifications.find { it.refId == refId }
                    
                    if (notification != null) {
                        NotificationDetailScreen(
                            notification = notification,
                            onQuickReplyClick = {
                                navController.navigate("quick_reply/$refId")
                            },
                            onBack = {
                                navController.popBackStack()
                            }
                        )
                    } else {
                        navController.popBackStack()
                    }
                }
                
                composable("quick_reply/{refId}") { backStackEntry ->
                    val refId = backStackEntry.arguments?.getString("refId")?.toIntOrNull() ?: 0
                    QuickReplyScreen(
                        refId = refId,
                        onReplySent = {
                            navController.popBackStack("list", inclusive = false)
                        }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Wearable.getMessageClient(this).removeListener(messageListener)
    }
}
