package com.crochub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            // Dynamic Reflection initialization guard for Firebase.
            // Bypasses compile-time class dependency errors and ensures smooth builds 
            // without polluting the app's build.gradle dependencies.
            Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
            java.lang.reflect.Method getAppsMethod = firebaseAppClass.getMethod("getApps", android.content.Context.class);
            java.util.List<?> apps = (java.util.List<?>) getAppsMethod.invoke(null, this);
            
            if (apps != null && apps.isEmpty()) {
                java.lang.reflect.Method initializeMethod = firebaseAppClass.getMethod("initializeApp", android.content.Context.class);
                initializeMethod.invoke(null, this);
                android.util.Log.i("CrocHubFirebase", "FirebaseApp initialized dynamically via reflection.");
            }
        } catch (ClassNotFoundException e) {
            android.util.Log.w("CrocHubFirebase", "FirebaseApp SDK class not found on classpath. Bypassing registration safety guard.");
        } catch (Exception e) {
            android.util.Log.e("CrocHubFirebase", "Dynamic Firebase initialization safely bypassed: " + e.getMessage());
        }
    }
}
