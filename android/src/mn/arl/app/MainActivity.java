package mn.arl.app;

import android.app.Activity;
import android.content.res.AssetManager;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MainActivity extends Activity {
    private static final String TAG = "ARLApp";
    private static final String HOST = "arl.local";
    private WebView mWebView;
    private TextToSpeech mTTS;
    private boolean mTTSReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Minimalist high-contrast pure black system bars
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= 21) {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(0xFF000000);
            window.setNavigationBarColor(0xFF000000);
        }

        // Initialize Android Native TextToSpeech engine
        initTTS();

        // Create and configure WebView
        mWebView = new WebView(this);
        mWebView.setBackgroundColor(0xFF000000);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setTextZoom(100);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Hardware keyboard ergonomics: enable focus
        mWebView.setFocusable(true);
        mWebView.setFocusableInTouchMode(true);
        mWebView.requestFocus();

        // Native Android Bridge for speech synthesis and hardware control
        mWebView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void speak(String text, String lang) {
                if (mTTS != null && mTTSReady && text != null && !text.trim().isEmpty()) {
                    Locale locale = "de".equalsIgnoreCase(lang) || "de-DE".equalsIgnoreCase(lang)
                            ? Locale.GERMAN : Locale.US;
                    mTTS.setLanguage(locale);
                    mTTS.speak(text, TextToSpeech.QUEUE_FLUSH, null, "arl_tts_" + System.currentTimeMillis());
                }
            }

            @JavascriptInterface
            public void stopAudio() {
                if (mTTS != null && mTTSReady) {
                    mTTS.stop();
                }
            }
        }, "AndroidBridge");

        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "[Console] " + consoleMessage.message() + " ("
                        + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
                return true;
            }
        });

        // Intercept https://arl.local/ requests and stream directly from assets
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null) {
                    String host = request.getUrl().getHost();
                    if (HOST.equalsIgnoreCase(host)) {
                        String path = request.getUrl().getPath();
                        if (path == null || path.isEmpty() || path.equals("/")) {
                            path = "/index.html";
                        }
                        return serveAsset(path);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            private WebResourceResponse serveAsset(String path) {
                if (path.startsWith("/")) {
                    path = path.substring(1);
                }
                String assetPath = "www/" + path;
                try {
                    AssetManager am = getAssets();
                    InputStream is = am.open(assetPath);
                    String mimeType = getMimeType(path);
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Access-Control-Allow-Origin", "*");
                    headers.put("Cache-Control", "no-cache");
                    WebResourceResponse response = new WebResourceResponse(mimeType, "UTF-8", is);
                    response.setResponseHeaders(headers);
                    return response;
                } catch (IOException e) {
                    Log.w(TAG, "Asset not found: " + assetPath);
                    return null;
                }
            }

            private String getMimeType(String path) {
                String p = path.toLowerCase();
                if (p.endsWith(".html") || p.endsWith(".htm")) return "text/html";
                if (p.endsWith(".js") || p.endsWith(".mjs")) return "text/javascript";
                if (p.endsWith(".css")) return "text/css";
                if (p.endsWith(".json")) return "application/json";
                if (p.endsWith(".svg")) return "image/svg+xml";
                if (p.endsWith(".png")) return "image/png";
                if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
                if (p.endsWith(".ico")) return "image/x-icon";
                if (p.endsWith(".woff2")) return "font/woff2";
                if (p.endsWith(".woff")) return "font/woff";
                if (p.endsWith(".ttf")) return "font/ttf";
                return "application/octet-stream";
            }
        });

        mWebView.loadUrl("https://" + HOST + "/index.html");
    }

    private void initTTS() {
        mTTS = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS) {
                    mTTSReady = true;
                    mTTS.setLanguage(Locale.GERMAN);
                } else {
                    Log.w(TAG, "TextToSpeech initialization failed with status: " + status);
                }
            }
        });
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (mTTS != null) {
            mTTS.stop();
            mTTS.shutdown();
        }
        if (mWebView != null) {
            mWebView.destroy();
        }
        super.onDestroy();
    }
}
