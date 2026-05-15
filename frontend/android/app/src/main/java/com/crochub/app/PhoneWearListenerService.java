package com.crochub.app;

import android.util.Log;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class PhoneWearListenerService extends WearableListenerService {
    private static final String TAG = "PhoneWearListener";
    private static final String ACTION_PATH = "/crochub/action";
    private static final String API_BASE = "https://nynhome.duckdns.org/api";

    @Override
    public void onMessageReceived(MessageEvent event) {
        if (!ACTION_PATH.equals(event.getPath())) return;

        new Thread(() -> {
            try {
                String json = new String(event.getData(), StandardCharsets.UTF_8);
                JSONObject action = new JSONObject(json);
                String actionType = action.getString("actionType");
                int refId = action.getInt("refId");
                String authToken = action.optString("token", "");

                if ("like".equals(actionType)) {
                    postToApi("/comments/" + refId + "/like", "{}", authToken);
                } else if ("reply".equals(actionType)) {
                    String replyBody = action.getString("body");
                    JSONObject payload = new JSONObject();
                    payload.put("reply", replyBody);
                    postToApi("/comments/" + refId + "/reply", payload.toString(), authToken);
                }
            } catch (Exception e) {
                Log.e(TAG, "액션 처리 실패", e);
            }
        }).start();
    }

    private void postToApi(String path, String body, String token) throws Exception {
        URL url = new URL(API_BASE + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }
        int code = conn.getResponseCode();
        Log.d(TAG, "API 응답: " + code + " for " + path);
        conn.disconnect();
    }
}
