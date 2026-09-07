import { FormulaMotionEngine } from "./core/engine.js";
import { formulas } from "./formulas/index.js";

const dom = {
  stage: document.querySelector(`#stage`),
  caption: document.querySelector(`#cinemaCaption`),
  progress: document.querySelector(`#stageProgress`),
  sceneCounter: document.querySelector(`#sceneCounter`),
  modeIndicator: document.querySelector(`#modeIndicator`),
  modeText: document.querySelector(`#modeText`),
  stageEyebrow: document.querySelector(`#stageEyebrow`),
  picker: document.querySelector(`#formulaPicker`),
  pickerTrigger: document.querySelector(`#formulaPickerTrigger`),
  pickerValue: document.querySelector(`#formulaPickerValue`),
  pickerMenu: document.querySelector(`#formulaPickerMenu`),
  replay: document.querySelector(`#replayFormula`),
  previous: document.querySelector(`#prevFormula`),
  next: document.querySelector(`#nextFormula`),
  stepBack: document.querySelector(`#stepBack`),
  stepNext: document.querySelector(`#stepNext`),
  stepNextLabel: document.querySelector(`#stepNextLabel`),
  motionCounter: document.querySelector(`#motionCounter`),
  toast: document.querySelector(`#toast`),
  cursorCore: document.querySelector(`#cursorCore`),
  cursorHalo: document.querySelector(`#cursorHalo`),
  pointerGlow: document.querySelector(`#stagePointerGlow`),
  loader: document.querySelector(`#experienceLoader`),
  loaderEnter: document.querySelector(`#loaderEnter`),
  loaderStatus: document.querySelector(`#loaderStatus`),
  soundToggle: document.querySelector(`#soundToggle`),
  soundToggleText: document.querySelector(`#soundToggleText`)
};

const engine = new FormulaMotionEngine(dom);
const initialFormulaId = new URLSearchParams(window.location.search).get(`formula`);
let activeIndex = Math.max(0, formulas.findIndex((formula) => formula.id === initialFormulaId));
let toastTimer = null;
let pickerOpen = false;

class MotionSoundDesigner {
  constructor(toggle, label) {
    this.toggle = toggle;
    this.label = label;
    this.enabled = true;
    this.context = null;
    this.master = null;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this.enabled = false;
        this.syncUI();
        return null;
      }
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === `suspended`) void this.context.resume();
    return this.context;
  }

  tone({ frequency = 340, duration = 0.08, gain = 0.045, type = `sine`, slide = 0 }) {
    const context = this.ensureContext();
    if (!context || !this.master) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  play(type) {
    if (!this.enabled) return;
    const cues = {
      argument: () => { this.tone({ frequency: 430, duration: 0.075, gain: 0.038, type: `triangle`, slide: 95 }); },
      lock: () => { this.tone({ frequency: 265, duration: 0.11, gain: 0.045, type: `triangle`, slide: -42 }); },
      result: () => {
        this.tone({ frequency: 420, duration: 0.13, gain: 0.042, type: `sine`, slide: 120 });
        window.setTimeout(() => this.tone({ frequency: 620, duration: 0.16, gain: 0.035, type: `sine`, slide: 140 }), 70);
      },
      mode: () => { this.tone({ frequency: 190, duration: 0.22, gain: 0.05, type: `sawtooth`, slide: 210 }); },
      transition: () => { this.tone({ frequency: 300, duration: 0.12, gain: 0.028, type: `sine`, slide: 80 }); },
      step: () => { this.tone({ frequency: 360, duration: 0.065, gain: 0.027, type: `sine`, slide: 45 }); }
    };
    (cues[type] ?? cues.step)();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (this.enabled) {
      this.ensureContext();
      this.play(`step`);
    }
    this.syncUI();
  }

  syncUI() {
    if (!this.toggle || !this.label) return;
    this.toggle.setAttribute(`aria-pressed`, String(this.enabled));
    this.toggle.classList.toggle(`is-muted`, !this.enabled);
    this.label.textContent = this.enabled ? `SOUND ON` : `SOUND OFF`;
  }
}

const soundDesigner = new MotionSoundDesigner(dom.soundToggle, dom.soundToggleText);
soundDesigner.syncUI();
window.addEventListener(`formula-motion-sound`, (event) => soundDesigner.play(event.detail?.type));

function formulaDescriptor(formula) {
  const descriptors = {
    sumifs: `Aggregate · Match · Combine`,
    xlookup: `Search · Locate · Retrieve`,
    countifs: `Test · Match · Count`,
    if: `Evaluate · Branch · Return`,
    ifs: `Test · Cascade · Resolve`,
    filter: `Narrow · Reveal · Spill`
  };
  return descriptors[formula.id] ?? formula.identity.mood;
}

function populateFormulaPicker() {
  dom.pickerMenu.innerHTML = formulas.map((formula, index) => `
    <button class="formula-option" type="button" role="option" data-formula-index="${index}" aria-selected="${index === activeIndex}">
      <span class="formula-option__index">${String(index + 1).padStart(2, `0`)}</span>
      <span class="formula-option__identity">
        <strong>${formula.displayName}</strong>
        <small>${formulaDescriptor(formula)}</small>
      </span>
      <span class="formula-option__swatch" style="--option-accent:${formula.identity.theme.accent}" aria-hidden="true"></span>
      <span class="formula-option__arrow" aria-hidden="true">→</span>
    </button>
  `).join(``);
}

function setPickerOpen(open) {
  pickerOpen = Boolean(open);
  dom.picker.classList.toggle(`is-open`, pickerOpen);
  dom.pickerTrigger.setAttribute(`aria-expanded`, String(pickerOpen));
  if (pickerOpen) {
    const selected = dom.pickerMenu.querySelector(`[aria-selected="true"]`);
    window.requestAnimationFrame(() => selected?.focus({ preventScroll: true }));
  }
}

function updateFormulaNavigation() {
  dom.previous.disabled = activeIndex <= 0;
  dom.next.disabled = activeIndex >= formulas.length - 1;
  const formula = formulas[activeIndex];
  dom.pickerValue.textContent = formula.displayName;
  dom.pickerMenu.querySelectorAll(`[data-formula-index]`).forEach((option) => {
    const selected = Number(option.dataset.formulaIndex) === activeIndex;
    option.setAttribute(`aria-selected`, String(selected));
    option.classList.toggle(`is-active`, selected);
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add(`is-visible`);
  toastTimer = window.setTimeout(() => dom.toast.classList.remove(`is-visible`), 1800);
}

function loadFormula(index) {
  const formula = formulas[index];
  if (!formula) return;
  activeIndex = index;
  updateFormulaNavigation();
  engine.setFormula(formula);
  const url = new URL(window.location.href);
  url.searchParams.set(`formula`, formula.id);
  window.history.replaceState({}, ``, url);
  engine.start();
  setPickerOpen(false);
}

function fireButtonMotion(control, event) {
  if (!control || control.disabled) return;
  const rect = control.getBoundingClientRect();
  const x = event?.clientX ?? rect.left + rect.width / 2;
  const y = event?.clientY ?? rect.top + rect.height / 2;
  control.style.setProperty(`--ripple-x`, `${x - rect.left}px`);
  control.style.setProperty(`--ripple-y`, `${y - rect.top}px`);
  control.classList.remove(`has-ripple`);
  void control.offsetWidth;
  control.classList.add(`has-ripple`);
}

function bindButtonFeedback() {
  document.addEventListener(`pointerdown`, (event) => {
    const control = event.target.closest(`button, .brand`);
    if (control) fireButtonMotion(control, event);
  });
  document.addEventListener(`animationend`, (event) => {
    const control = event.target.closest(`button, .brand`);
    control?.classList.remove(`has-ripple`, `is-fired`);
  });
}

function bindMagneticControls() {
  if (!window.matchMedia(`(pointer:fine)`).matches) return;
  document.addEventListener(`pointermove`, (event) => {
    const control = event.target.closest(`.control, .formula-picker__trigger, .formula-option, .mode-pill, .sound-toggle, .brand__mark, .loader-enter`);
    if (!control) return;
    const rect = control.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1);
    control.classList.add(`is-magnetic`);
    control.style.setProperty(`--mag-x`, `${dx * 8}px`);
    control.style.setProperty(`--mag-y`, `${dy * 6}px`);
  });
  document.addEventListener(`pointerout`, (event) => {
    const control = event.target.closest(`.control, .formula-picker__trigger, .formula-option, .mode-pill, .sound-toggle, .brand__mark, .loader-enter`);
    if (!control || control.contains(event.relatedTarget)) return;
    control.style.setProperty(`--mag-x`, `0px`);
    control.style.setProperty(`--mag-y`, `0px`);
  });
}

function bindPointerExperience() {
  if (!window.matchMedia(`(pointer:fine)`).matches) return;
  let pointerStarted = false;
  let haloX = window.innerWidth / 2;
  let haloY = window.innerHeight / 2;
  let targetX = haloX;
  let targetY = haloY;

  const renderHalo = () => {
    haloX += (targetX - haloX) * 0.16;
    haloY += (targetY - haloY) * 0.16;
    dom.cursorHalo.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) translate(-50%, -50%)`;
    window.requestAnimationFrame(renderHalo);
  };
  window.requestAnimationFrame(renderHalo);

  window.addEventListener(`pointermove`, (event) => {
    if (!pointerStarted) {
      pointerStarted = true;
      document.body.classList.add(`has-cinematic-pointer`);
    }
    targetX = event.clientX;
    targetY = event.clientY;
    dom.cursorCore.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

    const stageRect = dom.stage.getBoundingClientRect();
    const inside = event.clientX >= stageRect.left && event.clientX <= stageRect.right && event.clientY >= stageRect.top && event.clientY <= stageRect.bottom;
    dom.stage.classList.toggle(`is-pointer-inside`, inside);

    if (inside) {
      const px = (event.clientX - stageRect.left) / Math.max(stageRect.width, 1);
      const py = (event.clientY - stageRect.top) / Math.max(stageRect.height, 1);
      const nx = px - 0.5;
      const ny = py - 0.5;
      dom.stage.style.setProperty(`--stage-mouse-x`, `${px * 100}%`);
      dom.stage.style.setProperty(`--stage-mouse-y`, `${py * 100}%`);
      dom.stage.style.setProperty(`--tilt-x`, `${ny * -0.72}deg`);
      dom.stage.style.setProperty(`--tilt-y`, `${nx * 0.86}deg`);
      document.documentElement.style.setProperty(`--ambient-x`, `${nx * 26}px`);
      document.documentElement.style.setProperty(`--ambient-y`, `${ny * 20}px`);
    } else {
      dom.stage.style.setProperty(`--tilt-x`, `0deg`);
      dom.stage.style.setProperty(`--tilt-y`, `0deg`);
    }
  }, { passive: true });

  document.addEventListener(`pointerover`, (event) => {
    const interactive = event.target.closest(`button, a, .logic-chip, .argument-card, td, th`);
    document.body.classList.toggle(`pointer-over-interactive`, Boolean(interactive));
  });
  document.addEventListener(`pointerdown`, () => document.body.classList.add(`pointer-is-down`));
  document.addEventListener(`pointerup`, () => document.body.classList.remove(`pointer-is-down`));
  document.addEventListener(`pointercancel`, () => document.body.classList.remove(`pointer-is-down`));
}

function bindFormulaPicker() {
  dom.pickerTrigger.addEventListener(`click`, () => setPickerOpen(!pickerOpen));
  dom.pickerTrigger.addEventListener(`keydown`, (event) => {
    if (event.key !== `ArrowDown`) return;
    event.preventDefault();
    setPickerOpen(true);
  });
  dom.pickerMenu.addEventListener(`click`, (event) => {
    const option = event.target.closest(`[data-formula-index]`);
    if (!option) return;
    loadFormula(Number(option.dataset.formulaIndex));
  });
  dom.pickerMenu.addEventListener(`keydown`, (event) => {
    const options = [...dom.pickerMenu.querySelectorAll(`[data-formula-index]`)];
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === `ArrowDown` || event.key === `ArrowUp`) {
      event.preventDefault();
      const delta = event.key === `ArrowDown` ? 1 : -1;
      const nextIndex = (currentIndex + delta + options.length) % options.length;
      options[nextIndex]?.focus();
    } else if (event.key === `Home`) {
      event.preventDefault();
      options[0]?.focus();
    } else if (event.key === `End`) {
      event.preventDefault();
      options.at(-1)?.focus();
    }
  });
  document.addEventListener(`pointerdown`, (event) => {
    if (pickerOpen && !event.target.closest(`#formulaPicker`)) setPickerOpen(false);
  });
  document.addEventListener(`keydown`, (event) => {
    if (event.key === `Escape` && pickerOpen) {
      setPickerOpen(false);
      dom.pickerTrigger.focus();
    }
  });
}


function bindStageDirector() {
  dom.stage.setAttribute(`tabindex`, `0`);
  dom.stage.setAttribute(`role`, `button`);
  dom.stage.setAttribute(`aria-label`, `Formula execution stage. Click anywhere or use arrow keys to continue.`);
  const hint = document.createElement(`div`);
  hint.className = `stage-director-hint`;
  hint.setAttribute(`aria-hidden`, `true`);
  hint.innerHTML = `<span>CLICK ANYWHERE</span><span>←</span><span>→</span>`;
  dom.stage.append(hint);

  dom.stage.addEventListener(`click`, (event) => {
    if (document.body.classList.contains(`is-loading`) || engine.isBusy) return;
    const blocked = event.target.closest(`button, a, input, select, textarea, [role="button"]`);
    if (blocked && blocked !== dom.stage) return;

    const rect = dom.stage.getBoundingClientRect();
    const wave = document.createElement(`span`);
    wave.className = `stage-click-wave`;
    wave.style.left = `${event.clientX - rect.left}px`;
    wave.style.top = `${event.clientY - rect.top}px`;
    dom.stage.append(wave);
    window.setTimeout(() => wave.remove(), 720);
    void engine.nextStep();
  });
}

function bindKeyboardDirector() {
  document.addEventListener(`keydown`, (event) => {
    if (document.body.classList.contains(`is-loading`) || pickerOpen) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    if ([`input`, `textarea`, `select`].includes(tag)) return;

    if (event.key === `ArrowRight` || event.key === `ArrowDown`) {
      event.preventDefault();
      void engine.nextStep();
      return;
    }

    if (event.key === `ArrowLeft` || event.key === `ArrowUp`) {
      event.preventDefault();
      void engine.previousStep();
    }
  });
}

function bindLoader() {
  const loaderStartedAt = performance.now();
  let loaderReady = false;
  const readyLoader = () => {
    if (loaderReady) return;
    loaderReady = true;
    dom.loader.classList.add(`is-ready`);
    dom.loaderStatus.textContent = `ACCESS GRANTED`;
    dom.loaderEnter.disabled = false;
  };
  const finishAfterMinimum = () => {
    const elapsed = performance.now() - loaderStartedAt;
    window.setTimeout(readyLoader, Math.max(0, 1350 - elapsed));
  };
  window.addEventListener(`load`, finishAfterMinimum, { once: true });
  window.setTimeout(readyLoader, 2200);

  dom.loaderEnter.addEventListener(`click`, () => {
    soundDesigner.ensureContext();
    soundDesigner.play(`transition`);
    dom.loader.classList.add(`is-exiting`);
    document.body.classList.remove(`is-loading`);
    window.setTimeout(() => dom.loader.remove(), 760);
  });
}

dom.soundToggle?.addEventListener(`click`, () => soundDesigner.setEnabled(!soundDesigner.enabled));

populateFormulaPicker();
updateFormulaNavigation();
bindButtonFeedback();
bindMagneticControls();
bindPointerExperience();
bindFormulaPicker();
bindStageDirector();
bindKeyboardDirector();
bindLoader();
loadFormula(activeIndex);

dom.stepNext.addEventListener(`click`, () => engine.nextStep());
dom.stepBack.addEventListener(`click`, () => engine.previousStep());
dom.replay.addEventListener(`click`, () => engine.replay());
dom.previous.addEventListener(`click`, () => {
  if (activeIndex <= 0) return showToast(`This is the first formula.`);
  loadFormula(activeIndex - 1);
});
dom.next.addEventListener(`click`, () => {
  if (activeIndex >= formulas.length - 1) return showToast(`This is the last formula in the current collection.`);
  loadFormula(activeIndex + 1);
});
