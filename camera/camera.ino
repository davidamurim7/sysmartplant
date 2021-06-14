#include <PubSubClient.h>
#include "src/OV2640.h"
#include <WiFi.h>
#include <WebServer.h>
#include <WiFiClient.h>
#include <DHT.h>
#include "camera_pins.h"

#define DHTTYPE DHT11 // DHT 11
#define DHTPIN 3 //PINO DIGITAL UTILIZADO PELO SENSOR

OV2640 cam;

WebServer server(80);

const char HEADER[] = "HTTP/1.1 200 OK\r\n" \
                      "Access-Control-Allow-Origin: *\r\n" \
                      "Content-Type: multipart/x-mixed-replace; boundary=123456789000000000000987654321\r\n";
const char BOUNDARY[] = "\r\n--123456789000000000000987654321\r\n";
const char CTNTTYPE[] = "Content-Type: image/jpeg\r\nContent-Length: ";
const int hdrLen = strlen(HEADER);
const int bdrLen = strlen(BOUNDARY);
const int cntLen = strlen(CTNTTYPE);

//WiFi
const char* SSID = "-----";                                           // Nome da rede WiFi
const char* PASSWORD = "----";                               // Senha da rede WiFi
WiFiClient wifiClient;     

IPAddress ip(192,168,11,50); //Configuração de IPFixo no seu dispositivo ESP8266 10.0.69.235
IPAddress gw(192,168,11,1);
IPAddress sub(255,255,255,0);
 
//MQTT Server
const char* BROKER_MQTT = "192.168.11.13";                          //URL do broker MQTT
int BROKER_PORT = 1883;                                             // Porta do Broker MQTT

#define ID_MQTT  "plant001_device"                                   //ID unico e seu
#define TOPIC_PUBLISH "/4jggokgpepnvsb2uv4s40d59ov/plant001/attrs"   //Tópico de publicação
#define TOPIC_SUBSCRIBE "/4jggokgpepnvsb2uv4s40d59ov/plant001/cmd"   //Tópico de Assinatura
PubSubClient MQTT(wifiClient); 

//pino de flash da camera
const int pinFlash = 4;

void mantemConexoes();                                              //Garante as conexoes WiFi e MQTT
void conectaWiFi();                                                 //Faz conexão com WiFi
void conectaMQTT();                                                 //Faz conexão com Broker MQTT
void deviceControl(char* topic, byte* payload, unsigned int length);//recebe e envia informações do dispositivo
void taskHandleBomb(void *pvParameters);
void taskHandleTemperature(void *pvParameters);
String getValue(String data, char separator, int index);

void handle_jpg_stream(void)
{
  char buf[32];
  int s;

  WiFiClient client = server.client();

  client.write(HEADER, hdrLen);
  client.write(BOUNDARY, bdrLen);

  while (true)
  {
    if (!client.connected()) break;
    cam.run();
    s = cam.getSize();
    client.write(CTNTTYPE, cntLen);
    sprintf( buf, "%d\r\n\r\n", s );
    client.write(buf, strlen(buf));
    client.write((char *)cam.getfb(), s);
    client.write(BOUNDARY, bdrLen);
  }
}

void setup() {        

  Serial.begin(115200);
  pinMode(pinFlash, OUTPUT);

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
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Frame parameters
  //  config.frame_size = FRAMESIZE_UXGA;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;

  cam.init(config);

  conectaWiFi();

  server.on("/sysmartplant/mjpeg", HTTP_GET, handle_jpg_stream);
  server.begin();
  
  MQTT.setServer(BROKER_MQTT, BROKER_PORT);  
  MQTT.setCallback(deviceControl); 

  xTaskCreatePinnedToCore(taskHandleBomb, "taskHandleMQTT", 10000 ,NULL, 3, NULL,0);
  xTaskCreatePinnedToCore(taskHandleTemperature, "taskHandleMQTT", 10000 ,NULL, 2, NULL,0);
}

void loop() {

  server.handleClient();
  
}

void taskHandleBomb(void *pvParameters){
  
  while(true){
    mantemConexoes();
    MQTT.loop();
    delay(500);
  }
  
}

void taskHandleTemperature(void *pvParameters){

  float temperature = 0; //VARIÁVEL DO TIPO FLOAT
  float temperatureAnt = 0;
  float humidity = 0; //VARIÁVEL DO TIPO FLOAT
  float humidityAnt = 0;
  char data[10];
  char valueRequest[10];
  DHT dht(DHTPIN, DHTTYPE);
  
  while(true){

    Serial.println("Task Sensor");
    
    mantemConexoes();
    temperatureAnt = temperature;
    temperature = dht.readTemperature(); 
  
    humidityAnt = humidity;
    humidity = dht.readHumidity();
    
    if(temperature != temperatureAnt || humidity != humidityAnt){
      snprintf(data, sizeof(data), "%.2f", temperature); 
      strcpy(valueRequest, "t|");
      strcat(valueRequest, data);
  
      MQTT.publish(TOPIC_PUBLISH, valueRequest);
  
      snprintf(data, sizeof(data), "%.2f", humidity); 
      strcpy(valueRequest, "h|");
      strcat(valueRequest, data);
  
      MQTT.publish(TOPIC_PUBLISH, valueRequest);
           
    }
    
    delay(10000);
  }
  
}

void mantemConexoes() {
    if (!MQTT.connected()) {
       conectaMQTT(); 
    }
    
    conectaWiFi(); //refaz conexão
}

void conectaWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
     return;
  }

  Serial.println();
  Serial.println("Conectando-se");
  Serial.print(SSID);
  WiFi.config(ip,gw,sub);
  WiFi.begin(SSID, PASSWORD); // Conecta na rede WI-FI  
  while (WiFi.status() != WL_CONNECTED) {
      delay(100);
      Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Conectado na rede: ");
  Serial.print(SSID);  
  Serial.print("  IP obtido: ");
  Serial.println(WiFi.localIP()); 
}

void conectaMQTT() { 
    while (!MQTT.connected()) {
        Serial.print("Conectando ao Broker MQTT: ");
        Serial.println(BROKER_MQTT);
        if (MQTT.connect(ID_MQTT)) {
            Serial.println("Conectado ao Broker com sucesso!");
            MQTT.subscribe(TOPIC_SUBSCRIBE);
        } 
        else {
            Serial.println("Nao foi possivel se conectar ao broker.");
            Serial.println("Nova tentativa de conexao em 10s");
            delay(10000);
        }
    }
}

void deviceControl(char* topic, byte* payload, unsigned int length) 
{
    String command;
    String value;

    //obtem a string do payload recebido
    for(int i = 0; i < length; i++) 
    {
       char c = (char)payload[i];
       command += c;
    }


    value = getValue(command, '|', 1);
    command = getValue(command, '|', 0);
    //value2 = getValue(value1, '&', 1);
    //value1 = getValue(value1, '&', 0);
    
    if(command == "plant001@hourly"){
      
      Serial.println("Comando hourly");
      Serial.println(value);

      MQTT.publish(TOPIC_PUBLISH, "plant001@hourly| Hourly ok");
      
    }else if(command == "plant001@flashOn|"){
      
      Serial.println("Comando flashOn");
      digitalWrite(pinFlash, HIGH);
      MQTT.publish(TOPIC_PUBLISH, "plant001@flashOn| flashOn ok");
      
    }else if(command == "plant001@flashOff|"){
      
      Serial.println("Comando flashOff");
      digitalWrite(pinFlash, LOW);
      MQTT.publish(TOPIC_PUBLISH, "plant001@flashOff| flashOff ok");
      
    }
}

String getValue(String data, char separator, int index)
{
    int found = 0;
    int strIndex[] = { 0, -1 };
    int maxIndex = data.length() - 1;

    for (int i = 0; i <= maxIndex && found <= index; i++) {
        if (data.charAt(i) == separator || i == maxIndex) {
            found++;
            strIndex[0] = strIndex[1] + 1;
            strIndex[1] = (i == maxIndex) ? i+1 : i;
        }
    }
    return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
