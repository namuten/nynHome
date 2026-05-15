package com.crochub.wear.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.QuickAction
import com.crochub.wear.data.WatchNotification
import com.crochub.wear.data.sendActionToPhone
import kotlinx.coroutines.launch

@Composable
fun NotificationDetailScreen(
    notification: WatchNotification,
    onQuickReplyClick: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    Scaffold(
        timeText = { TimeText() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 12.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            
            Text(
                text = notification.senderName,
                style = MaterialTheme.typography.caption1,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = notification.body,
                style = MaterialTheme.typography.body2
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = {
                        scope.launch {
                            sendActionToPhone(context, QuickAction("like", notification.refId))
                            NotificationStore.markRead(notification.refId)
                            onBack()
                        }
                    },
                    colors = ButtonDefaults.secondaryButtonColors()
                ) {
                    Text("❤️")
                }
                
                Button(
                    onClick = onQuickReplyClick,
                    colors = ButtonDefaults.secondaryButtonColors()
                ) {
                    Text("💬")
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            CompactChip(
                onClick = {
                    NotificationStore.markRead(notification.refId)
                    onBack()
                },
                label = { Text("읽음 처리") }
            )
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
