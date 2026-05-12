package com.crochub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            // Dynamic Reflection initialization guard for Firebase.
            // Completely eliminates compile-time errors and runtime crashes on local emulators.
            Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
            java.lang.reflect.Method getAppsMethod = firebaseAppClass.getMethod("getApps", android.content.Context.class);
            java.util.List<?> apps = (java.util.List<?>) getAppsMethod.invoke(null, this);
            
            if (apps != null && apps.isEmpty()) {
                try {
                    // Try 1: Auto-initialize using native google-services.json assets if present.
                    java.lang.reflect.Method initializeMethod = firebaseAppClass.getMethod("initializeApp", android.content.Context.class);
                    initializeMethod.invoke(null, this);
                    android.util.Log.i("CrocHubFirebase", "FirebaseApp auto-initialized from resources.");
                } catch (Exception initEx) {
                    // Try 2 (Fallback Safeguard): When google-services.json is missing on local testing,
                    // construct dynamic dummy options in memory so that subsequent Push registrations do not fatal-crash.
                    android.util.Log.w("CrocHubFirebase", "google-services.json missing. Crafting dummy options to bypass push registration exceptions.");
                    
                    Class<?> optionsBuilderClass = Class.forName("com.google.firebase.FirebaseOptions$Builder");
                    Object builderInstance = optionsBuilderClass.getDeclaredConstructor().newInstance();
                    
                    java.lang.reflect.Method setApplicationId = optionsBuilderClass.getMethod("setApplicationId", String.class);
                    setApplicationId.invoke(builderInstance, "1:000000000000:android:0000000000000000000000");
                    
                    java.lang.reflect.Method setApiKey = optionsBuilderClass.getMethod("setApiKey", String.class);
                    setApiKey.invoke(builderInstance, "fake_local_debug_api_key_for_safety_only");
                    
                    java.lang.reflect.Method buildMethod = optionsBuilderClass.getMethod("build");
                    Object optionsInstance = buildMethod.invoke(builderInstance);
                    
                    Class<?> optionsClass = Class.forName("com.google.firebase.FirebaseOptions");
                    java.lang.reflect.Method initializeWithRawOptions = firebaseAppClass.getMethod("initializeApp", android.content.Context.class, optionsClass);
                    initializeWithRawOptions.invoke(null, this, optionsInstance);
                    
                    android.util.Log.i("CrocHubFirebase", "Fallback dummy FirebaseApp successfully initialized in memory.");
                }
            }
        } catch (ClassNotFoundException e) {
            android.util.Log.w("CrocHubFirebase", "Firebase SDK class not found on classpath. Skipping safely.");
        } catch (Exception e) {
            android.util.Log.e("CrocHubFirebase", "Dynamic Firebase fallback registration failed: " + e.getMessage());
        }
    }
}
