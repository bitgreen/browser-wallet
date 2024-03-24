package com.bitgreen.wallet;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private boolean isSplashScreenShown = false;
  private View splashView;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Inflate the splash screen layout from assets
    splashView = LayoutInflater.from(this).inflate(R.layout.splash, null);
  }

  @Override
  public void onPause() {
    super.onPause();

    // Show the splash screen when the app goes into the background
    if (!isSplashScreenShown) {
      ViewGroup rootView = findViewById(android.R.id.content);
      rootView.addView(splashView);
      isSplashScreenShown = true;
    }
  }

  @Override
  public void onResume() {
    super.onResume();

    // Remove the splash screen after a delay when the app comes back to the foreground
    if (isSplashScreenShown) {
      new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
        @Override
        public void run() {
          ViewGroup rootView = findViewById(android.R.id.content);
          rootView.removeView(splashView);
          isSplashScreenShown = false;
        }
      }, 400); // Adjust the delay as needed
    }
  }
}
