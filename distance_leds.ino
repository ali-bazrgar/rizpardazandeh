// Arduino Nano + HC-SR04 + two LEDs
// TRIG=D10, ECHO=D11, LEDs=D5 and D6
const byte TRIG_PIN = 10;
const byte ECHO_PIN = 11;
const byte LED1_PIN = 5;
const byte LED2_PIN = 6;

const unsigned long PING_INTERVAL_MS = 60;
const unsigned long ECHO_TIMEOUT_US = 12000UL;
unsigned long lastPingMs = 0;
unsigned long lastBlinkMs = 0;
unsigned long blinkPeriodMs = 0;
bool ledsOn = false;
float distanceCm = -1.0;

void setLeds(bool on) {
  digitalWrite(LED1_PIN, on ? HIGH : LOW);
  digitalWrite(LED2_PIN, on ? HIGH : LOW);
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  const unsigned long duration = pulseIn(ECHO_PIN, HIGH, ECHO_TIMEOUT_US);
  if (duration == 0) return -1.0;
  return duration / 58.0;
}

unsigned long periodFor(float cm) {
  if (cm >= 2.0 && cm <= 30.0) return 200UL;
  if (cm > 30.0 && cm <= 60.0) return 600UL;
  if (cm > 60.0 && cm <= 100.0) return 1200UL;
  return 0UL;
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  digitalWrite(TRIG_PIN, LOW);
  setLeds(false);
  Serial.begin(9600);
}

void loop() {
  const unsigned long now = millis();

  if (now - lastPingMs >= PING_INTERVAL_MS) {
    lastPingMs = now;
    distanceCm = readDistanceCm();
    blinkPeriodMs = periodFor(distanceCm);

    Serial.print(F("Distance: "));
    if (distanceCm < 0) {
      Serial.println(F("no echo / out of range"));
    } else {
      Serial.print(distanceCm, 1);
      Serial.println(F(" cm"));
    }

    if (blinkPeriodMs == 0) {
      ledsOn = false;
      setLeds(false);
    }
  }

  if (blinkPeriodMs > 0 && now - lastBlinkMs >= blinkPeriodMs / 2) {
    lastBlinkMs = now;
    ledsOn = !ledsOn;
    setLeds(ledsOn);
  }
}
