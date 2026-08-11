/*
 * AgniRakshak - Distributed Edge-AI Wildfire Early Detection Sensor Node Firmware
 * Target: ESP32 DevKit V1 (30-Pin Microcontroller)
 * Track: Open Innovation | Team: Hell Fire Club | IIC 3.0
 * 
 * Hardware Features & Pinouts:
 * - Bosch BME280 (I2C: GPIO 21 SDA, GPIO 22 SCL) -> Temp, Humidity, Pressure
 * - MQ-7 CO Sensor (Analog: GPIO 34 ADC1_CH6, Heater Control: GPIO 13 PWM/LDO)
 * - MQ-2 Smoke Sensor (Analog: GPIO 35 ADC1_CH7)
 * - u-blox NEO-6M GPS (UART2: GPIO 16 RX2, GPIO 17 TX2)
 * - SSD1306 OLED 0.96" (I2C Address 0x3C)
 * - Status LEDs: Green (GPIO 25), Yellow (GPIO 26), Red (GPIO 27)
 * - Active Alert Buzzer: GPIO 12
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <Adafruit_SSD1306.h>
#include <TinyGPSPlus.h>

// --- HARDWARE CONFIGURATION & PINOUTS ---
#define PIN_SDA           21
#define PIN_SCL           22
#define PIN_MQ7_ANALOG    34   // ADC1 Channel 6
#define PIN_MQ2_ANALOG    35   // ADC1 Channel 7
#define PIN_MQ7_HEATER    13   // PWM pin controlling MOSFET for 5V/1.4V heating cycle
#define PIN_LED_GREEN     25
#define PIN_LED_YELLOW    26
#define PIN_LED_RED       27
#define PIN_BUZZER        12

#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT     64
#define OLED_RESET        -1
#define SCREEN_ADDRESS    0x3C

// --- NETWORK & DEPLOYMENT CONFIGURATION ---
const char* WIFI_SSID     = "AgniRakshak_Mesh";
const char* WIFI_PASS     = "WildfireProtection2026";
const char* SERVER_ENDPOINT = "http://192.168.1.100:8501/api/telemetry";
const char* NODE_ID         = "NODE-01-MUJ";

// --- GLOBAL OBJECTS & STRUCTS ---
Adafruit_BME280 bme;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
HardwareSerial gpsSerial(2); // UART2
TinyGPSPlus gps;

struct SensorData {
  float temperature;
  float humidity;
  float pressure;
  float co_ppm;
  float smoke_raw;
  float latitude;
  float longitude;
  int risk_level; // 0: Normal, 1: Warning, 2: High Risk
};

volatile SensorData currentSensors = {25.0, 50.0, 1013.25, 4.0, 300.0, 26.8435, 75.5642, 0};
SemaphoreHandle_t dataMutex;

// --- SENSOR CALIBRATION & TEMPERATURE COMPENSATION ---
float calculateKFactor(float temp, float humidity) {
  // Empirical bivariate surface model for SnO2 metal-oxide gas sensor correction
  float k = 1.215 - 0.0118 * temp - 0.0032 * humidity + 
            0.00014 * (temp * temp) + 0.000021 * (humidity * humidity) + 
            0.000045 * (temp * humidity);
  return constrain(k, 0.4f, 2.0f);
}

float readCompensatedMQ7(float temp, float humidity) {
  int rawADC = analogRead(PIN_MQ7_ANALOG);
  float vOut = (rawADC / 4095.0f) * 3.3f;
  
  // Resistance ratio R_s / R_0 calculation
  float rLoad = 10.0f; // 10 kOhm load resistor
  float rSensor = ((3.3f - vOut) / max(0.01f, vOut)) * rLoad;
  
  // Apply environmental compensation factor
  float kFactor = calculateKFactor(temp, humidity);
  float rCorrected = rSensor / kFactor;
  
  // Power-law concentration fit: PPM = A * (Rs/R0)^b
  float r0_clean_air = 12.5f; 
  float ratio = rCorrected / r0_clean_air;
  float co_ppm = 100.0f * pow(max(0.05f, ratio), -1.53f);
  
  return constrain(co_ppm, 0.0f, 500.0f);
}

// --- FREERTOS TASK 1: SENSOR SAMPLING (CORE 0) ---
void TaskSensorReadings(void * pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xFrequency = pdMS_TO_TICKS(2000); // Sample every 2 seconds

  for (;;) {
    vTaskDelayUntil(&xLastWakeTime, xFrequency);

    float t = bme.readTemperature();
    float h = bme.readHumidity();
    float p = bme.readPressure() / 100.0F;

    if (isnan(t)) t = 25.0;
    if (isnan(h)) h = 50.0;

    float co = readCompensatedMQ7(t, h);
    float smoke = (float)analogRead(PIN_MQ2_ANALOG);

    // Parse GPS updates
    while (gpsSerial.available() > 0) {
      gps.encode(gpsSerial.read());
    }
    float lat = gps.location.isValid() ? gps.location.lat() : 26.8435;
    float lon = gps.location.isValid() ? gps.location.lng() : 75.5642;

    // Rule-Based Local Anomaly Risk Engine
    int local_risk = 0;
    if ((t > 48.0 && co > 60.0) || co > 120.0 || smoke > 2500.0) {
      local_risk = 2; // High Risk
    } else if (t > 38.0 || co > 25.0 || smoke > 1000.0) {
      local_risk = 1; // Warning
    }

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    currentSensors.temperature = t;
    currentSensors.humidity = h;
    currentSensors.pressure = p;
    currentSensors.co_ppm = co;
    currentSensors.smoke_raw = smoke;
    currentSensors.latitude = lat;
    currentSensors.longitude = lon;
    currentSensors.risk_level = local_risk;
    xSemaphoreGive(dataMutex);
  }
}

// --- FREERTOS TASK 2: DISPLAY, ALERTS & TELEMETRY TX (CORE 1) ---
void TaskDisplayAndTX(void * pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xFrequency = pdMS_TO_TICKS(3000); // Update every 3 seconds

  for (;;) {
    vTaskDelayUntil(&xLastWakeTime, xFrequency);

    SensorData dataCopy;
    xSemaphoreTake(dataMutex, portMAX_DELAY);
    dataCopy = currentSensors;
    xSemaphoreGive(dataMutex);

    // Update Status LEDs and Local Alarm Buzzer
    digitalWrite(PIN_LED_GREEN, dataCopy.risk_level == 0 ? HIGH : LOW);
    digitalWrite(PIN_LED_YELLOW, dataCopy.risk_level == 1 ? HIGH : LOW);
    digitalWrite(PIN_LED_RED, dataCopy.risk_level == 2 ? HIGH : LOW);

    if (dataCopy.risk_level == 2) {
      digitalWrite(PIN_BUZZER, HIGH); // Audible alert sounder
    } else {
      digitalWrite(PIN_BUZZER, LOW);
    }

    // OLED Display Diagnostics Update
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    
    display.println("AGNIRAKSHAK NODE 01");
    display.println("--------------------");
    display.print("Temp: "); display.print(dataCopy.temperature, 1); display.println(" C");
    display.print("Hum:  "); display.print(dataCopy.humidity, 1); display.println(" %");
    display.print("CO:   "); display.print(dataCopy.co_ppm, 1); display.println(" ppm");
    
    display.print("RISK: ");
    if (dataCopy.risk_level == 0) display.println("NORMAL");
    else if (dataCopy.risk_level == 1) display.println("WARNING");
    else display.println("HIGH RISK!!!");
    
    display.display();

    // Transmit JSON Telemetry over Wi-Fi if connected
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_ENDPOINT);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{";
      jsonPayload += "\"node_id\":\"" + String(NODE_ID) + "\",";
      jsonPayload += "\"temperature\":" + String(dataCopy.temperature, 2) + ",";
      jsonPayload += "\"humidity\":" + String(dataCopy.humidity, 2) + ",";
      jsonPayload += "\"co_ppm\":" + String(dataCopy.co_ppm, 2) + ",";
      jsonPayload += "\"smoke_raw\":" + String(dataCopy.smoke_raw, 1) + ",";
      jsonPayload += "\"latitude\":" + String(dataCopy.latitude, 6) + ",";
      jsonPayload += "\"longitude\":" + String(dataCopy.longitude, 6) + ",";
      jsonPayload += "\"risk_level\":" + String(dataCopy.risk_level);
      jsonPayload += "}";

      int httpResponseCode = http.POST(jsonPayload);
      http.end();
    }
  }
}

// --- SETUP FUNCTION ---
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  // Initialize Pin Modes
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_MQ7_HEATER, OUTPUT);

  // MQ-7 MOSFET Heater PWM Initialization
  ledcSetup(0, 5000, 8); // 5 kHz PWM, 8-bit resolution
  ledcAttachPin(PIN_MQ7_HEATER, 0);
  ledcWrite(0, 255); // Full 5.0V power for initial purge cycle

  // I2C Bus & Sensor Initialization
  Wire.begin(PIN_SDA, PIN_SCL);
  
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("SSD1306 OLED allocation failed");
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("AgniRakshak Booting...");
  display.display();

  if (!bme.begin(0x76, &Wire)) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
  }

  // Connect to Wi-Fi Network
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  // Mutex creation
  dataMutex = xSemaphoreCreateMutex();

  // FreeRTOS Dual-Core Task Pinning
  xTaskCreatePinnedToCore(TaskSensorReadings, "SensorTask", 4096, NULL, 2, NULL, 0); // Core 0
  xTaskCreatePinnedToCore(TaskDisplayAndTX,    "DisplayTask", 4096, NULL, 1, NULL, 1); // Core 1
}

// --- MAIN LOOP (DEEP SLEEP MANAGEMENT) ---
void loop() {
  // Main thread yields to FreeRTOS tasks
  vTaskDelay(pdMS_TO_TICKS(10000));
}
