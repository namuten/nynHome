package com.crochub.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.google.android.gms.wearable.Node;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.tasks.Tasks;
import java.util.List;

public class DebugWearReceiver extends BroadcastReceiver {
    private static final String TAG = "DebugWear";

    @Override
    public void onReceive(Context ctx, Intent intent) {
        new Thread(() -> {
            try {
                List<Node> nodes = Tasks.await(
                    Wearable.getNodeClient(ctx).getConnectedNodes()
                );
                Log.d(TAG, "Connected nodes: " + nodes.size());
                for (Node n : nodes) {
                    Log.d(TAG, "  Node: id=" + n.getId() + " name=" + n.getDisplayName() + " nearby=" + n.isNearby());
                }
                if (nodes.isEmpty()) {
                    Log.w(TAG, "No connected watch nodes found");
                } else {
                    String action = intent.getStringExtra("action");
                    if ("send".equals(action)) {
                        byte[] payload = "{\"type\":\"test\",\"refId\":\"1\",\"senderName\":\"Debug\",\"body\":\"Hello Watch\",\"timestamp\":0}".getBytes();
                        for (Node n : nodes) {
                            Tasks.await(Wearable.getMessageClient(ctx).sendMessage(n.getId(), "/crochub/notification", payload));
                            Log.d(TAG, "Sent test message to " + n.getDisplayName());
                        }
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error", e);
            }
        }).start();
    }
}
