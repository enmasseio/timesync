# Using the timesync library in Android applications

This tutorial illustrates how the timesync library can be used to synchronize time between a node.js server and an android application.

## Step 1: 
Place the following index.html on your webserver which uses the timesync library and will be called from Java:
```HTML
<!DOCTYPE html>
<html>
<head>
  <!-- include es5-shim and es5-shim when support for older browsers is needed -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.23.0/es6-shim.min.js"></script>
  
  <script src="/timesync/timesync.js"></script>
</head>
<body>
  <script>
    var lastOffset = 0;

    // create a timesync client
    var ts = timesync.create({
      server: '/timesync',
      interval: 10000
    });

    // get notified on changes in the offset
    ts.on('change', function (offset) {
        lastOffset = offset;
        document.write('changed offset: ' + offset + ' ms<br>');
    });

    // get synchronized time
    setInterval(function () {
      var now = new Date(ts.now());
      document.write('now: ' + now.toISOString() + ' ms<br>');
    }, 1000);
  </script>
</body>
</html>
```

## Step 2:
Add an invisible webview to your Android applications layout.xml:

```XML
<WebView
    android:layout_width="1dp"
    android:layout_height="1dp"
    android:visibility="invisible"
    android:id="@+id/webview"/>
```

## Step 3:
In your Acitivity's `onCreate` method retieve this webview and initialize time synchronization:

```Java
mWebView = (WebView) findViewById(R.id.webview);
WebSettings settings = mWebView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setAllowFileAccessFromFileURLs(true);
settings.setAllowUniversalAccessFromFileURLs(true);
mWebView.loadUrl("http://" + serverIPPort);
mWebView.addJavascriptInterface(new CustomJavaScriptInterface(mWebView.getContext()), "Android");
```

## Step 4:
Define the `CustomJavaScriptInterface`:

```Java
public class CustomJavaScriptInterface {
    Context mContext;

    /**
     * Instantiate the interface and set the context
     */
    CustomJavaScriptInterface(Context c) {
        mContext = c;
    }

    /**
     * retrieve the server time
     */
    @JavascriptInterface
    public void getServerTime(final long time) {
        Log.d(TAG, "Time is " + time);
        MainActivity.serverTime = time;
    }

    @JavascriptInterface
    public void getTimeOffset(final long offset) {
        Log.d(TAG, "Time offset is " + offset);
        MainActivity.timeOffset = offset;
    }
}
```

## Step 5:
Add the following Java methods to your Activity to retrieve the server time and the time offset through your JavascriptInterface. As you can see, these methods use the `ts` variable of the HTML file on the server to set the server time within the Android Activity:

```Java
private long getServerTime() {
    mWebView.loadUrl("javascript:Android.getServerTime(ts.now());");
    return serverTime;
}

private long getTimeOffset() {
    mWebView.loadUrl("javascript:Android.getTimeOffset(lastOffset);");
    return timeOffset;
}
```

## Step 6:
Call the Java methods `getServerTime()` and `getTimeOffset` anywhere in your code to receive the synchronized time or the time offset.
