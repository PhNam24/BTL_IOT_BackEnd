#ifdef ESP8266
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#else
#include <WiFi.h>
#endif
#include <stdlib.h>
#include "DHTesp.h"
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <SPI.h>
#include <DHT.h>
#include <DHT_U.h>
#include <Adafruit_GFX.h>
#include <Adafruit_Sensor.h>
#include <Max72xxPanel.h>
#include <ArduinoJson.h>

#include <arduino-timer.h>
#define DHTPIN 12  //(D6)
#define DHTTYPE DHT11
DHT_Unified dht(DHTPIN, DHTTYPE);
#define mqtt_topic_pub "sensor"
#define mqtt_topic_sub_1 "state"
#define mqtt_topic_sub_2 "setting"
#define FAN_PIN D1
#define WA_PIN D2
DHTesp mqttDht;
auto timer = timer_create_default();  // create a timer with default settings
/**** LED Settings *******/
// =======================================================================
// Connection data:
// =======================================================================
const char* ssid = "iPhone";                     // SSID
const char* password = "a8b8c8d8";                       // PASSWORD
String weatherKey = "3d6ad3a84d72217748a659d271bf5dee";  // openweathermap API http://o...content-available-to-author-only...p.org/api
String weatherLang = "&lang=en";
String cityID = "1581130";  //Chaweng (Ban Thung)

/******* MQTT Broker Connection Details *******/
const char* mqtt_server = "e8faa1c0f8174e3db1d82dd501f86d7c.s1.eu.hivemq.cloud";
const char* mqtt_username = "wind2715";
const char* mqtt_password = "123456789Hanoi";
const int mqtt_port = 8883;
// =======================================================================
WiFiClient client;
String weatherMain = "";
String weatherDescription = "";
String weatherLocation = "";
String country;
int humidity;
int pressure;
float windSpeed;
String date;
String currencyRates;
String weatherString = "";
bool ledMatrixState = false;
bool fanState = false;
bool waState = false;
int brightnessValue;

long period;
int offset = 1, refresh = 0;
int pinCS = 15;
int numberOfHorizontalDisplays = 4;
int numberOfVerticalDisplays = 1;
String decodedMsg;
Max72xxPanel matrix = Max72xxPanel(pinCS, numberOfHorizontalDisplays, numberOfVerticalDisplays);
int wait = 60;  // thời gian chữ chạy

int spacer = 4;
int width = 5 + spacer;

// Thêm biến cho việc kiểm soát thời gian
unsigned long previousMillis = 0;
const long interval = 60000;  // 1 phút

// Thêm biến để xác định trạng thái hiển thị (0 cho thời gian, 1 cho thông tin thời tiết)
int displayState = 0;

/**** Secure WiFi Connectivity Initialisation *****/
WiFiClientSecure espClient;

/**** MQTT Client Initialisation Using WiFi Connection *****/
PubSubClient mqttClient(espClient);  // ban đầu là client

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];

void reconnect() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("connected");
      mqttClient.subscribe("state");
      Serial.println("Subscribed to state");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}
void reconnectWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("\nWiFi connected");
  }
}

float calculateResistance(int adcValue) {
  float supplyVoltage = 3.3;
  float adcMaxValue = 1023.0;
  float voltageAcrossSensor = (adcValue / adcMaxValue) * supplyVoltage;
  float currentThroughSensor = (supplyVoltage - voltageAcrossSensor) / 20000;
  float sensorResistance = voltageAcrossSensor / currentThroughSensor;
  return sensorResistance;
}

void callback(char* topic, byte* payload, unsigned int length) {
  String incommingMessage = "";
  for (int i = 0; i < length; i++) incommingMessage += (char)payload[i];

  Serial.println("Message arrived [" + String(topic) + "]" + incommingMessage);
  if (strcmp(topic, mqtt_topic_sub_1) == 0) {
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, incommingMessage);
    if (error) {
      Serial.print("Failed to parse message: ");
      Serial.println(error.c_str());
      return;
    }
    int led_id = doc["led_id"];
    String led_state = doc["led_state"];
    String fan_state = doc["fan_state"];
    String wa_state = doc["wa_state"];
    int light = doc["light"];
    brightnessValue = light;
    Serial.print("Led id: ");
    Serial.print(led_id);
    if (led_state == "on") {
      ledMatrixState = true;    // Bật trạng thái LED Matrix
      matrix.fillScreen(HIGH);  // Bật toàn bộ LED Matrix
      matrix.write();
      Serial.println("LED Matrix bật");
    } else if (led_state == "off") {
      ledMatrixState = false;  // Bật trạng thái LED Matrix
      matrix.fillScreen(LOW);  // Tắt toàn bộ LED Matrix
      matrix.write();
      Serial.println("LED Matrix tắt");
    }
    if (fan_state == "on") {
      fanState = true;  // Bật trạng thái LED Matrix
    } else if (fan_state == "off") {
      fanState = false;  // Bật trạng thái LED Matrix
    }
    if (wa_state == "on") {
      waState = true;  // Bật trạng thái LED Matrix
    } else if (wa_state == "off") {
      waState = false;  // Bật trạng thái LED Matrix
    }
  }
}

void publishMessage(const char* topic, String payload, boolean retained) {
  if (mqttClient.publish(topic, payload.c_str(), true))
    Serial.println("[" + String(topic) + "]: " + payload);
}
int check = -1;
bool dosomething(void* opaque) {
  // Giả lập giá trị độ sáng được nhận từ một nguồn khác (ví dụ: MQTT hoặc giá trị cố định)
    // Giá trị độ sáng cố định hoặc được truyền qua MQTT

  // Chỉ thay đổi độ sáng khi giá trị mới khác với giá trị trước đó
  if (check != brightnessValue) {
    matrix.setIntensity(brightnessValue);                         // Điều chỉnh độ sáng LED
    Serial.println("Độ sáng đèn là " + String(brightnessValue));  // Ghi log ra Serial
    check = brightnessValue;                                      // Cập nhật giá trị check
  }
  // Trả về true để báo rằng nhiệm vụ đã hoàn thành thành công
  return true;
}
void setup(void) {
  // 1. Khởi tạo Serial Monitor để gỡ lỗi
  Serial.begin(9600);

  // 2. Khởi tạo cảm biến DHT
  dht.begin();

  // Thiết lập pin cho quạt
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);  // Tắt quạt ban đầu

  pinMode(WA_PIN, OUTPUT);
  digitalWrite(WA_PIN, LOW);

  // 3. Thiết lập Timer để gọi các hàm định kỳ
  timer.every(1000, dosomething);

  // 4. Khởi tạo WiFi và kết nối mạng
  Serial.println("Connecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected\nIP address: ");
  Serial.println(WiFi.localIP());
// 5. Thiết lập bảo mật cho MQTT
#ifdef ESP8266
  espClient.setInsecure();  // Không kiểm tra chứng chỉ trên ESP8266
#else
  espClient.setCACert(root_ca);  // Chỉ định chứng chỉ bảo mật trên ESP32
#endif
  // 6. Cấu hình MQTT
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);  // Gán hàm xử lý MQTT callback
  // Thiết lập thời gian giữ kết nối (keep-alive)
  mqttClient.setKeepAlive(60);
  // 7. Thiết lập LED Matrix
  Serial.println("Initializing LED Matrix...");
  matrix.setIntensity(5);    // Đặt độ sáng mặc định (giá trị 0-15)
  matrix.fillScreen(LOW);    // Tắt toàn bộ LED Matrix ban đầu
  matrix.write();            // Cập nhật trạng thái
  matrix.setRotation(0, 1);  // Định hướng ma trận LED
  matrix.setRotation(1, 1);
  matrix.setRotation(2, 1);
  matrix.setRotation(3, 1);
  // 9. Hoàn thành thiết lập
  Serial.println("Setup complete!");
}
// =======================================================================
#define MAX_DIGITS 16
byte dig[MAX_DIGITS] = { 0 };
byte digold[MAX_DIGITS] = { 0 };
byte digtrans[MAX_DIGITS] = { 0 };
int updCnt = 0;
int dots = 0;
long dotTime = 0;
long clkTime = 0;
int dx = 0;
int dy = 0;
byte del = 0;
int h, m, s;
// =======================================================================
void loop() {
  reconnectWiFi();
  mqttClient.loop();
  if (!mqttClient.connected()) {
    Serial.println("lặp lại");
    reconnect();
  }  // check if client is connected
  // Nếu LED Matrix đang tắt, không thực hiện hiển thị
  timer.tick();
  long now = millis();
  float temperature = 0;
  float humidity = 0;
  if (now - lastMsg > 2000) {
    sensors_event_t event;
    dht.temperature().getEvent(&event);
    temperature = event.temperature;
    if (temperature > 25 && fanState) digitalWrite(FAN_PIN, HIGH);
    else digitalWrite(FAN_PIN, LOW);
    dht.humidity().getEvent(&event);
    humidity = event.relative_humidity;
    if (humidity > 26 && waState) digitalWrite(WA_PIN, HIGH);
    else digitalWrite(WA_PIN, LOW);
    lastMsg = now;
    DynamicJsonDocument doc(1024);
    doc["deviceId"] = 1;
    // doc["siteId"] = "23's Lab IOT";
    doc["humid"] = humidity;
    doc["temp"] = temperature;
    char mqtt_message[256];
    serializeJson(doc, mqtt_message);
    publishMessage("data", mqtt_message, true);
  }
  if (updCnt <= 0) {
    updCnt = 5;  // 10
    // Serial.println("Getting data ...");
    // getWeatherData();
    // // TextLED();
    weatherString = "T:" + String(int(temperature)) + "C ";
    weatherString += "H:" + String(int(humidity)) + "% ";
    Serial.println(weatherString);
    /// Nếu như thỏa mãn điều kiện thì in thêm vào weatherString để in ra
    if (temperature < 23 && humidity > 90) {
      weatherString += "RAIN";
    } else if (temperature >= 23 && temperature <= 30 && humidity >= 60 & humidity < 90) {
      weatherString += "GOOD";
    } else {
      weatherString += "SUNNY";
    }
    getTime();
    Serial.println("Data loaded");
    clkTime = millis();
    displayState = 0;
  }
  if (!ledMatrixState) {
    matrix.fillScreen(LOW);
    delay(100);  // Giảm tải CPU khi không làm gì
    return;
  }
  if (millis() - clkTime > 3000 && !del && dots) {
    DisplayText(weatherString);  // Thay thế ScrollText bằng DisplayText
    updCnt--;
    clkTime = millis();
  }
  DisplayTime();
  if (millis() - dotTime > 500) {
    dotTime = millis();
    dots = !dots;
  }
}
// =======================================================================
void DisplayTime() {
  updateTime();
  matrix.fillScreen(LOW);
  int y = (matrix.height() - 8) / 2;
  if (s & 1) {
    matrix.drawChar(14, y, (String(":"))[0], HIGH, LOW, 1);
  } else {
    matrix.drawChar(14, y, (String(" "))[0], HIGH, LOW, 1);
  }

  String hour1 = String(h / 10);
  String hour2 = String(h % 10);
  String min1 = String(m / 10);
  String min2 = String(m % 10);
  String sec1 = String(s / 10);
  String sec2 = String(s % 10);
  int xh = 2;
  int xm = 19;

  matrix.drawChar(xh, y, hour1[0], HIGH, LOW, 1);
  matrix.drawChar(xh + 6, y, hour2[0], HIGH, LOW, 1);
  matrix.drawChar(xm, y, min1[0], HIGH, LOW, 1);
  matrix.drawChar(xm + 6, y, min2[0], HIGH, LOW, 1);


  matrix.write();
}
void DisplayText(String text) {
  // First, check if LED matrix is still on
  if (!ledMatrixState) return;

  // Split the weatherString into three parts
  int firstSpaceIndex = text.indexOf(' ');
  int secondSpaceIndex = text.indexOf(' ', firstSpaceIndex + 1);

  String part1 = text.substring(0, firstSpaceIndex);
  String part2 = text.substring(firstSpaceIndex + 1, secondSpaceIndex);
  String part3 = text.substring(secondSpaceIndex + 1);

  // Display each part for 5 seconds
  matrix.fillScreen(LOW);
  int y = (matrix.height() - 8) / 2;

  // Display part 1
  matrix.fillScreen(LOW);
  for (int i = 0; i < part1.length(); i++) {
    int x = 2 + i * 6;  // Adjusted to fit more characters
    matrix.drawChar(x, y, part1[i], HIGH, LOW, 1);
  }
  matrix.write();

  // Check LED matrix state before delay
  for (int i = 0; i < 3; i++) {
    if (!ledMatrixState) {
      matrix.fillScreen(LOW);
      matrix.write();
      return;
    }
    delay(1000);  // 1-second increments for more responsive off state
  }

  // Similar modifications for part 2 and part 3
  // Display part 2
  matrix.fillScreen(LOW);
  for (int i = 0; i < part2.length(); i++) {
    if (!ledMatrixState) {
      matrix.fillScreen(LOW);
      matrix.write();
      return;
    }
    int x = 2 + i * 6;  // Adjusted to fit more characters
    matrix.drawChar(x, y, part2[i], HIGH, LOW, 1);
  }
  matrix.write();

  for (int i = 0; i < 3; i++) {
    if (!ledMatrixState) {
      matrix.fillScreen(LOW);
      matrix.write();
      return;
    }
    delay(1000);
  }

  // Display part 3
  matrix.fillScreen(LOW);
  for (int i = 0; i < part3.length(); i++) {
    if (!ledMatrixState) {
      matrix.fillScreen(LOW);
      matrix.write();
      return;
    }
    int x = 2 + i * 6;  // Adjusted to fit more characters
    matrix.drawChar(x, y, part3[i], HIGH, LOW, 1);
  }
  matrix.write();

  for (int i = 0; i < 3; i++) {
    if (!ledMatrixState) {
      matrix.fillScreen(LOW);
      matrix.write();
      return;
    }
    delay(1000);
  }
}
// =======================================================================
void ScrollText(String text) {
  for (int i = 0; i < width * (text.length() + matrix.width()) - spacer; i++) {
    if (refresh == 1) i = 0;
    refresh = 0;
    matrix.fillScreen(LOW);
    int letter = i / width;
    int x = (matrix.width() - 1) - i % width;
    int y = (matrix.height() - 8) / 2;

    while (x + width - spacer >= 0 && letter >= 0) {
      if (letter < text.length()) {
        matrix.drawChar(x, y, text[letter], HIGH, LOW, 1);
      }
      letter--;
      x -= width;
    }
    matrix.write();
    delay(wait);
  }
}


const char* weatherHost = "api.openweathermap.org";
// void getWeatherData() {
//   sensors_event_t event;
//   Serial.print("connecting to ");
//   Serial.println(weatherHost);
//   // if (client.connect(weatherHost, 80)) {
//   //   client.println(String("GET /data/2.5/weather?id=") + cityID + "&units=metric&appid=" + weatherKey + weatherLang + "\r\n" +
//   //                  "Host: " + weatherHost + "\r\nUser-Agent: ArduinoWiFi/1.1\r\n" +
//   //                  "Connection: close\r\n\r\n");
//   // } else {
//   //   Serial.println("connection failed");
//   //   return;
//   // }
//   String line;
//   int repeatCounter = 0;
//   while (!client.available() && repeatCounter < 10) {
//     delay(500);
//     Serial.println("w.");
//     repeatCounter++;
//   }
//   while (client.connected() && client.available()) {
//     char c = client.read();
//     if (c == '[' || c == ']') c = ' ';
//     line += c;
//   }

//   client.stop();

//   DynamicJsonDocument doc(2048);
//   DeserializationError error = deserializeJson(doc, line);
//   if (error) {
//     Serial.println("deserializeJson() failed");
//     Serial.println(error.c_str());
//     // return;
//   }
//   dht.temperature().getEvent(&event);
//   float temperature = event.temperature;
//   dht.humidity().getEvent(&event);
//   float humidity = event.relative_humidity;

//   //weatherMain = root["weather"]["main"].as<String>();
//   weatherDescription = doc["weather"]["description"].as<String>();
//   weatherDescription.toLowerCase();

//   String deg = String(char('~' + 25));
//   dht.temperature().getEvent(&event);
//   weatherString = "T:" + String((int)event.temperature) + "C ";

//   //weatherString += weatherDescription;
//   dht.humidity().getEvent(&event);
//   weatherString += "H:" + String((int)event.relative_humidity) + "% ";

//   /// Nếu như thỏa mãn điều kiện thì in thêm vào weatherString để in ra
//   if (temperature < 23 && humidity > 90) {
//     weatherString += "RAIN";
//   } else if (temperature >= 23 && temperature <= 30 && humidity >= 60 & humidity < 90) {
//     weatherString += "GOOD";
//   } else {
//     weatherString += "SUNNY";
//   }
// }

float utcOffset = +7;
long localEpoc = 0;
long localMillisAtUpdate = 0;

void getTime() {
  WiFiClient client;
  if (!client.connect("www.google.com", 80)) {
    Serial.println("connection to google failed");
    return;
  }

  client.print(String("GET / HTTP/1.1\r\n") + String("Host: www.google.com\r\n") + String("Connection: close\r\n\r\n"));
  int repeatCounter = 0;
  while (!client.available() && repeatCounter < 10) {
    delay(500);
    repeatCounter++;
  }

  String line;
  client.setNoDelay(false);
  while (client.connected() && client.available()) {
    line = client.readStringUntil('\n');
    line.toUpperCase();
    if (line.startsWith("DATE: ")) {
      date = "     " + line.substring(6, 22);
      h = line.substring(23, 25).toInt();
      m = line.substring(26, 28).toInt();
      s = line.substring(29, 31).toInt();
      localMillisAtUpdate = millis();
      localEpoc = (h * 60 * 60 + m * 60 + s);
    }
  }
  client.stop();
}

// =======================================================================r

void updateTime() {

  long curEpoch = localEpoc + ((millis() - localMillisAtUpdate) / 1000);
  long utcOffsetInt = round(utcOffset);
  long epoch = ((curEpoch + 3600 * utcOffsetInt + 86400L) % 86400L);
  h = ((epoch % 86400L) / 3600) % 24;
  m = (epoch % 3600) / 60;
  s = epoch % 60;
}
