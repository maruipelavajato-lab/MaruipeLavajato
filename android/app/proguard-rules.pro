-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Preserve Capacitor Bridge & WebView JS interfaces
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}
-keep class com.maruipelavajato.app.** { *; }
