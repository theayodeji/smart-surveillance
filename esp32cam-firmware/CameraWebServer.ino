#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "base64.h"

#define PIR_PIN 13  // PIR sensor pin

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// WiFi credentials
const char *ssid = "your SSID";  // Replace with your WiFi SSID
const char *password = "your password";  // Replace with your WiFi password

// Server URL
const char *serverUrl = "https://<your api url>/api/events/upload";

// Connect to Wi-Fi with timeout
bool connectToWiFi(const char *ssid, const char *password, unsigned long timeoutMs = 15000) {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  unsigned long startAttemptTime = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < timeoutMs) {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  return WiFi.status() == WL_CONNECTED;
}

// Capture image and return Base64 string
String captureAndEncodeImage() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return "";
  }

  String base64Image = base64::encode(fb->buf, fb->len);
  base64Image.replace("\\", "\\\\");
  base64Image.replace("\"", "\\\"");
  base64Image.replace("\r", "");
  base64Image.replace("\n", "");

  esp_camera_fb_return(fb);
  return base64Image;
}

// Upload image to server
void uploadImage(const String &base64Image) {
  HTTPClient http;
  http.setTimeout(10000);
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  String jsonBody = "{\"image\":\"" + base64Image + "\"}";
  int httpResponseCode = http.POST(jsonBody);

  if (httpResponseCode > 0) {
    Serial.printf("HTTP Response code: %d\n", httpResponseCode);
    Serial.println(http.getString());
  } else {
    Serial.printf("HTTP POST failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}

// Setup camera
bool setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 10;
  config.fb_count = psramFound() ? 2 : 1;
  config.grab_mode = psramFound() ? CAMERA_GRAB_LATEST : CAMERA_GRAB_WHEN_EMPTY;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }

  sensor_t *s = esp_camera_sensor_get();
  if (s->id.PID == OV3660_PID) {
    s->set_vflip(s, 1);
    s->set_brightness(s, 1);
    s->set_saturation(s, -2);
  }

  return true;
}

void setup() {
  Serial.begin(115200);
  Serial.println("\nBooting...");

  pinMode(PIR_PIN, INPUT);  // PIR sensor input

  if (!setupCamera()) {
    Serial.println("Camera setup failed");
    return;
  }

  if (!connectToWiFi(ssid, password)) {
    Serial.println("Failed to connect to WiFi");
    return;
  }

  Serial.println("WiFi connected");
}

void loop() {
    String base64Image = captureAndEncodeImage();
    if (base64Image.length() > 0) {
      uploadImage(base64Image);
    } else {
      Serial.println("Image capture failed");
    }
    delay(5000);  // Prevent spamming on constant motion
  }

  delay(200);  // PIR debounce delay
}
