package dependencies

object Versions {
    val JUNIT_JUPITER = "5.7.0"
    val BATIK = "1.13"
    val KOTLIN = "1.4.10"
    val KTOR = "1.4.1"
    val PROGUARD = "7.0.0"
    val KOTLESS = "0.1.6"

    val MARKDOWNJ_CORE = "0.4"
    val ZIP4J = "2.6.3"
    val ITEXTPDF = "5.5.13.2"
    val BATIK_TRANSCODER = BATIK
    val BATIK_CODEC = BATIK
    val SNAKEYAML = "1.27"
    val SYSTEM_TRAY = "3.17"
    val BOUNCYCASTLE = "1.66"
    val JUNIT_JUPITER_API = JUNIT_JUPITER
    val JUNIT_JUPITER_ENGINE = JUNIT_JUPITER
    val KOTLIN_SERIALIZATION_JSON = "1.0.0-RC2"
    val KOTLIN_COROUTINES_CORE = "1.3.9"
    val KTOR_SERVER_NETTY = KTOR
    val KTOR_SERVER_SERVLET = KTOR
    val KTOR_SERIALIZATION = KTOR
    val KTOR_SERVER_HOST_COMMON = KTOR
    val KTOR_WEBSOCKETS = KTOR
    val LOGBACK_CLASSIC = "1.2.3"
    val KOTLIN_ARGPARSER = "2.0.7"
    val PROGUARD_GRADLE = PROGUARD
    val WCA_I18N = "0.4.3"
    val GOOGLE_APPENGINE_GRADLE = "2.4.1"
    val GOOGLE_CLOUD_STORAGE = "1.113.1"
    val TNOODLE_SCRAMBLES = "0.18.0"
    val APACHE_COMMONS_LANG3 = "3.11"
    val KOTLESS_KTOR = KOTLESS
    val TESTING_MOCKK = "1.10.2"
    val KOTLINX_ATOMICFU_GRADLE = "0.14.4"

    object Plugins {
        val SHADOW = "6.0.0"
        val NODEJS = "2.2.4"
        val DEPENDENCY_VERSIONS = "0.33.0"
        val GIT_VERSION_TAG = "0.12.3"

        val KOTLIN = Versions.KOTLIN

        val KOTLIN_JVM = KOTLIN
        val KOTLIN_MULTIPLATFORM = KOTLIN
        val KOTLIN_SERIALIZATION = KOTLIN

        val KOTLESS = Versions.KOTLESS
    }
}
