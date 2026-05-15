package com.crochub.app;

import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.tasks.Tasks;
import com.google.android.gms.wearable.Node;
import org.json.JSONObject;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class CrocHubMessagingService extends FirebaseMessagingService {
    private static final String TAG = "CrocHubMsgService";
    private static final String WATCH_PATH = "/crochub/notification";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();
        if (!"true".equals(data.get("watchPriority"))) return;

        try {
            JSONObject payload = new JSONObject();
            payload.put("type", data.getOrDefault("type", ""));
            payload.put("refId", data.getOrDefault("refId", "0"));
            payload.put("senderName", data.getOrDefault("senderName", ""));
            payload.put("body", data.getOrDefault("body", ""));
            payload.put("timestamp", System.currentTimeMillis());

            byte[] bytes = payload.toString().getBytes();
            sendToWearNodes(bytes);
        } catch (Exception e) {
            Log.e(TAG, "워치 전달 실패", e);
        }
    }

    private void sendToWearNodes(byte[] payload) {
        new Thread(() -> {
            try {
                List<Node> nodes = Tasks.await(
                    Wearable.getNodeClient(this).getConnectedNodes()
                );
                for (Node node : nodes) {
                    Tasks.await(
                        Wearable.getMessageClient(this)
                            .sendMessage(node.getId(), WATCH_PATH, payload)
                    );
                    Log.d(TAG, "워치 노드에 전달 완료: " + node.getDisplayName());
                }
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "워치 노드 전달 오류", e);
            }
        }).start();
    }
}
