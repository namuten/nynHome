package com.crochub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            // Safe initialization guard for Firebase to bypass uncatchable plugin runtime crashes 
            // when running on local emulators/devices that do not possess 'google-services.json' assets.
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
            }
        } catch (Exception e) {
            android.util.Log.e("CrocHubFirebase", "Firebase auto-initialization safely bypassed: " + e.getMessage());
        }
    }
}
