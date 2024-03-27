package com.bitgreen.wallet.app;

import android.graphics.Color;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Set the background color of the activity
    getWindow().getDecorView().setBackgroundColor(Color.parseColor("#133948"));
  }
}