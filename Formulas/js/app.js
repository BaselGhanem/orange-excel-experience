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
  loaderStatus: document.querySelector(`#loaderStatus`)
};

const engine = new FormulaMotionEngine(dom);
const initialFormulaId = new URLSearchParams(window.location.search).get(`formula`);
let activeIndex = Math.max(0, formulas.findIndex((formula) => formula.id === initialFormulaId));
let toastTimer = null;
let pickerOpen = false;

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
    const control = event.target.closest(`.control, .formula-picker__trigger, .formula-option, .mode-pill, .brand__mark, .loader-enter`);
    if (!control) return;
    const rect = control.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(rect.width, 1);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / Math.max(rect.height, 1);
    control.classList.add(`is-magnetic`);
    control.style.setProperty(`--mag-x`, `${dx * 8}px`);
    control.style.setProperty(`--mag-y`, `${dy * 6}px`);
  });
  document.addEventListener(`pointerout`, (event) => {
    const control = event.target.closest(`.control, .formula-picker__trigger, .formula-option, .mode-pill, .brand__mark, .loader-enter`);
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
    dom.loader.classList.add(`is-exiting`);
    document.body.classList.remove(`is-loading`);
    window.setTimeout(() => dom.loader.remove(), 760);
  });
}

populateFormulaPicker();
updateFormulaNavigation();
bindButtonFeedback();
bindMagneticControls();
bindPointerExperience();
bindFormulaPicker();
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
