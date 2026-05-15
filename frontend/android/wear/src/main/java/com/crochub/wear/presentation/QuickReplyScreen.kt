package com.crochub.wear.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.*
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.QuickAction
import com.crochub.wear.data.sendActionToPhone
import kotlinx.coroutines.launch

@Composable
fun QuickReplyScreen(
    refId: Int,
    onReplySent: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val listState = rememberScalingLazyListState()
    
    val replies = listOf(
        "고마워요!",
        "곧 답변할게요 😊",
        "감사합니다 🐊",
        "방문해줘서 고마워요!"
    )

    Scaffold(
        timeText = { TimeText() },
        positionIndicator = { PositionIndicator(scalingLazyListState = listState) }
    ) {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            state = listState,
            contentPadding = PaddingValues(top = 32.dp, bottom = 32.dp, start = 8.dp, end = 8.dp)
        ) {
            item {
                Text(
                    text = "빠른 답변 선택",
                    style = MaterialTheme.typography.caption1,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }
            
            items(replies) { reply ->
                Chip(
                    onClick = {
                        scope.launch {
                            sendActionToPhone(context, QuickAction("reply", refId, reply))
                            NotificationStore.markRead(refId)
                            onReplySent()
                        }
                    },
                    label = { Text(reply) },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
