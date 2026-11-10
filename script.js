const sourceCode = `// Arduino Nano + HC-SR04 + two LEDs
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
}`;

const stepInfo = [
  {
    title: 'تعریف پایه‌ها و متغیرها',
    text: 'شمارهٔ پایه‌های حسگر و LEDها را نام‌گذاری می‌کنیم. متغیرها زمان آخرین اندازه‌گیری، وضعیت LEDها و فاصلهٔ خوانده‌شده را نگه می‌دارند.',
    callout: 'پایه‌های خروجی LED دقیقاً مطابق مدار شما D5 و D6 هستند.',
    range: [0, 13]
  },
  {
    title: 'ارسال موج و اندازه‌گیری پژواک',
    text: 'پایهٔ TRIG برای ۱۰ میکروثانیه فعال می‌شود. سپس pulseIn مدت HIGH بودن ECHO را می‌سنجد. تقسیم زمان بر ۵۸، فاصلهٔ تقریبی برحسب سانتی‌متر را می‌دهد.',
    callout: 'اگر زمان صفر باشد، پاسخی از حسگر نرسیده و مقدار منفی برمی‌گردد.',
    range: [15, 28]
  },
  {
    title: 'انتخاب ریتم از روی فاصله',
    text: 'تابع periodFor فاصله را در یکی از سه بازه می‌گذارد. عدد خروجی، دورهٔ کامل چشمک است؛ مقدار صفر یعنی فاصله خارج از محدوده است.',
    callout: '۲۰۰، ۶۰۰ و ۱۲۰۰ میلی‌ثانیه به‌ترتیب سریع، متوسط و آهسته‌اند.',
    range: [29, 35]
  },
  {
    title: 'آماده‌سازی برد',
    text: 'در setup ورودی و خروجی بودن پایه‌ها مشخص می‌شود. LEDها در شروع خاموش‌اند و ارتباط سریال برای مشاهدهٔ مقدار فاصله با سرعت ۹۶۰۰ راه‌اندازی می‌شود.',
    callout: 'setup فقط یک بار، هنگام روشن‌شدن یا ریست برد اجرا می‌شود.',
    range: [36, 46]
  },
  {
    title: 'حلقهٔ پیوسته و چشمک‌زدن',
    text: 'loop هر ۶۰ میلی‌ثانیه فاصله را تازه می‌کند و وضعیت را چاپ می‌کند. millis زمان را پیگیری می‌کند تا LEDها بدون مکث طولانی و هم‌زمان تغییر وضعیت دهند.',
    callout: 'وقتی اکو نرسد یا فاصله بیرون بازه باشد، هر دو LED خاموش می‌شوند.',
    range: [47, 75]
  }
];

const codeNode = document.querySelector('#fullCode');
const groups = sourceCode.split('\n');
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const highlight = value => escapeHtml(value)
  .replace(/(\/\/.*)$/g, '<span class="comment">$1</span>')
  .replace(/("[^"]*")/g, '<span class="str">$1</span>')
  .replace(/\b(const|bool|byte|float|unsigned|long|void|if|else|return|false|true)\b/g, '<span class="kw">$1</span>')
  .replace(/\b(HIGH|LOW|INPUT|OUTPUT)\b/g, '<span class="type">$1</span>')
  .replace(/\b(\d+\.?\d*U?L?)\b/g, '<span class="num">$1</span>')
  .replace(/\b(digitalWrite|digitalRead|delayMicroseconds|pulseIn|pinMode|Serial|F|millis)\b/g, '<span class="fn">$1</span>');
codeNode.innerHTML = groups.map((line, i) => {
  const clean = line.replace(/\t/g, '  ');
  const lineNumber = String(i + 1).padStart(2, '0');
  return '<span class="code-line" data-line="' + i + '"><span class="ln">' + lineNumber + '</span>' + (clean ? highlight(clean) : ' ') + '</span>';
}).join('');

let activeStep = 0;
const dots = document.querySelector('#stepDots');
const codeScroller = document.querySelector('.code-scroll');
stepInfo.forEach((step, index) => {
  const dot = document.createElement('button');
  dot.className = 'step-dot';
  dot.setAttribute('aria-label', 'رفتن به مرحلهٔ ' + (index + 1));
  dot.addEventListener('click', () => showStep(index));
  dots.append(dot);
});
function showStep(index) {
  activeStep = (index + stepInfo.length) % stepInfo.length;
  const step = stepInfo[activeStep];
  document.querySelector('#stepCount').textContent = 'مرحلهٔ ' + (activeStep + 1) + ' از ' + stepInfo.length;
  document.querySelector('#stepTitle').textContent = step.title;
  document.querySelector('#stepText').textContent = step.text;
  document.querySelector('#codeCallout').textContent = step.callout;
  [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === activeStep));
  codeNode.querySelectorAll('.code-line').forEach(line => {
    const n = Number(line.dataset.line);
    line.classList.toggle('active-line', n >= step.range[0] && n <= step.range[1]);
  });
  const first = codeNode.querySelector('[data-line="' + step.range[0] + '"]');
  if (first) {
    const pane = codeScroller.getBoundingClientRect();
    const line = first.getBoundingClientRect();
    if (line.top < pane.top) {
      codeScroller.scrollTo({ top: codeScroller.scrollTop + line.top - pane.top - 12, behavior: 'smooth' });
    } else if (line.bottom > pane.bottom) {
      codeScroller.scrollTo({ top: codeScroller.scrollTop + line.bottom - pane.bottom + 12, behavior: 'smooth' });
    }
  }
}
document.querySelector('#codePrev').addEventListener('click', () => showStep(activeStep - 1));
document.querySelector('#codeNext').addEventListener('click', () => showStep(activeStep + 1));
showStep(0);
if (!location.hash) {
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}

const scenes = [...document.querySelectorAll('[data-scene]')];
let currentScene = 0;
const toFa = value => String(value).replace(/[0-9]/g, n => '۰۱۲۳۴۵۶۷۸۹'[Number(n)]);
function goToScene(index) {
  const next = Math.max(0, Math.min(scenes.length - 1, index));
  scenes[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelector('#previousScene').addEventListener('click', () => goToScene(currentScene - 1));
document.querySelector('#nextScene').addEventListener('click', () => goToScene(currentScene + 1));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
  const target = document.querySelector(button.dataset.go);
  if (target) target.scrollIntoView({ behavior: 'smooth' });
}));
const sceneObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  currentScene = scenes.indexOf(entry.target);
  document.querySelector('#sceneCounter').textContent = toFa(String(currentScene + 1).padStart(2, '0')) + ' / ' + toFa(scenes.length);
}), { threshold: 0.58 });
scenes.forEach(scene => sceneObserver.observe(scene));
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('visible');
  revealObserver.unobserve(entry.target);
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#progress').style.width = (max ? window.scrollY / max * 100 : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();
document.addEventListener('keydown', event => {
  if (event.target.closest('.code-scroll')) return;
  if (['ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); goToScene(currentScene + 1); }
  if (['ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); goToScene(currentScene - 1); }
  if (event.key === 'ArrowLeft' && document.querySelector('#code').getBoundingClientRect().top < innerHeight) showStep(activeStep + 1);
  if (event.key === 'ArrowRight' && document.querySelector('#code').getBoundingClientRect().top < innerHeight) showStep(activeStep - 1);
});

document.querySelector('#copyCode').addEventListener('click', async event => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(sourceCode);
    button.textContent = 'کپی شد';
    setTimeout(() => button.textContent = 'کپی', 1400);
  } catch {
    button.textContent = 'انتخاب کد';
    const range = document.createRange();
    range.selectNodeContents(codeNode);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

document.querySelectorAll('.asset-img').forEach(img => {
  img.addEventListener('load', () => {
    img.classList.add('loaded');
    if (img.closest('.diagram-frame')) img.closest('.diagram-frame').classList.add('has-image');
  });
  img.addEventListener('error', () => {
    img.classList.add('image-missing');
    if (img.closest('.diagram-frame')) img.closest('.diagram-frame').classList.remove('has-image');
  });
  if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
});
