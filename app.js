const SAMPLE = [
  { sleep: 7.4, hrv: 52, rhr: 54, steps: 9100, work: 42 },
  { sleep: 7.1, hrv: 49, rhr: 55, steps: 7600, work: 28 },
  { sleep: 6.2, hrv: 36, rhr: 62, steps: 5400, work: 0 },
  { sleep: 6.8, hrv: 44, rhr: 57, steps: 10200, work: 35 },
  { sleep: 7.8, hrv: 58, rhr: 52, steps: 8400, work: 48 },
  { sleep: 7.0, hrv: 47, rhr: 56, steps: 6900, work: 20 },
  { sleep: 6.4, hrv: 39, rhr: 60, steps: 7200, work: 15 },
];

const HINTS = {
  oura: "In the Oura app, open yesterday: total sleep, average HRV, resting heart rate, steps, and activity time.",
  apple: "In Apple Fitness or Health: sleep, heart rate variability, resting heart rate, steps, and exercise minutes.",
  garmin: "On Garmin Connect: sleep, overnight HRV, resting heart rate, steps, and activity time.",
  whoop: "In Whoop: hours asleep, HRV, and resting heart rate. Steps can stay blank.",
  typed: "Type the day you remember. Blank cells are fine.",
};

const PLATES = {
  energy: {
    easy: ["Yogurt, toast, and a banana.", "A grain bowl with chicken or beans, and something green.", "Fish, potatoes, and vegetables. Eat it. A short night is a poor reason to skip dinner."],
    steady: ["Eggs and oats before you start.", "Rice, meat or tofu, and a piece of fruit.", "Pasta with olive oil, a palm of protein, and a salad."],
    hard: ["Oats, milk, and berries. Eat before the session.", "A large rice plate within a couple of hours after.", "Dinner with starch again. Energy wants the meal, not a long gap."],
    watch: "Eat breakfast. The slump usually starts when the morning is empty.",
  },
  strength: {
    easy: ["Three eggs, oats, and an orange.", "Chicken, rice, and a pile of greens.", "Salmon or tofu, potatoes, and yogurt."],
    steady: ["Eggs, oats, and milk.", "A tuna or chicken sandwich and an apple.", "Beef, beans, or tofu with rice and vegetables."],
    hard: ["The usual breakfast, plus a glass of milk.", "A bigger serving of rice at lunch.", "Meat or tofu, potatoes, and vegetables. This is the day the bar is loaded."],
    watch: "Spread the protein across the three plates. A shake does not replace dinner.",
  },
  fat: {
    easy: ["Eggs and fruit. No pastry.", "A large salad or cabbage with chicken, and a small scoop of rice.", "Fish and vegetables. The potato is a fist, not a plate."],
    steady: ["Greek yogurt and berries.", "Meat or beans, a heap of vegetables, and a fist of starch.", "The same shape at dinner. One plate, then stop."],
    hard: ["Protein and fruit before you lift.", "Rice after, a normal serving.", "Dinner is protein and vegetables. One session is enough. Do not add a night workout to make the day smaller."],
    watch: "Keep the loss slow. A bad night is a walk, not a fast.",
  },
  skin: {
    easy: ["Eggs and fruit. Leave the pastry.", "Chicken and greens, rice on the side.", "Fish, rice, and vegetables. If you want something sweet, have it with this plate."],
    steady: ["Oats and yogurt.", "A normal lunch with vegetables.", "Dinner you would cook on a quiet night. One sweet thing, with the meal."],
    hard: ["Breakfast with some starch, then train.", "A real lunch, not a bar.", "Dinner is a full plate. The sweet thing still sits with the food, not alone late."],
    watch: "Short sleep and a large sugar hit often show up in skin a day or two later. Today keeps the sweet thing small.",
  },
  race: {
    easy: ["Oatmeal and a banana.", "Rice and chicken. Eat the starch even though the run is easy.", "Pasta, a palm of protein, and vegetables."],
    steady: ["Toast and eggs.", "A rice bowl.", "Dinner with noodles or potatoes."],
    hard: ["Carbs at breakfast, then the session.", "Rice soon after.", "Pasta and protein tonight. Tomorrow's legs are built at this table."],
    watch: "An easy day still gets carbohydrates. Saving them for the hard day leaves you flat.",
  },
  sleep: {
    easy: ["Breakfast in daylight if you can.", "A normal lunch. Coffee stops after that.", "Dinner early enough that you are not digesting at midnight. Fish, rice, vegetables."],
    steady: ["Move in the morning, then eat.", "Lunch with protein and a starch.", "A lighter dinner, and no hard session after dark."],
    hard: ["Train in the morning, after this breakfast.", "A full lunch.", "Keep the evening quiet. The good night is the one you protect, not the one you spend."],
    watch: "Caffeine after lunch and a late hard session are the two habits that steal the night.",
  },
};

const TRAIN = {
  energy: {
    easy: "Walk 30 to 40 minutes. Leave the hard session for a longer night.",
    steady: "A brisk 25 minutes, then a few squats and pushes. Stop while you still feel even.",
    hard: "A real session, then a meal within two hours.",
  },
  strength: {
    easy: "Walk 35 minutes. The barbell waits.",
    steady: "Full body, about 35 minutes. Leave two reps in reserve.",
    hard: "Squat and hinge. Add a little weight. Stop the set before the last ugly rep.",
  },
  fat: {
    easy: "Walk 40 minutes. Do not turn a short night into a fast.",
    steady: "Lift for 30 minutes. Walking can be extra. A second workout is not required.",
    hard: "One lifting session. Then you are done for the day.",
  },
  skin: {
    easy: "An easy walk outside. No intervals.",
    steady: "Ordinary training, nothing heroic.",
    hard: "Train, then eat a real meal. Skip the late sugar.",
  },
  race: {
    easy: "Twenty to thirty easy minutes, jog or walk. No repeats.",
    steady: "The plain run, 30 to 40 minutes, conversational.",
    hard: "The interval day or the longer piece, whichever this week still owes you.",
  },
  sleep: {
    easy: "Daylight and a walk. Nothing hard after 4 in the afternoon.",
    steady: "Morning movement only.",
    hard: "If you train, do it in the morning. The evening stays quiet.",
  },
};

const PROTEIN = { energy: 1.4, strength: 1.6, fat: 1.8, skin: 1.4, race: 1.6, sleep: 1.3 };
const GOAL_LABEL = {
  energy: "Steadier energy",
  strength: "Get stronger",
  fat: "Lose fat, slowly",
  skin: "Clearer skin",
  race: "Train for a race",
  sleep: "Sleep better",
};
const KIND_LABEL = { easy: "Easy day", steady: "Steady day", hard: "Hard day" };

const weekEl = document.getElementById("week");
const dayEl = document.getElementById("day");
const planEl = document.getElementById("plan");
const answerEl = document.getElementById("answer");
const hintEl = document.getElementById("device-hint");
const form = document.getElementById("controls");

let days = load() || blankWeek();
let selected = days.length - 1;

function blankWeek() {
  return dates().map((date, i) => ({ date, ...SAMPLE[i] }));
}

function dates() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem("provision.v1") || "null");
    if (!raw || !Array.isArray(raw.days) || raw.days.length !== 7) return null;
    if (raw.goal) {
      const radio = form.querySelector(`input[name="goal"][value="${raw.goal}"]`);
      if (radio) radio.checked = true;
    }
    if (Array.isArray(raw.omit)) {
      form.querySelectorAll('input[name="omit"]').forEach((box) => {
        box.checked = raw.omit.includes(box.value);
      });
    }
    if (raw.device) document.getElementById("device").value = raw.device;
    if (raw.weight) document.getElementById("weight").value = raw.weight;
    return raw.days;
  } catch (_) {
    return null;
  }
}

function save() {
  const data = new FormData(form);
  localStorage.setItem("provision.v1", JSON.stringify({
    days,
    goal: data.get("goal"),
    device: data.get("device"),
    weight: Number(data.get("weight")) || 68,
    omit: data.getAll("omit"),
  }));
}

function omitted() {
  return new Set(new FormData(form).getAll("omit"));
}

function checks() {
  try {
    return JSON.parse(localStorage.getItem("provision.checks") || "{}");
  } catch (_) {
    return {};
  }
}

function saveCheck(date, id, on) {
  const all = checks();
  all[date] = all[date] || {};
  all[date][id] = on;
  localStorage.setItem("provision.checks", JSON.stringify(all));
}

function fitPlate(text) {
  const skip = omitted();
  const noMeat = skip.has("meat");
  const noFish = skip.has("fish") || noMeat;
  const noDairy = skip.has("dairy");
  const noEggs = skip.has("eggs");
  let s = text;
  if (noFish) {
    s = s.replace(/salmon or tofu/gi, "tofu");
    s = s.replace(/Fish,/g, "Tofu,");
    s = s.replace(/Fish and/g, "Tofu and");
    s = s.replace(/\bfish\b/gi, "tofu");
    s = s.replace(/tuna or chicken/gi, "chicken");
    s = s.replace(/\btuna\b/gi, "chicken");
  }
  if (noMeat) {
    s = s.replace(/chicken or beans/gi, "beans");
    s = s.replace(/chicken or tofu/gi, "tofu");
    s = s.replace(/meat or tofu/gi, "tofu");
    s = s.replace(/meat or beans/gi, "beans");
    s = s.replace(/Beef, beans, or tofu/g, "Beans or tofu");
    s = s.replace(/Rice and chicken/g, "Rice and tofu");
    s = s.replace(/with chicken/gi, "with beans");
    s = s.replace(/\bchicken\b/gi, "tofu");
    s = s.replace(/\bbeef\b/gi, "beans");
    s = s.replace(/\bmeat\b/gi, "tofu");
    s = s.replace(/a palm of protein/gi, "a palm of tofu or beans");
  }
  if (noEggs) {
    s = s.replace(/Three eggs, oats, and an orange\./g, "Oats, fruit, and peanut butter.");
    s = s.replace(/Eggs and oats/g, "Oats and peanut butter");
    s = s.replace(/Eggs, oats, and milk/g, "Oats and fruit");
    s = s.replace(/Toast and eggs/g, "Toast and peanut butter");
    s = s.replace(/Eggs and fruit/g, "Oats and fruit");
    s = s.replace(/\beggs\b/gi, "tofu");
  }
  if (noDairy) {
    s = s.replace(/Greek yogurt/gi, "yogurt");
    s = s.replace(/(?<!soy )yogurt/gi, "soy yogurt");
    s = s.replace(/(?<!soy )milk/gi, "soy milk");
  }
  return s;
}

const PANTRY = [
  ["soy yogurt", "Soy yogurt"],
  ["yogurt", "Yogurt"],
  ["soy milk", "Soy milk"],
  ["peanut butter", "Peanut butter"],
  ["milk", "Milk"],
  ["banana", "Bananas"],
  ["berries", "Berries"],
  ["apple", "Apples"],
  ["orange", "Oranges"],
  ["oatmeal", "Oats"],
  ["oats", "Oats"],
  ["toast", "Bread"],
  ["eggs", "Eggs"],
  ["chicken", "Chicken"],
  ["beef", "Beef"],
  ["beans", "Beans"],
  ["tofu", "Tofu"],
  ["salmon", "Salmon"],
  ["tuna", "Tuna"],
  ["fish", "Fish"],
  ["rice", "Rice"],
  ["potato", "Potatoes"],
  ["pasta", "Pasta"],
  ["noodles", "Noodles"],
  ["greens", "Greens"],
  ["green", "Greens"],
  ["salad", "Salad greens"],
  ["cabbage", "Cabbage"],
  ["vegetables", "Vegetables"],
];

const PROTEINS = new Set(["Chicken", "Beef", "Beans", "Tofu", "Salmon", "Tuna", "Fish", "Eggs"]);

function foodsIn(meal) {
  const blob = meal.toLowerCase();
  const found = [];
  const seen = new Set();
  PANTRY.forEach(([word, label]) => {
    if (!blob.includes(word) || seen.has(label)) return;
    if (word === "yogurt" && blob.includes("soy yogurt")) return;
    if (word === "milk" && blob.includes("soy milk")) return;
    seen.add(label);
    found.push(label);
  });
  if (!/\bor\b/.test(blob)) return found;
  let kept = false;
  return found.filter((label) => {
    if (!PROTEINS.has(label)) return true;
    if (kept) return false;
    kept = true;
    return true;
  });
}

function shopList(meals) {
  const out = [];
  const seen = new Set();
  meals.forEach((meal) => {
    foodsIn(meal).forEach((label) => {
      if (seen.has(label)) return;
      seen.add(label);
      out.push(label);
    });
  });
  return out;
}

function todayIso() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function rightNow(g, kind) {
  const h = new Date().getHours();
  if (h < 10) return "Breakfast first. The session can wait until you have eaten.";
  if (h < 15) {
    return kind === "easy"
      ? "A walk fits now. Save the harder session for a longer night."
      : "This is a good window for the session. Eat after.";
  }
  if (h < 19) {
    return g === "sleep"
      ? "Coffee is done. Have dinner early enough to sleep."
      : "Dinner is the meal left to get right.";
  }
  return g === "sleep" ? "Keep the rest of the night quiet." : "If dinner is still ahead, eat it, then stop.";
}

function stepsNote(day, train) {
  if (!/walk/i.test(train) || !Number.isFinite(num(day.steps))) return "";
  const steps = Math.round(day.steps).toLocaleString("en-US");
  if (day.steps >= 8000) return `You are already at ${steps} steps. The walk can stay short.`;
  return `You have ${steps} steps. A walk of this length is usually about 3,500 more.`;
}

let copyText = "";

function median(nums) {
  const s = nums.filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (!s.length) return null;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function judge(day) {
  const hrvMid = median(days.map((d) => num(d.hrv)));
  const rhrMid = median(days.map((d) => num(d.rhr)));
  const why = [];
  if (num(day.sleep) != null && day.sleep < 6.5) why.push("Sleep is under 6.5 hours.");
  if (num(day.hrv) != null && hrvMid != null && day.hrv < hrvMid * 0.85) why.push("HRV is the low end of this week.");
  if (num(day.rhr) != null && rhrMid != null && day.rhr > rhrMid + 5) why.push("Resting heart rate is up.");
  let kind = "steady";
  if (why.length) kind = "easy";
  else if (num(day.sleep) != null && day.sleep >= 7.2 && hrvMid != null && num(day.hrv) != null && day.hrv >= hrvMid) kind = "hard";
  return { kind, why, hrvMid, rhrMid };
}

function goal() {
  return new FormData(form).get("goal") || "energy";
}

function weight() {
  const n = Number(document.getElementById("weight").value);
  return n >= 35 && n <= 200 ? n : 68;
}

function proteinGrams() {
  return Math.round(weight() * PROTEIN[goal()]);
}

function weekday(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
}

function shortDay(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function fmt(n, digits) {
  if (!Number.isFinite(num(n))) return "–";
  return digits ? Number(n).toFixed(digits) : String(Math.round(n));
}

function metricField(label, key, mode, value, i) {
  return `<label class="metric"><span>${label}</span><input data-k="${key}" data-i="${i}" inputmode="${mode}" value="${value ?? ""}"></label>`;
}

function renderWeek() {
  weekEl.innerHTML = "";
  days.forEach((day, i) => {
    const card = document.createElement("div");
    card.className = "day" + (i === selected ? " on" : "");
    const when = new Date(day.date + "T12:00:00");
    const tag = KIND_LABEL[judge(day).kind].replace(" day", "");
    card.innerHTML = `
      <button type="button" class="day-pick">
        <span class="day-num">${when.getDate()}</span>
        <span class="day-wd">${when.toLocaleDateString("en-US", { weekday: "short" })}</span>
        <span class="kind">${tag}</span>
      </button>
      ${metricField("Sleep h", "sleep", "decimal", day.sleep, i)}
      ${metricField("HRV", "hrv", "numeric", day.hrv, i)}
      ${metricField("Rest HR", "rhr", "numeric", day.rhr, i)}
      ${metricField("Steps", "steps", "numeric", day.steps, i)}
      ${metricField("Train", "work", "numeric", day.work, i)}`;
    card.addEventListener("click", (e) => {
      if (e.target.closest("input")) return;
      selected = i;
      answerEl.hidden = true;
      render();
    });
    weekEl.appendChild(card);
  });
}

function renderPlan() {
  const day = days[selected];
  const g = goal();
  const { kind, why, hrvMid } = judge(day);
  const meals = PLATES[g][kind].map(fitPlate);
  const grams = proteinGrams();
  const each = Math.round(grams / 3);
  const train = TRAIN[g][kind];
  const shop = shopList(meals);
  const done = checks()[day.date] || {};
  const labelFor = (label, meal) => meal.toLowerCase().startsWith(label.toLowerCase()) ? meal : label + ". " + meal;
  const tasks = [
    { id: "move", text: train },
    { id: "breakfast", text: labelFor("Breakfast", meals[0]) },
    { id: "lunch", text: labelFor("Lunch", meals[1]) },
    { id: "dinner", text: labelFor("Dinner", meals[2]) },
  ];
  if (g === "sleep") tasks.push({ id: "coffee", text: "Last coffee was with lunch." });
  const finished = tasks.filter((task) => done[task.id]).length;
  const hrvBit = Number.isFinite(num(day.hrv)) && hrvMid != null
    ? ` HRV is ${Math.round(day.hrv)} ms, and the middle of this week is ${Math.round(hrvMid)}.`
    : "";
  const sleepBit = Number.isFinite(num(day.sleep)) ? `Sleep was ${Number(day.sleep).toFixed(1)} hours.` : "Sleep is blank.";
  const kindLine = kind === "easy"
    ? "The hard session waits."
    : kind === "hard"
      ? "The night sits in the better half of the week, so a real session fits."
      : "Train, and leave something in the tank.";
  const now = day.date === todayIso() ? `<p class="nowline">${rightNow(g, kind)}</p>` : "";
  const walked = stepsNote(day, train);
  copyText = [
    `${weekday(day.date)}, ${KIND_LABEL[kind].toLowerCase()}, ${GOAL_LABEL[g].toLowerCase()}`,
    train,
    walked,
    `${grams} g protein, about ${each} g on each plate`,
    "",
    `Breakfast: ${meals[0]}`,
    `Lunch: ${meals[1]}`,
    `Dinner: ${meals[2]}`,
    shop.length ? "Shop: " + shop.join(", ") : "",
  ].filter((line) => line !== "").join("\n");
  dayEl.innerHTML = `
    <div class="day-card">
      <h2>${weekday(day.date)}</h2>
      <p class="verdict">${train}</p>
      <p class="why">${why.length ? why.join(" ") : "Sleep, HRV, and resting heart rate are not waving you off."}</p>
      ${now}
      <div class="slip">
        <div><b>${KIND_LABEL[kind]}</b><span>${GOAL_LABEL[g]}</span></div>
        <div><b>${grams} g</b><span>About ${each} g a plate</span></div>
        <div><b>${fmt(day.work)} min</b><span>Already trained</span></div>
      </div>
    </div>`;
  planEl.innerHTML = `
    <div class="use">
      <section>
        <h2>Do this${finished ? ` <span class="count">${finished} of ${tasks.length}</span>` : ""}</h2>
        <ul class="todo">${tasks.map((task) => `<li><label><input type="checkbox" data-todo="${task.id}" ${done[task.id] ? "checked" : ""}><span>${task.text}</span></label></li>`).join("")}</ul>
        ${walked ? `<p class="note walk-note">${walked}</p>` : ""}
      </section>
      <section>
        <h2>Shop</h2>
        <ul class="shop">${shop.length ? shop.map((item) => `<li>${item}</li>`).join("") : "<li>These plates are a shape, so there is nothing to buy yet.</li>"}</ul>
        <div class="use-actions"><button type="button" class="solid" data-copy>Copy today</button></div>
      </section>
    </div>
    <h2 class="section-title">Today's plates</h2>
    <dl class="plates">
      <div class="plate plate-am"><div class="plate-copy"><dt>Breakfast</dt><dd>${meals[0]}</dd></div></div>
      <div class="plate plate-mid"><div class="plate-copy"><dt>Lunch</dt><dd>${meals[1]}</dd></div></div>
      <div class="plate plate-pm"><div class="plate-copy"><dt>Dinner</dt><dd>${meals[2]}</dd></div></div>
    </dl>
    <p class="note">${sleepBit}${hrvBit} ${kindLine} ${PLATES[g].watch}</p>`;
}

function render() {
  hintEl.textContent = HINTS[document.getElementById("device").value];
  renderWeek();
  renderPlan();
  save();
}

function answer(q) {
  const day = days[selected];
  const g = goal();
  const { kind } = judge(day);
  const meals = PLATES[g][kind].map(fitPlate);
  const s = q.toLowerCase();
  if (/shop|grocery|buy|list/.test(s)) {
    const list = shopList(meals);
    return list.length ? "Buy " + list.join(", ") + "." : "The plates are a shape today, so there is no list yet.";
  }
  if (/breakfast|morning/.test(s)) return meals[0];
  if (/lunch|midday/.test(s)) return meals[1];
  if (/dinner|supper|tonight|evening/.test(s)) return meals[2];
  if (/protein|grams/.test(s)) return `${proteinGrams()} grams today, about ${PROTEIN[g]} grams per kilogram at ${weight()} kg. Split it over the three plates.`;
  if (/sugar|sweet|dessert|candy/.test(s)) return g === "skin"
    ? "Have the sweet thing with a meal, or leave it. On a short night it is the first thing to cut."
    : "If you want it, put it next to a meal. A sweet thing on an empty evening is the sloppy choice.";
  if (/coffee|caffeine/.test(s)) return "Stop after lunch if tonight's sleep is the point. A hard evening session and a late coffee fight the same night.";
  if (/skin|acne|eczema|psoriasis|flare/.test(s)) return "This will not clear a flare. Short sleep and a big sugar hit are the two levers on the table today. The rest belongs with a clinician if the skin is changing fast.";
  if (/lift|train|workout|run|gym|session|intervals/.test(s)) return TRAIN[g][kind];
  if (/sleep|hrv|tired|rest/.test(s)) return document.querySelector(".why").textContent + " " + TRAIN[g][kind];
  return "Ask about breakfast, lunch, dinner, protein, training, sugar, sleep, or what to buy. The answer comes from this row and the want you picked.";
}

form.addEventListener("input", (e) => {
  if (e.target.matches("[data-todo]")) return;
  render();
});
form.addEventListener("change", (e) => {
  if (e.target.matches("[data-todo]")) {
    saveCheck(days[selected].date, e.target.dataset.todo, e.target.checked);
  }
  render();
});
planEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  const label = "Copy today";
  navigator.clipboard.writeText(copyText).then(() => {
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = label; }, 1400);
  }).catch(() => {
    btn.textContent = "Copy failed";
  });
});

weekEl.addEventListener("input", (e) => {
  const el = e.target;
  if (!el.matches("input")) return;
  const i = Number(el.dataset.i);
  const key = el.dataset.k;
  days[i][key] = el.value === "" ? null : Number(el.value);
  selected = i;
  renderPlan();
  save();
  weekEl.querySelectorAll(".day").forEach((card, idx) => card.classList.toggle("on", idx === selected));
});

document.getElementById("sample").addEventListener("click", () => {
  days = blankWeek();
  selected = days.length - 1;
  answerEl.hidden = true;
  render();
});

document.getElementById("csv").addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const rows = text.trim().split(/\r?\n/).slice(1).filter(Boolean).slice(-7);
  if (!rows.length) return;
  const parsed = rows.map((line) => {
    const [date, sleep, hrv, rhr, steps, work] = line.split(",").map((c) => c.trim());
    return {
      date: date || dates()[0],
      sleep: num(sleep),
      hrv: num(hrv),
      rhr: num(rhr),
      steps: num(steps),
      work: num(work),
    };
  });
  while (parsed.length < 7) parsed.unshift({ date: dates()[0], sleep: null, hrv: null, rhr: null, steps: null, work: null });
  days = parsed.slice(-7);
  selected = days.length - 1;
  render();
});

document.getElementById("apply-paste").addEventListener("click", () => {
  const text = document.getElementById("paste").value;
  const day = days[selected];
  const sleepClock = text.match(/(\d+)\s*h(?:ours?|r)?(?:\s*(\d+)\s*m)?/i);
  const sleepDec = text.match(/sleep[^\d]{0,12}(\d+(?:\.\d+)?)/i);
  if (sleepClock) day.sleep = Math.round((Number(sleepClock[1]) + Number(sleepClock[2] || 0) / 60) * 10) / 10;
  else if (sleepDec) day.sleep = Number(sleepDec[1]);
  const hrv = text.match(/hrv[^\d]{0,8}(\d+)/i);
  const rhr = text.match(/rest(?:ing)?(?:\s*heart\s*rate|\s*hr)?[^\d]{0,8}(\d+)/i);
  const steps = text.match(/steps[^\d]{0,8}([\d,]+)/i);
  const work = text.match(/(?:workout|activity|exercise)[^\d]{0,12}(\d+)/i);
  if (hrv) day.hrv = Number(hrv[1]);
  if (rhr) day.rhr = Number(rhr[1]);
  if (steps) day.steps = Number(steps[1].replace(/,/g, ""));
  if (work) day.work = Number(work[1]);
  render();
});

document.getElementById("ask-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("ask").value.trim();
  if (!q) return;
  answerEl.hidden = false;
  answerEl.textContent = answer(q);
});

render();
