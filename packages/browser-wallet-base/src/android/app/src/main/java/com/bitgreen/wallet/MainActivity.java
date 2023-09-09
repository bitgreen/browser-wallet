package com.bitgreen.wallet;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private View overlayView;
    private boolean isOverlayShown = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inflate and add the custom background
        overlayView = LayoutInflater.from(this).inflate(R.layout.background_layout, null);
    }

    @Override
    public void onPause() {
        super.onPause();

        getWindow().addContentView(overlayView, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    @Override
    public void onResume() {
        super.onResume();

        // Add a delay of 400ms before hiding the overlay view
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                ViewGroup parent = (ViewGroup) overlayView.getParent();
                if (parent != null) {
                    parent.removeView(overlayView);
                    parent.requestLayout();
                }
            }
        }, 400);
    }
}