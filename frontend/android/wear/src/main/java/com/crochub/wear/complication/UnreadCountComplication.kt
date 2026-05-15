package com.crochub.wear.complication

import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService
import com.crochub.wear.data.NotificationStore

class UnreadCountComplication : ComplicationDataSourceService() {
    override fun onComplicationRequest(
        request: ComplicationRequest,
        listener: ComplicationRequestListener
    ) {
        val count = NotificationStore.unreadCount()
        
        val complicationData = ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = count.toString()).build(),
            contentDescription = PlainComplicationText.Builder(text = "미확인 알림 수").build()
        ).build()
        
        listener.onComplicationData(complicationData)
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text = "3").build(),
            contentDescription = PlainComplicationText.Builder(text = "미확인 알림 수 예시").build()
        ).build()
    }
}

interface ComplicationRequestListener {
    fun onComplicationData(complicationData: ComplicationData)
}
