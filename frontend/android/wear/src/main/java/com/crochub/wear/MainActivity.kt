package com.crochub.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.presentation.NotificationDetailScreen
import com.crochub.wear.presentation.NotificationListScreen
import com.crochub.wear.presentation.QuickReplyScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
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
}
