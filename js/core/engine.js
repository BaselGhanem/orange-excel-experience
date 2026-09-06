export class FormulaMotionEngine {
  constructor({
    stage,
    caption,
    progress,
    sceneCounter,
    modeIndicator,
    modeText,
    stageEyebrow,
    stepBack,
    stepNext,
    stepNextLabel,
    motionCounter
  }) {
    this.stage = stage;
    this.caption = caption;
    this.progress = progress;
    this.sceneCounter = sceneCounter;
    this.modeIndicator = modeIndicator;
    this.modeText = modeText;
    this.stageEyebrow = stageEyebrow;
    this.stepBack = stepBack;
    this.stepNext = stepNext;
    this.stepNextLabel = stepNextLabel;
    this.motionCounter = motionCounter;
    this.formula = null;
    this.timers = [];
    this.sceneIndex = 0;
    this.stepIndex = 0;
    this.currentScene = null;
    this.currentSteps = [];
    this.currentActions = [];
    this.currentPlan = null;
    this.actionIndex = 0;
    this.isBusy = false;
    this.sceneFactories = [];
  }

  setFormula(formula) {
    this.clearTimers();
    this.formula = formula;
    const { theme } = formula.identity;
    document.documentElement.style.setProperty(`--accent`, theme.accent);
    document.documentElement.style.setProperty(`--accent-rgb`, theme.accentRgb);
    document.documentElement.style.setProperty(`--accent-2`, theme.accent2);
    document.documentElement.style.setProperty(`--accent-3`, theme.accent3);
    document.body.dataset.formula = formula.id;
    document.body.dataset.motion = formula.identity.motion;
    this.stage.dataset.formula = formula.id;
    this.stageEyebrow.textContent = `EXCEL FORMULA · ${String(formula.order).padStart(2, `0`)} · ${formula.identity.mood.toUpperCase()}`;
    this.sceneFactories = [
      () => this.buildIntroScene(),
      () => this.buildAnatomyScene(),
      () => this.buildDatasetScene(),
      () => this.buildWorkedScene(this.formula.basic),
      () => this.buildBasicResultScene(),
      () => this.buildHardTransitionScene(),
      () => this.buildWorkedScene(this.formula.hard),
      () => this.buildOutroScene()
    ];
  }

  start() {
    if (!this.formula) return;
    this.clearTimers();
    this.setMode(`basic`);
    this.sceneIndex = 0;
    void this.renderScene(0);
  }

  replay() {
    this.start();
  }

  clearTimers() {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers = [];
    document.querySelectorAll(`.value-flyer, .count-flyer`).forEach((node) => node.remove());
  }

  later(fn, delay) {
    const id = window.setTimeout(fn, delay);
    this.timers.push(id);
    return id;
  }

  async renderScene(index, { restoreActions = 0, suppressAutoAdvance = false } = {}) {
    this.clearTimers();
    this.sceneIndex = index;
    this.stepIndex = 0;
    this.actionIndex = 0;
    const built = this.sceneFactories[index]();
    this.currentScene = built.scene;
    this.currentSteps = built.steps;
    this.currentPlan = this.createInteractionPlan(index, built.steps);
    this.currentActions = this.currentPlan.actions;
    this.updateSceneMeta(index, this.sceneFactories.length);

    const restoring = restoreActions > 0 || suppressAutoAdvance;
    if (restoring) this.currentScene.classList.add(`is-restoring`);

    if (this.currentPlan.autoSteps.length > 0) {
      if (restoring) {
        this.runStepIndices(this.currentPlan.autoSteps, true);
      } else {
        this.isBusy = true;
        this.updateDirectorUI();
        await this.runStepIndices(this.currentPlan.autoSteps, false, this.currentPlan.autoPace ?? 0.66);
      }
    }

    if (restoreActions > 0) {
      const count = Math.min(restoreActions, this.currentActions.length);
      for (let i = 0; i < count; i += 1) this.runStepIndices(this.currentActions[i].indices, true);
      this.actionIndex = count;
    }

    if (restoring) requestAnimationFrame(() => this.currentScene?.classList.remove(`is-restoring`));

    if (!suppressAutoAdvance && this.currentPlan.autoAdvance) {
      await this.wait(260);
      if (this.sceneIndex === index && index < this.sceneFactories.length - 1) {
        await this.renderScene(index + 1);
        return;
      }
    }

    this.isBusy = false;
    this.updateDirectorUI();
  }

  async nextStep() {
    if (this.isBusy || !this.formula) return;
    this.pulseControl(this.stepNext);

    if (this.actionIndex < this.currentActions.length) {
      const action = this.currentActions[this.actionIndex];
      this.actionIndex += 1;
      this.emitSound(this.soundForAction(action.label));
      this.isBusy = true;
      this.updateDirectorUI();
      try {
        await this.runStepIndices(action.indices, false, action.pace ?? 0.68);
      } finally {
        this.isBusy = false;
        this.updateDirectorUI();
      }

      if (this.actionIndex >= this.currentActions.length && this.currentPlan.autoAdvanceAfterActions) {
        await this.wait(260);
        if (this.sceneIndex < this.sceneFactories.length - 1) await this.renderScene(this.sceneIndex + 1);
      }
      return;
    }

    if (this.sceneIndex < this.sceneFactories.length - 1) {
      this.emitSound(`transition`);
      await this.renderScene(this.sceneIndex + 1);
      return;
    }

    this.pulseStage(`complete`);
  }

  async previousStep() {
    if (this.isBusy || !this.formula) return;
    this.pulseControl(this.stepBack);

    if (this.actionIndex > 0) {
      const target = this.actionIndex - 1;
      await this.renderScene(this.sceneIndex, { restoreActions: target, suppressAutoAdvance: true });
      return;
    }

    const previousIndex = this.previousInteractionScene(this.sceneIndex);
    if (previousIndex >= 0) {
      await this.renderScene(previousIndex, { restoreActions: Number.MAX_SAFE_INTEGER, suppressAutoAdvance: true });
    }
  }

  previousInteractionScene(index) {
    const stops = { 1: 0, 3: 1, 4: 3, 6: 4, 7: 6 };
    return stops[index] ?? Math.max(-1, index - 1);
  }

  async runStepIndices(indices, instant = false, pace = 0.68) {
    for (let position = 0; position < indices.length; position += 1) {
      const step = this.currentSteps[indices[position]];
      if (!step) continue;
      const duration = Number(step.run(instant)) || 0;
      this.stepIndex = Math.max(this.stepIndex, indices[position] + 1);
      if (!instant && duration > 0) {
        const isLast = position === indices.length - 1;
        const delay = isLast ? Math.min(duration * 0.82, 720) : Math.min(duration * pace, 560);
        await this.wait(Math.max(120, delay));
      }
    }
  }

  syntaxArgumentActions() {
    const parts = this.formula.syntaxParts ?? [];
    const isPunctuation = (value) => /^[\s,\[\]().…]+$/.test(String(value));
    const argumentTokens = [];

    for (let tokenIndex = 1; tokenIndex < parts.length; tokenIndex += 1) {
      if (!isPunctuation(parts[tokenIndex])) argumentTokens.push(tokenIndex);
    }

    return argumentTokens.map((tokenIndex, argumentIndex) => {
      const nextArgumentToken = argumentTokens[argumentIndex + 1] ?? parts.length;
      const tokenIndexes = [];
      for (let cursor = tokenIndex; cursor < nextArgumentToken; cursor += 1) tokenIndexes.push(cursor);
      const argument = this.formula.arguments?.[argumentIndex];
      return {
        label: `Reveal ${argument?.name ?? parts[tokenIndex]}`,
        indices: tokenIndexes.map((index) => 3 + index),
        pace: 0.64
      };
    });
  }

  emitSound(type = `step`) {
    window.dispatchEvent(new CustomEvent(`formula-motion-sound`, { detail: { type } }));
  }

  soundForAction(label = ``) {
    const value = String(label).toLowerCase();
    if (value.includes(`result`) || value.includes(`reveal`) && /\d/.test(value)) return `result`;
    if (value.includes(`hard`)) return `mode`;
    if (value.includes(`match`) || value.includes(`lock`)) return `lock`;
    if (value.includes(`argument`) || value.includes(`range`) || value.includes(`criterion`) || value.includes(`test`)) return `argument`;
    return `step`;
  }

  createInteractionPlan(index, steps) {
    const all = steps.map((_, stepIndex) => stepIndex);
    const plan = { autoSteps: [], actions: [], autoAdvance: false, autoAdvanceAfterActions: false, autoPace: 0.58 };

    if (index === 0) {
      // Formula identity + syntax shell arrive automatically. Every argument itself remains user-controlled.
      plan.autoSteps = all.slice(0, Math.min(4, all.length));
      plan.autoPace = 0.64;
      plan.actions = this.syntaxArgumentActions();
      plan.autoAdvanceAfterActions = true;
      return plan;
    }

    if (index === 1) {
      // One click per argument card. No micro-clicks for punctuation or decoration.
      plan.actions = all.map((stepIndex, argumentIndex) => ({
        label: `Argument ${String(argumentIndex + 1).padStart(2, `0`)} · ${this.formula.arguments?.[argumentIndex]?.name ?? `Explain`}`,
        indices: [stepIndex],
        pace: 0.68
      }));
      plan.autoAdvanceAfterActions = true;
      return plan;
    }

    if (index === 2) {
      // Dataset is context, not a click gate: reveal it naturally and move into the example.
      plan.autoSteps = all;
      plan.autoAdvance = true;
      plan.autoPace = 0.62;
      return plan;
    }

    if (index === 3 || index === 6) {
      // Task + live table arrive with the scene. User controls the meaningful formula beats.
      plan.autoSteps = all.slice(0, 2);
      plan.autoPace = 0.68;
      plan.actions = this.groupWorkedActions(all.slice(2), index === 3 ? this.formula.basic : this.formula.hard);
      plan.autoAdvanceAfterActions = index === 3;
      return plan;
    }

    if (index === 4) {
      plan.autoSteps = all;
      plan.autoPace = 0.62;
      return plan;
    }

    if (index === 5) {
      plan.autoSteps = all;
      plan.autoAdvance = true;
      plan.autoPace = 0.64;
      return plan;
    }

    if (index === 7) {
      plan.autoSteps = all;
      plan.autoPace = 0.62;
      return plan;
    }

    plan.actions = all.length ? [{ label: `Continue`, indices: all }] : [];
    return plan;
  }

  groupWorkedActions(indices, example) {
    const count = example.visual.criteria?.length ?? 0;
    const type = example.visual.type;
    const action = (label, values, pace = 0.62) => ({ label, indices: values.filter((value) => Number.isInteger(value)), pace });

    if (type === `aggregate`) {
      return [
        action(`Map ranges + criteria`, indices.slice(0, 1 + count), 0.62),
        action(`Lock matching rows`, [indices[1 + count]], 0.68),
        action(`Combine + reveal result`, indices.slice(2 + count), 0.66)
      ];
    }

    if (type === `count`) {
      return [
        action(`Apply all conditions`, indices.slice(0, count), 0.62),
        action(`Count matches + reveal`, indices.slice(count), 0.64)
      ];
    }

    if (type === `lookup`) {
      return [
        action(`Search + lock match`, indices.slice(0, 2), 0.64),
        action(`Retrieve + reveal result`, indices.slice(2), 0.62)
      ];
    }

    if (type === `logic`) {
      const checks = example.visual.checks?.length ?? 0;
      return [
        action(`Evaluate the decision`, indices.slice(0, 1 + checks), 0.62),
        action(`Choose branch + reveal`, indices.slice(1 + checks), 0.66)
      ];
    }

    if (type === `threshold`) {
      return [
        action(`Run the IFS cascade`, indices.slice(0, -1), 0.62),
        action(`Reveal first TRUE`, indices.slice(-1), 0.68)
      ];
    }

    if (type === `filter`) {
      return [
        action(`Define + test the filter`, indices.slice(0, 1 + count), 0.60),
        action(`Keep + spill + reveal`, indices.slice(1 + count), 0.62)
      ];
    }

    return [action(`Build + reveal`, indices, 0.64)];
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  updateSceneMeta(index, total) {
    this.sceneCounter.textContent = `${String(index + 1).padStart(2, `0`)} / ${String(total).padStart(2, `0`)}`;
    this.progress.style.width = `${((index + 1) / total) * 100}%`;
  }

  updateDirectorUI() {
    if (!this.stepNext || !this.stepNextLabel || !this.motionCounter) return;
    const atSceneEnd = this.actionIndex >= this.currentActions.length;
    const atExperienceEnd = atSceneEnd && this.sceneIndex >= this.sceneFactories.length - 1;
    const nextSceneName = this.sceneName(this.sceneIndex + 1);

    if (atExperienceEnd) {
      this.stepNextLabel.textContent = `Formula Complete`;
      this.motionCounter.textContent = `DONE`;
      this.stepNext.classList.add(`is-complete`);
    } else if (atSceneEnd) {
      this.stepNextLabel.textContent = `Continue`;
      this.motionCounter.textContent = this.isBusy ? `PLAYING` : `→`;
      this.stepNext.classList.remove(`is-complete`);
    } else {
      const action = this.currentActions[this.actionIndex];
      this.stepNextLabel.textContent = action?.label ?? `Next Motion`;
      this.motionCounter.textContent = `${String(this.actionIndex + 1).padStart(2, `0`)} / ${String(this.currentActions.length).padStart(2, `0`)}`;
      this.stepNext.classList.remove(`is-complete`);
    }

    this.stepBack.disabled = this.sceneIndex === 0 && this.actionIndex === 0;
    this.stepNext.disabled = this.isBusy;
  }

  sceneName(index) {
    return [`Intro`, `Syntax`, `Dataset`, `Basic Example`, `Basic Result`, `Hard Mode`, `Hard Example`, `Completion`][index] ?? `Next Scene`;
  }

  pulseControl(control) {
    if (!control) return;
    control.classList.remove(`is-fired`);
    void control.offsetWidth;
    control.classList.add(`is-fired`);
  }

  pulseStage(kind = `motion`) {
    this.stage.dataset.pulse = kind;
    this.later(() => delete this.stage.dataset.pulse, 520);
  }

  setCaption(text = ``) {
    this.caption.textContent = text;
    this.caption.style.opacity = `1`;
  }

  setMode(mode) {
    const hard = mode === `hard`;
    this.modeIndicator.classList.toggle(`is-hard`, hard);
    this.modeText.textContent = hard ? `HARD MODE` : `BASIC MODE`;
  }

  mount(html, extraClass = ``) {
    const previous = this.stage.querySelector(`.scene.is-active`);
    this.stage.dataset.scene = extraClass.split(` `).find(Boolean) ?? `standard-scene`;
    if (previous) previous.classList.add(`is-leaving`);

    const wrapper = document.createElement(`section`);
    wrapper.className = `scene formula-${this.formula.id} motion-${this.formula.identity.motion} ${extraClass}`;
    wrapper.innerHTML = html;
    this.stage.append(wrapper);

    requestAnimationFrame(() => wrapper.classList.add(`is-active`));
    window.setTimeout(() => previous?.remove(), 680);
    return wrapper;
  }

  step(label, run) {
    return { label, run };
  }

  buildIntroScene() {
    const f = this.formula;
    this.setMode(`basic`);
    this.setCaption(`Formula identity enters automatically. Then: one click, one argument — punctuation follows naturally.`);
    const scene = this.mount(`
      <div class="intro-lockup">
        <div class="intro-orbit" aria-hidden="true"></div>
        <div class="intro-scanline" aria-hidden="true"></div>
        <div class="intro-formula">${this.renderHeroName(f.identity.heroParts)}</div>
        <div class="intro-sub">${this.escape(f.identity.eyebrow)}</div>
        <div class="intro-syntax" aria-label="${this.escape(f.displayName)} syntax">
          ${f.syntaxParts.map((part, index) => `<span class="syntax-token" data-token="${index}">${this.escape(part)}</span>`).join(``)}
        </div>
      </div>
    `, `intro-scene`);

    const steps = [
      this.step(`Reveal ${f.displayName}`, (instant) => {
        scene.classList.add(`intro-title-ready`);
        this.pulseStage();
        return instant ? 0 : 850;
      }),
      this.step(`Reveal formula identity`, (instant) => {
        scene.classList.add(`intro-sub-ready`);
        return instant ? 0 : 600;
      }),
      this.step(`Open syntax`, (instant) => {
        scene.classList.add(`intro-syntax-ready`);
        return instant ? 0 : 650;
      }),
      ...f.syntaxParts.map((part, index) => this.step(`Light syntax · ${String(index + 1).padStart(2, `0`)}`, (instant) => {
        scene.querySelector(`[data-token="${index}"]`)?.classList.add(`is-lit`);
        return instant ? 0 : 360;
      }))
    ];
    return { scene, steps };
  }

  buildAnatomyScene() {
    const f = this.formula;
    this.setMode(`basic`);
    this.setCaption(`One argument per click. Clear, deliberate, and fast enough to stay engaging.`);
    const title = this.escape(f.identity.anatomyTitle).replaceAll(`\n`, `<br>`);
    const scene = this.mount(`
      <div class="anatomy-layout">
        <div class="anatomy-copy-block">
          <div class="scene__kicker">Syntax anatomy</div>
          <h2 class="scene__title anatomy-title">${title}</h2>
          <p class="scene__copy">${this.escape(f.identity.anatomyCopy)}</p>
          <div class="anatomy-formula compact-anatomy">
            <div class="anatomy-formula__label">Full syntax</div>
            <div class="anatomy-formula__code">${this.escape(f.syntax)}</div>
          </div>
        </div>
        <div class="argument-stack ${f.arguments.length <= 3 ? `argument-stack--short` : ``}">
          ${f.arguments.map((arg, index) => `
            <article class="argument-card" data-arg-card="${index}" style="--arg-color:${arg.color}">
              <div class="argument-card__index">${String(index + 1).padStart(2, `0`)}</div>
              <div class="argument-card__name">${this.escape(arg.name)}</div>
              <div class="argument-card__desc">${this.escape(arg.description)}</div>
            </article>
          `).join(``)}
        </div>
      </div>
    `, `anatomy-scene`);

    const steps = f.arguments.map((arg, index) => this.step(`Explain ${arg.name}`, (instant) => {
      scene.querySelectorAll(`[data-arg-card]`).forEach((card, cardIndex) => card.classList.toggle(`is-focused-card`, cardIndex === index));
      scene.querySelector(`[data-arg-card="${index}"]`)?.classList.add(`is-visible`);
      return instant ? 0 : 560;
    }));
    return { scene, steps };
  }

  buildDatasetScene() {
    const { dataset } = this.formula;
    this.setMode(`basic`);
    this.setCaption(`The dataset reveals itself as the story enters the example. Column headers stay visible at all times.`);
    const scene = this.mount(`
      <div class="worked-layout dataset-only">
        <div class="data-panel data-panel--showcase">
          <div class="data-panel__head">
            <span class="panel-label">Training dataset</span>
            <span class="data-panel__badge">${this.escape(dataset.range)}</span>
          </div>
          <div class="sheet-wrap">${this.renderTable()}</div>
        </div>
      </div>
    `, `dataset-scene`);

    const focusColumns = dataset.focusColumns ?? dataset.columns.slice(0, 2).map((column) => column.key);
    const steps = [
      this.step(`Reveal dataset`, (instant) => {
        scene.querySelector(`.sheet-wrap`)?.classList.add(`is-visible`);
        return instant ? 0 : 700;
      }),
      ...focusColumns.map((column) => this.step(`Focus ${this.columnLabel(column)}`, (instant) => {
        this.clearTableState(scene);
        this.highlightColumn(scene, column);
        return instant ? 0 : 480;
      }))
    ];
    return { scene, steps };
  }

  buildWorkedScene(example) {
    this.setMode(example.mode);
    const hard = example.mode === `hard`;
    const visual = example.visual;
    this.setCaption(`${hard ? `Hard` : `Basic`} Mode. Click anywhere in the stage or use the arrow keys to launch the next meaningful beat.`);

    const scene = this.mount(`
      <div class="worked-layout worked-layout--${visual.type}">
        <div class="data-panel">
          <div class="data-panel__head">
            <span class="panel-label">Live data</span>
            <span class="data-panel__badge">${hard ? `HARD MODE` : `BASIC MODE`}</span>
          </div>
          <div class="sheet-wrap">${this.renderTable()}</div>
        </div>
        <aside class="formula-panel">
          <div class="task-card">
            <div class="task-card__label">Task</div>
            <div class="task-card__text">${this.escape(example.task)}</div>
            <div class="logic-line">${this.renderLogicLine(example)}</div>
          </div>
          <div class="formula-build">
            <div class="formula-build__label">Formula assembly</div>
            <div class="formula-code" aria-label="Formula being assembled">
              ${example.pieces.map((piece, index) => `<span class="formula-piece ${piece.accent ? `is-accent` : ``}" data-piece="${index}">${this.escape(piece.text)}</span>`).join(``)}
            </div>
            <div class="step-note" data-step-note>Waiting for your next motion…</div>
          </div>
          <div class="micro-visual micro-visual--${visual.type}" data-micro-visual>${this.renderMicroVisual(example)}</div>
          <div class="result-card" data-result-card>
            <div class="result-card__meta">
              <div class="result-card__label">Result</div>
              <div class="result-card__sub">${this.escape(example.resultSub)}</div>
            </div>
            <div class="result-number ${typeof example.result === `string` ? (String(example.resultDisplay).length <= 8 ? `result-number--text-short` : `result-number--text`) : ``}">${this.escape(example.resultDisplay)}</div>
          </div>
        </aside>
      </div>
    `, `worked-scene`);

    const baseSteps = [
      this.step(`Reveal task`, (instant) => {
        scene.querySelector(`.task-card`)?.classList.add(`is-visible`);
        return instant ? 0 : 520;
      }),
      this.step(`Reveal live data`, (instant) => {
        scene.querySelector(`.sheet-wrap`)?.classList.add(`is-visible`);
        return instant ? 0 : 650;
      })
    ];

    return { scene, steps: [...baseSteps, ...this.workedSteps(scene, example)] };
  }

  workedSteps(scene, example) {
    switch (example.visual.type) {
      case `aggregate`: return this.aggregateSteps(scene, example);
      case `count`: return this.countSteps(scene, example);
      case `lookup`: return this.lookupSteps(scene, example);
      case `logic`: return this.logicSteps(scene, example);
      case `threshold`: return this.thresholdSteps(scene, example);
      case `filter`: return this.filterSteps(scene, example);
      default: return this.genericSteps(scene, example);
    }
  }

  aggregateSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    const sumIndex = this.columnIndex(visual.sum.column);
    return [
      this.step(`Select sum_range`, (instant) => {
        this.clearTableState(scene);
        this.highlightColumn(scene, visual.sum.column);
        note.textContent = `sum_range → ${visual.sum.range}. These are the values Excel is allowed to add.`;
        this.revealPieces(scene, [0, 1]);
        return instant ? 0 : 520;
      }),
      ...visual.criteria.map((criterion, index) => this.step(`Apply criterion ${index + 1}`, (instant) => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `criteria_range${index + 1} → ${criterion.range}. Match “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 2);
        return instant ? 0 : 520;
      })),
      this.step(`Lock matching rows`, (instant) => {
        this.clearTableState(scene);
        this.applyMatches(scene, visual.matchedRows, sumIndex);
        this.revealAllPieces(scene, example);
        this.setEquation(scene, visual.matchedValues.join(` + `));
        note.textContent = visual.criteria.length > 1 ? `Only rows satisfying ALL conditions remain active.` : `Only matching rows remain active.`;
        return instant ? 0 : 600;
      }),
      this.step(`Combine matched values`, (instant) => {
        note.textContent = `Now combine only the highlighted Sales values.`;
        if (!instant) this.flyMatchedValues(scene, visual.matchedRows, sumIndex);
        return instant ? 0 : 900;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, `${visual.matchedValues.join(` + `)} = ${example.resultDisplay}`);
        return instant ? 0 : 700;
      })
    ];
  }

  countSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    return [
      ...visual.criteria.map((criterion, index) => this.step(`Test ${this.columnLabel(criterion.column)}`, (instant) => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `${criterion.range} tests ${this.columnLabel(criterion.column)} for “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 1);
        return instant ? 0 : 520;
      })),
      this.step(`Lock matching rows`, (instant) => {
        this.clearTableState(scene);
        this.applyMatches(scene, visual.matchedRows);
        this.revealAllPieces(scene, example);
        note.textContent = `${visual.matchedRows.length} row${visual.matchedRows.length === 1 ? `` : `s`} survived the tests.`;
        return instant ? 0 : 560;
      }),
      this.step(`Count survivors`, (instant) => {
        note.textContent = `Each surviving row contributes exactly +1.`;
        if (instant) {
          const counter = scene.querySelector(`[data-count-value]`);
          if (counter) counter.textContent = String(visual.matchedRows.length);
        } else {
          this.flyRowsToResult(scene, visual.matchedRows);
          this.animateCounter(scene, visual.matchedRows.length);
        }
        return instant ? 0 : 900;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, `COUNT = ${example.resultDisplay}`);
        return instant ? 0 : 650;
      })
    ];
  }

  lookupSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    const returnIndex = this.columnIndex(visual.returnColumn);
    const steps = [
      this.step(`Scan lookup_array`, (instant) => {
        this.highlightColumn(scene, visual.lookupColumn);
        this.activateChip(scene, 0);
        this.revealPieces(scene, [0, 1, 2, 3]);
        note.textContent = `lookup_array → ${visual.lookupRange}. Scan for “${visual.lookupValue}”.`;
        if (instant) {
          scene.querySelector(`[data-row="${visual.matchedRow}"] [data-col="${visual.lookupColumn}"]`)?.classList.add(`is-scan`);
        } else {
          this.scanColumn(scene, visual.lookupColumn, visual.matchedRow);
        }
        return instant ? 0 : 1000;
      }),
      this.step(`Lock the match`, (instant) => {
        this.clearTableState(scene);
        this.focusRow(scene, visual.matchedRow);
        scene.querySelector(`[data-row="${visual.matchedRow}"] [data-col="${visual.lookupColumn}"]`)?.classList.add(`is-value-match`, `cell-pulse`);
        this.setLookupTrack(scene, `MATCH`, visual.lookupValue);
        note.textContent = `Match locked on row ${visual.matchedRow + 2}. Keep the row alignment.`;
        return instant ? 0 : 560;
      }),
      this.step(`Retrieve ${this.columnLabel(visual.returnColumn)}`, (instant) => {
        this.clearTableState(scene);
        this.focusRow(scene, visual.matchedRow);
        this.highlightColumn(scene, visual.returnColumn);
        scene.querySelector(`[data-row="${visual.matchedRow}"] [data-col="${visual.returnColumn}"]`)?.classList.add(`is-value-match`, `cell-pulse`);
        this.activateChip(scene, 1);
        this.revealProgress(scene, example, 2, 3);
        this.setLookupTrack(scene, `RETURN`, this.cellDisplay(this.formula.dataset.rows[visual.matchedRow][visual.returnColumn], this.formula.dataset.columns[returnIndex]));
        note.textContent = `return_array → ${visual.returnRange}. Retrieve the value from the same row.`;
        return instant ? 0 : 600;
      })
    ];

    if (visual.fallback || visual.exact) {
      steps.push(this.step(`Apply lookup options`, (instant) => {
        this.revealAllPieces(scene, example);
        note.textContent = `${visual.fallback ? `Fallback = “${visual.fallback}”. ` : ``}${visual.exact ? `Match mode 0 forces an exact match.` : ``}`;
        return instant ? 0 : 480;
      }));
    }

    steps.push(
      this.step(`Send value to result`, (instant) => {
        this.revealAllPieces(scene, example);
        if (!instant) this.flyCellToResult(scene, visual.matchedRow, returnIndex);
        return instant ? 0 : 900;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, `Retrieved → ${example.resultDisplay}`);
        return instant ? 0 : 650;
      })
    );
    return steps;
  }

  logicSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    return [
      this.step(`Focus target record`, (instant) => {
        this.focusRow(scene, visual.targetRow);
        this.revealPieces(scene, [0]);
        note.textContent = `Evaluate only the highlighted record. Each check feeds the decision gate.`;
        return instant ? 0 : 520;
      }),
      ...visual.checks.map((check, index) => this.step(`Evaluate check ${index + 1}`, (instant) => {
        this.clearTableState(scene);
        this.focusRow(scene, visual.targetRow);
        check.columns.forEach((column) => this.highlightCell(scene, visual.targetRow, column));
        scene.querySelector(`[data-decision-check="${index}"]`)?.classList.add(check.passed ? `is-pass` : `is-fail`);
        note.textContent = `${check.label} → ${check.passed ? `TRUE` : `FALSE`}`;
        this.revealProgress(scene, example, index + 1, visual.checks.length + 1);
        return instant ? 0 : 520;
      })),
      this.step(`Choose ${visual.branch.toUpperCase()} branch`, (instant) => {
        this.revealAllPieces(scene, example);
        scene.querySelector(`[data-decision-gate]`)?.classList.add(visual.branch === `true` ? `choose-true` : `choose-false`);
        note.textContent = `The logical test resolves to ${visual.branch.toUpperCase()}. Follow that branch.`;
        return instant ? 0 : 650;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, `${visual.branch.toUpperCase()} → ${example.resultDisplay}`);
        return instant ? 0 : 650;
      })
    ];
  }

  thresholdSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    return [
      this.step(`Read input ${visual.valueDisplay}`, (instant) => {
        this.focusRow(scene, visual.targetRow);
        this.highlightCell(scene, visual.targetRow, visual.valueColumn);
        this.revealPieces(scene, [0]);
        scene.querySelector(`[data-threshold-value]`)?.classList.add(`is-live`);
        note.textContent = `Start with ${visual.valueDisplay}. IFS tests thresholds from left to right.`;
        return instant ? 0 : 520;
      }),
      ...visual.bands.slice(0, visual.selectedIndex + 1).map((band, index) => this.step(`Test ${band.test}`, (instant) => {
        const selected = index === visual.selectedIndex;
        scene.querySelector(`[data-band="${index}"]`)?.classList.add(selected ? `is-selected` : `is-failed`);
        for (let laterIndex = index + 1; laterIndex < visual.bands.length; laterIndex += 1) {
          scene.querySelector(`[data-band="${laterIndex}"]`)?.classList.add(`is-waiting`);
        }
        note.textContent = selected
          ? `${visual.valueDisplay} satisfies ${band.test}. Stop here → ${band.label}.`
          : `${band.test} → FALSE. Move to the next test.`;
        this.revealProgress(scene, example, index + 1, visual.bands.length);
        return instant ? 0 : 540;
      })),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealAllPieces(scene, example);
        this.revealResult(scene, `First TRUE → ${example.resultDisplay}`);
        return instant ? 0 : 650;
      })
    ];
  }

  filterSteps(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    return [
      this.step(`Define FILTER array`, (instant) => {
        scene.querySelectorAll(`tbody tr`).forEach((row) => row.classList.add(`filter-ready`));
        this.revealPieces(scene, [0, 1]);
        note.textContent = `array → ${this.formula.dataset.range.replace(`1`, `2`)}. This is the table FILTER may return.`;
        return instant ? 0 : 520;
      }),
      ...visual.criteria.map((criterion, index) => this.step(`Apply include test ${index + 1}`, (instant) => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `include test ${index + 1}: ${this.columnLabel(criterion.column)} = “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 2);
        return instant ? 0 : 520;
      })),
      this.step(`Keep TRUE rows`, (instant) => {
        this.clearTableState(scene);
        this.applyMatches(scene, visual.matchedRows);
        this.revealAllPieces(scene, example);
        note.textContent = `${visual.matchedRows.length} rows remain TRUE. Everything else fades out.`;
        return instant ? 0 : 600;
      }),
      this.step(`Spill result array`, (instant) => {
        scene.querySelector(`[data-spill-preview]`)?.classList.add(`is-spilled`);
        note.textContent = `FILTER spills the surviving rows into a new dynamic array.`;
        return instant ? 0 : 820;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, `${visual.matchedRows.length} row${visual.matchedRows.length === 1 ? `` : `s`} spilled`);
        return instant ? 0 : 650;
      })
    ];
  }

  genericSteps(scene, example) {
    return [
      this.step(`Assemble formula`, (instant) => {
        this.revealAllPieces(scene, example);
        return instant ? 0 : 500;
      }),
      this.step(`Reveal ${example.resultDisplay}`, (instant) => {
        this.revealResult(scene, example.resultDisplay);
        return instant ? 0 : 650;
      })
    ];
  }

  buildBasicResultScene() {
    const example = this.formula.basic;
    this.setMode(`basic`);
    this.setCaption(`Basic Mode is complete. One action takes you into the harder pattern when you are ready.`);
    const scene = this.mount(`
      <div class="outro-lockup result-lockup manual-result-lockup">
        <div class="scene__kicker">Basic pattern locked</div>
        <div class="outro-title result-lockup__value">${this.escape(example.resultDisplay)}</div>
        <div class="outro-copy">${this.escape(example.summary)}</div>
      </div>
    `, `outro-scene basic-result-scene`);
    return {
      scene,
      steps: [
        this.step(`Lock basic result`, (instant) => {
          scene.classList.add(`result-value-ready`);
          return instant ? 0 : 700;
        }),
        this.step(`Reveal takeaway`, (instant) => {
          scene.classList.add(`result-copy-ready`);
          return instant ? 0 : 560;
        })
      ]
    };
  }

  buildHardTransitionScene() {
    const hard = this.formula.hard;
    this.setMode(`basic`);
    this.setCaption(`Hard Mode is armed. Your next action launches the transition and lands directly in the harder example.`);
    const scene = this.mount(`
      <div class="mode-energy" aria-hidden="true"></div>
      <div class="mode-transition">
        <div class="auto-toggle" aria-label="Switch from Basic Mode to Hard Mode">
          <span class="auto-toggle__thumb" aria-hidden="true"></span>
          <span>BASIC</span><span>HARD</span>
        </div>
        <div class="mode-transition__title">${this.escape(hard.transitionTitle ?? `One more layer.`)}</div>
        <div class="mode-transition__copy">${this.escape(hard.transitionCopy ?? hard.task)}</div>
      </div>
    `, `mode-scene`);
    return {
      scene,
      steps: [
        this.step(`Charge Hard Mode`, (instant) => {
          scene.classList.add(`is-charged`, `mode-copy-ready`);
          return instant ? 0 : 720;
        }),
        this.step(`Switch to Hard Mode`, (instant) => {
          scene.querySelector(`.auto-toggle`)?.classList.add(`is-hard`);
          this.setMode(`hard`);
          return instant ? 0 : 900;
        })
      ]
    };
  }

  buildOutroScene() {
    this.setMode(`hard`);
    const basic = this.formula.basic;
    const hard = this.formula.hard;
    this.setCaption(`Formula complete. Restart it or move to another formula whenever you choose.`);
    const scene = this.mount(`
      <div class="outro-lockup manual-outro-lockup">
        <div class="outro-check">✓</div>
        <div class="scene__kicker">${this.escape(this.formula.displayName)} complete</div>
        <h2 class="outro-title">${this.escape(this.formula.identity.outroTitle)}</h2>
        <p class="outro-copy">Basic: <strong>${this.escape(basic.resultDisplay)}</strong> · Hard: <strong>${this.escape(hard.resultDisplay)}</strong>. ${this.escape(hard.summary)}</p>
      </div>
    `, `outro-scene`);
    return {
      scene,
      steps: [
        this.step(`Complete ${this.formula.displayName}`, (instant) => {
          scene.classList.add(`outro-mark-ready`, `outro-title-ready`);
          return instant ? 0 : 700;
        }),
        this.step(`Reveal final summary`, (instant) => {
          scene.classList.add(`outro-copy-ready`);
          return instant ? 0 : 560;
        })
      ]
    };
  }

  renderLogicLine(example) {
    const visual = example.visual;
    if ([`aggregate`, `count`, `filter`].includes(visual.type)) {
      return visual.criteria.map((criterion, index) => `
        ${index > 0 ? `<strong>AND</strong>` : ``}
        <span class="logic-chip" data-logic-chip="${index}">${this.escape(this.columnLabel(criterion.column))} = ${this.escape(criterion.value)}</span>
      `).join(``);
    }

    if (visual.type === `lookup`) {
      return `
        <span class="logic-chip" data-logic-chip="0">Find ${this.escape(visual.lookupValue)}</span>
        <strong>→</strong>
        <span class="logic-chip" data-logic-chip="1">Return ${this.escape(this.columnLabel(visual.returnColumn))}</span>
      `;
    }

    if (visual.type === `logic`) {
      return visual.checks.map((check, index) => `<span class="logic-chip decision-check" data-decision-check="${index}">${this.escape(check.label)}</span>`).join(``);
    }

    if (visual.type === `threshold`) {
      return `<span class="logic-chip">Input = ${this.escape(visual.valueDisplay)}</span><strong>→</strong><span class="logic-chip">First TRUE wins</span>`;
    }

    return ``;
  }

  renderMicroVisual(example) {
    const visual = example.visual;

    if (visual.type === `aggregate`) {
      return `
        <div class="equation-rail">
          <span class="micro-label">Matched values</span>
          <strong data-equation>—</strong>
        </div>
      `;
    }

    if (visual.type === `count`) {
      return `
        <div class="count-orbit" data-count-orbit>
          <span class="count-orbit__label">MATCHES</span>
          <strong data-count-value>0</strong>
          <div class="count-orbit__ring" aria-hidden="true"></div>
        </div>
      `;
    }

    if (visual.type === `lookup`) {
      return `
        <div class="lookup-track">
          <div class="lookup-node"><span>SEARCH</span><strong>${this.escape(visual.lookupValue)}</strong></div>
          <div class="lookup-beam" aria-hidden="true"><span></span></div>
          <div class="lookup-node lookup-node--return"><span data-lookup-state>RETURN</span><strong data-lookup-output>?</strong></div>
        </div>
      `;
    }

    if (visual.type === `logic`) {
      return `
        <div class="decision-gate" data-decision-gate>
          <div class="decision-gate__core">IF</div>
          <div class="decision-branch decision-branch--true"><span>TRUE</span><strong>${this.escape(visual.trueLabel)}</strong></div>
          <div class="decision-branch decision-branch--false"><span>FALSE</span><strong>${this.escape(visual.falseLabel)}</strong></div>
        </div>
      `;
    }

    if (visual.type === `threshold`) {
      return `
        <div class="threshold-board">
          <div class="threshold-value" data-threshold-value>${this.escape(visual.valueDisplay)}</div>
          <div class="threshold-ladder">
            ${visual.bands.map((band, index) => `
              <div class="threshold-band" data-band="${index}">
                <span>${this.escape(band.test)}</span>
                <strong>${this.escape(band.label)}</strong>
              </div>
            `).join(``)}
          </div>
        </div>
      `;
    }

    if (visual.type === `filter`) {
      return `
        <div class="spill-shell" data-spill-preview>
          <div class="spill-shell__label">Spilled result</div>
          <div class="spill-table">${this.renderFilteredRows(visual.matchedRows)}</div>
        </div>
      `;
    }

    return `<div></div>`;
  }

  renderTable() {
    const { columns, rows } = this.formula.dataset;
    return `
      <table class="data-table" aria-label="${this.escape(this.formula.displayName)} example dataset">
        <thead>
          <tr>
            ${columns.map((col) => `
              <th scope="col" data-col="${col.key}">
                <span class="col-letter">${col.letter}</span>${this.escape(col.label)}
              </th>
            `).join(``)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, rowIndex) => `
            <tr data-row="${rowIndex}">
              ${columns.map((col, colIndex) => `
                <td data-col="${col.key}" data-col-index="${colIndex}">${this.escape(this.cellDisplay(row[col.key], col))}</td>
              `).join(``)}
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `;
  }

  renderFilteredRows(matchedRows) {
    const { columns, rows } = this.formula.dataset;
    return `
      <div class="spill-row spill-row--head">
        ${columns.map((col) => `<span>${this.escape(col.label)}</span>`).join(``)}
      </div>
      ${matchedRows.map((rowIndex) => `
        <div class="spill-row">
          ${columns.map((col) => `<span>${this.escape(this.cellDisplay(rows[rowIndex][col.key], col))}</span>`).join(``)}
        </div>
      `).join(``)}
    `;
  }

  renderHeroName(parts) {
    return parts.map((part) => `<span class="${part.accent ? `accent` : ``}">${this.escape(part.text)}</span>`).join(``);
  }

  cellDisplay(value, column) {
    if (column?.format === `percent`) return `${Math.round(Number(value) * 100)}%`;
    if (column?.numeric) return Number(value).toLocaleString(`en-US`);
    return String(value);
  }

  highlightColumn(scene, key) {
    scene.querySelectorAll(`[data-col="${key}"]`).forEach((cell) => cell.classList.add(`is-col-highlight`));
  }

  highlightCell(scene, rowIndex, key) {
    scene.querySelector(`[data-row="${rowIndex}"] [data-col="${key}"]`)?.classList.add(`is-col-highlight`, `cell-pulse`);
  }

  clearTableState(scene) {
    scene.querySelectorAll(`.is-col-highlight, .is-match, .is-dim, .is-value-match, .cell-pulse, .is-scan`).forEach((el) => {
      el.classList.remove(`is-col-highlight`, `is-match`, `is-dim`, `is-value-match`, `cell-pulse`, `is-scan`);
    });
  }

  focusRow(scene, rowIndex) {
    scene.querySelectorAll(`tbody tr`).forEach((row) => {
      if (Number(row.dataset.row) === rowIndex) row.classList.add(`is-match`);
      else row.classList.add(`is-dim`);
    });
  }

  applyMatches(scene, matchedRows, valueColumnIndex = -1) {
    scene.querySelectorAll(`tbody tr`).forEach((row) => {
      const rowIndex = Number(row.dataset.row);
      if (matchedRows.includes(rowIndex)) {
        row.classList.add(`is-match`);
        if (valueColumnIndex >= 0) row.children[valueColumnIndex]?.classList.add(`is-value-match`, `cell-pulse`);
      } else {
        row.classList.add(`is-dim`);
      }
    });
  }

  activateChip(scene, index) {
    scene.querySelector(`[data-logic-chip="${index}"]`)?.classList.add(`is-active`);
  }

  revealPieces(scene, indexes) {
    indexes.forEach((index) => scene.querySelector(`[data-piece="${index}"]`)?.classList.add(`is-in`));
  }

  revealProgress(scene, example, step, totalSteps) {
    const target = Math.max(1, Math.ceil((step / totalSteps) * example.pieces.length));
    this.revealPieces(scene, Array.from({ length: target }, (_, index) => index));
  }

  revealAllPieces(scene, example) {
    this.revealPieces(scene, Array.from({ length: example.pieces.length }, (_, index) => index));
  }

  revealResult(scene, noteText = ``) {
    scene.querySelector(`[data-result-card]`)?.classList.add(`is-revealed`);
    const note = scene.querySelector(`[data-step-note]`);
    if (note && noteText) note.textContent = noteText;
  }

  setEquation(scene, value) {
    const equation = scene.querySelector(`[data-equation]`);
    if (equation) {
      equation.textContent = value;
      equation.classList.add(`is-live`);
    }
  }

  animateCounter(scene, target) {
    const counter = scene.querySelector(`[data-count-value]`);
    if (!counter) return;
    scene.querySelector(`[data-count-orbit]`)?.classList.add(`is-counting`);
    for (let value = 1; value <= target; value += 1) {
      this.later(() => {
        counter.textContent = String(value);
        counter.classList.remove(`is-bumping`);
        requestAnimationFrame(() => counter.classList.add(`is-bumping`));
      }, value * 260);
    }
  }

  setLookupTrack(scene, state, output) {
    const stateNode = scene.querySelector(`[data-lookup-state]`);
    const outputNode = scene.querySelector(`[data-lookup-output]`);
    if (stateNode) stateNode.textContent = state;
    if (outputNode) outputNode.textContent = output;
    scene.querySelector(`.lookup-track`)?.classList.add(`is-live`);
  }

  scanColumn(scene, column, stopRow) {
    const cells = [...scene.querySelectorAll(`tbody [data-col="${column}"]`)];
    cells.forEach((cell, index) => {
      if (index > stopRow) return;
      this.later(() => {
        cells.forEach((node) => node.classList.remove(`is-scan`));
        cell.classList.add(`is-scan`);
      }, index * 210);
    });
  }

  flyMatchedValues(scene, matchedRows, valueColumnIndex) {
    const resultTarget = scene.querySelector(`[data-result-card]`);
    if (!resultTarget) return;
    const targetRect = resultTarget.getBoundingClientRect();

    matchedRows.forEach((rowIndex, flyerIndex) => {
      const row = scene.querySelector(`[data-row="${rowIndex}"]`);
      const cell = row?.children[valueColumnIndex];
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const flyer = document.createElement(`span`);
      flyer.className = `value-flyer`;
      flyer.textContent = cell.textContent;
      flyer.style.left = `${rect.left + rect.width / 2}px`;
      flyer.style.top = `${rect.top + rect.height / 2}px`;
      document.body.append(flyer);

      const x = targetRect.left + targetRect.width * .78 - (rect.left + rect.width / 2);
      const y = targetRect.top + targetRect.height * .55 - (rect.top + rect.height / 2);
      this.later(() => {
        flyer.style.transform = `translate(${x}px, ${y}px) scale(.72)`;
        flyer.style.opacity = `0`;
      }, 60 + flyerIndex * 120);
      this.later(() => flyer.remove(), 1200 + flyerIndex * 120);
    });
  }

  flyRowsToResult(scene, matchedRows) {
    const resultTarget = scene.querySelector(`[data-result-card]`);
    if (!resultTarget) return;
    const targetRect = resultTarget.getBoundingClientRect();

    matchedRows.forEach((rowIndex, flyerIndex) => {
      const row = scene.querySelector(`[data-row="${rowIndex}"]`);
      const cell = row?.children[0];
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const flyer = document.createElement(`span`);
      flyer.className = `count-flyer`;
      flyer.textContent = `+1`;
      flyer.style.left = `${rect.left + rect.width / 2}px`;
      flyer.style.top = `${rect.top + rect.height / 2}px`;
      document.body.append(flyer);

      const x = targetRect.left + targetRect.width * .78 - (rect.left + rect.width / 2);
      const y = targetRect.top + targetRect.height * .55 - (rect.top + rect.height / 2);
      this.later(() => {
        flyer.style.transform = `translate(${x}px, ${y}px) scale(.6)`;
        flyer.style.opacity = `0`;
      }, flyerIndex * 140);
      this.later(() => flyer.remove(), 1150 + flyerIndex * 140);
    });
  }

  flyCellToResult(scene, rowIndex, columnIndex) {
    const resultTarget = scene.querySelector(`[data-result-card]`);
    const row = scene.querySelector(`[data-row="${rowIndex}"]`);
    const cell = row?.children[columnIndex];
    if (!resultTarget || !cell) return;

    const rect = cell.getBoundingClientRect();
    const targetRect = resultTarget.getBoundingClientRect();
    const flyer = document.createElement(`span`);
    flyer.className = `value-flyer`;
    flyer.textContent = cell.textContent;
    flyer.style.left = `${rect.left + rect.width / 2}px`;
    flyer.style.top = `${rect.top + rect.height / 2}px`;
    document.body.append(flyer);

    const x = targetRect.left + targetRect.width * .78 - (rect.left + rect.width / 2);
    const y = targetRect.top + targetRect.height * .55 - (rect.top + rect.height / 2);
    this.later(() => {
      flyer.style.transform = `translate(${x}px, ${y}px) scale(.78)`;
      flyer.style.opacity = `0`;
    }, 60);
    this.later(() => flyer.remove(), 1250);
  }

  columnIndex(key) {
    return this.formula.dataset.columns.findIndex((col) => col.key === key);
  }

  columnLabel(key) {
    return this.formula.dataset.columns.find((col) => col.key === key)?.label ?? key;
  }

  escape(value) {
    return String(value)
      .replaceAll(`&`, `&amp;`)
      .replaceAll(`<`, `&lt;`)
      .replaceAll(`>`, `&gt;`)
      .replaceAll(`"`, `&quot;`)
      .replaceAll(`'`, `&#039;`);
  }
}
