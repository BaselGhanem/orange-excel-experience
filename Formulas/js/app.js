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
  selector: document.querySelector(`#formulaSelect`),
  replay: document.querySelector(`#replayFormula`),
  previous: document.querySelector(`#prevFormula`),
  next: document.querySelector(`#nextFormula`),
  toast: document.querySelector(`#toast`)
};

const engine = new FormulaMotionEngine(dom);
const initialFormulaId = new URLSearchParams(window.location.search).get(`formula`);
let activeIndex = Math.max(0, formulas.findIndex((formula) => formula.id === initialFormulaId));
let toastTimer = null;

function populateSelector() {
  dom.selector.innerHTML = formulas
    .map((formula, index) => `<option value="${index}">${formula.displayName}</option>`)
    .join(``);
}

function updateFormulaNavigation() {
  dom.previous.disabled = activeIndex <= 0;
  dom.next.disabled = activeIndex >= formulas.length - 1;
  dom.selector.value = String(activeIndex);
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
  engine.play();
}

populateSelector();
updateFormulaNavigation();
loadFormula(activeIndex);

dom.replay.addEventListener(`click`, () => engine.play());
dom.selector.addEventListener(`change`, (event) => loadFormula(Number(event.target.value)));
dom.previous.addEventListener(`click`, () => {
  if (activeIndex <= 0) return showToast(`This is the first formula.`);
  loadFormula(activeIndex - 1);
});
dom.next.addEventListener(`click`, () => {
  if (activeIndex >= formulas.length - 1) return showToast(`This is the last formula in the current collection.`);
  loadFormula(activeIndex + 1);
});
