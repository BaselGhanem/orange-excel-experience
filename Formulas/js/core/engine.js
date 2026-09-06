export class FormulaMotionEngine {
  constructor({ stage, caption, progress, sceneCounter, modeIndicator, modeText, stageEyebrow }) {
    this.stage = stage;
    this.caption = caption;
    this.progress = progress;
    this.sceneCounter = sceneCounter;
    this.modeIndicator = modeIndicator;
    this.modeText = modeText;
    this.stageEyebrow = stageEyebrow;
    this.formula = null;
    this.timers = [];
    this.runId = 0;
    this.sceneIndex = 0;
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

  async play() {
    if (!this.formula) return;
    this.clearTimers();
    this.runId += 1;
    const runId = this.runId;
    this.setMode(`basic`);

    const sequence = [
      () => this.sceneIntro(),
      () => this.sceneAnatomy(),
      () => this.sceneDataset(),
      () => this.sceneWorkedExample(this.formula.basic),
      () => this.sceneBasicResult(),
      () => this.sceneHardTransition(),
      () => this.sceneWorkedExample(this.formula.hard),
      () => this.sceneOutro()
    ];

    for (let index = 0; index < sequence.length; index += 1) {
      if (runId !== this.runId) return;
      this.sceneIndex = index;
      this.updateSceneMeta(index, sequence.length);
      const duration = sequence[index]();
      await this.wait(duration);
    }
  }

  wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  updateSceneMeta(index, total) {
    this.sceneCounter.textContent = `${String(index + 1).padStart(2, `0`)} / ${String(total).padStart(2, `0`)}`;
    this.progress.style.width = `${((index + 1) / total) * 100}%`;
  }

  setCaption(text = ``) {
    this.caption.style.opacity = `0`;
    this.later(() => {
      this.caption.textContent = text;
      this.caption.style.opacity = `1`;
    }, 120);
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
    this.later(() => previous?.remove(), 680);
    return wrapper;
  }

  sceneIntro() {
    const f = this.formula;
    this.setCaption(`${f.identity.eyebrow}. Watch the logic become visible before the formula is complete.`);
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

    this.later(() => scene.classList.add(`intro-ready`), 80);
    scene.querySelectorAll(`.syntax-token`).forEach((token, index) => {
      this.later(() => token.classList.add(`is-lit`), 1250 + index * 90);
    });
    return 3600;
  }

  sceneAnatomy() {
    const f = this.formula;
    this.setCaption(`Every argument has one job. Read the roles before reading the punctuation.`);
    const title = this.escape(f.identity.anatomyTitle).replaceAll(`\n`, `<br>`);
    const scene = this.mount(`
      <div class="anatomy-layout">
        <div>
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

    scene.querySelectorAll(`[data-arg-card]`).forEach((card, index) => {
      this.later(() => card.classList.add(`is-visible`), 360 + index * 260);
    });
    return 3900;
  }

  sceneDataset() {
    const { dataset } = this.formula;
    this.setCaption(`The table is the stage. Column names stay visible while the formula moves through the data.`);
    const scene = this.mount(`
      <div class="worked-layout dataset-only">
        <div class="data-panel data-panel--showcase">
          <div class="data-panel__head">
            <span class="panel-label">Training dataset</span>
            <span class="data-panel__badge">${this.escape(dataset.range)}</span>
          </div>
          <div class="sheet-wrap">
            ${this.renderTable()}
          </div>
        </div>
      </div>
    `, `dataset-scene`);
    const sheet = scene.querySelector(`.sheet-wrap`);
    this.later(() => sheet.classList.add(`is-visible`), 160);
    (dataset.focusColumns ?? []).forEach((column, index) => {
      this.later(() => {
        this.clearTableState(scene);
        this.highlightColumn(scene, column);
      }, 1050 + index * 900);
    });
    return 3500;
  }

  sceneWorkedExample(example) {
    this.setMode(example.mode);
    const hard = example.mode === `hard`;
    const visual = example.visual;
    this.setCaption(hard
      ? `${this.formula.displayName} Hard Mode: the same architecture, with more logic attached.`
      : `${this.formula.displayName} Basic Mode: watch each argument connect to the dataset.`
    );

    const scene = this.mount(`
      <div class="worked-layout worked-layout--${visual.type}">
        <div class="data-panel">
          <div class="data-panel__head">
            <span class="panel-label">Live data</span>
            <span class="data-panel__badge">${hard ? `HARD MODE` : `BASIC MODE`}</span>
          </div>
          <div class="sheet-wrap">
            ${this.renderTable()}
          </div>
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
            <div class="step-note" data-step-note>Reading the dataset…</div>
          </div>

          <div class="micro-visual micro-visual--${visual.type}" data-micro-visual>
            ${this.renderMicroVisual(example)}
          </div>

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

    this.later(() => scene.querySelector(`.sheet-wrap`)?.classList.add(`is-visible`), 120);
    this.later(() => scene.querySelector(`.task-card`)?.classList.add(`is-visible`), 260);

    const duration = this.animateWorkedExample(scene, example);
    return duration;
  }

  sceneBasicResult() {
    const example = this.formula.basic;
    this.setCaption(`${this.formula.displayName} Basic Mode is complete. Lock the pattern before adding complexity.`);
    this.mount(`
      <div class="outro-lockup result-lockup">
        <div class="scene__kicker">Basic pattern locked</div>
        <div class="outro-title result-lockup__value">${this.escape(example.resultDisplay)}</div>
        <div class="outro-copy">${this.escape(example.summary)}</div>
      </div>
    `, `outro-scene basic-result-scene`);
    return 2400;
  }

  sceneHardTransition() {
    const hard = this.formula.hard;
    this.setCaption(`The switch happens automatically. Hard Mode adds logic without changing the visual language.`);
    const scene = this.mount(`
      <div class="mode-energy" aria-hidden="true"></div>
      <div class="mode-transition">
        <div class="auto-toggle" aria-label="Automatically switching from Basic Mode to Hard Mode">
          <span class="auto-toggle__thumb" aria-hidden="true"></span>
          <span>BASIC</span>
          <span>HARD</span>
        </div>
        <div class="mode-transition__title">${this.escape(hard.transitionTitle ?? `One more layer.`)}</div>
        <div class="mode-transition__copy">${this.escape(hard.transitionCopy ?? hard.task)}</div>
      </div>
    `, `mode-scene`);

    this.later(() => scene.classList.add(`is-charged`), 400);
    this.later(() => scene.querySelector(`.auto-toggle`)?.classList.add(`is-hard`), 900);
    this.later(() => this.setMode(`hard`), 1320);
    return 2900;
  }

  sceneOutro() {
    this.setMode(`hard`);
    const basic = this.formula.basic;
    const hard = this.formula.hard;
    this.setCaption(`Replay this formula or move directly to the next module.`);
    this.mount(`
      <div class="outro-lockup">
        <div class="outro-check">✓</div>
        <div class="scene__kicker">${this.escape(this.formula.displayName)} complete</div>
        <h2 class="outro-title">${this.escape(this.formula.identity.outroTitle)}</h2>
        <p class="outro-copy">Basic: <strong>${this.escape(basic.resultDisplay)}</strong> · Hard: <strong>${this.escape(hard.resultDisplay)}</strong>. ${this.escape(hard.summary)}</p>
      </div>
    `, `outro-scene`);
    return 5200;
  }

  animateWorkedExample(scene, example) {
    switch (example.visual.type) {
      case `aggregate`:
        return this.animateAggregate(scene, example);
      case `count`:
        return this.animateCount(scene, example);
      case `lookup`:
        return this.animateLookup(scene, example);
      case `logic`:
        return this.animateLogic(scene, example);
      case `threshold`:
        return this.animateThreshold(scene, example);
      case `filter`:
        return this.animateFilter(scene, example);
      default:
        return this.animateGeneric(scene, example);
    }
  }

  animateAggregate(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    const sumIndex = this.columnIndex(visual.sum.column);

    this.later(() => {
      this.highlightColumn(scene, visual.sum.column);
      note.textContent = `sum_range → ${visual.sum.range}. These are the values Excel is allowed to add.`;
      this.revealPieces(scene, [0, 1]);
    }, 800);

    visual.criteria.forEach((criterion, index) => {
      this.later(() => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `${index === 0 ? `criteria_range1` : `criteria_range${index + 1}`} → ${criterion.range}. Match “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 2);
      }, 1800 + index * 1050);
    });

    const matchAt = 1950 + visual.criteria.length * 1050;
    this.later(() => {
      this.clearTableState(scene);
      this.applyMatches(scene, visual.matchedRows, sumIndex);
      note.textContent = visual.criteria.length > 1 ? `Only rows satisfying ALL conditions remain active.` : `Only matching rows remain active.`;
      this.revealAllPieces(scene, example);
      this.setEquation(scene, visual.matchedValues.join(` + `));
    }, matchAt);

    this.later(() => {
      note.textContent = `Now combine only the highlighted values.`;
      this.flyMatchedValues(scene, visual.matchedRows, sumIndex);
    }, matchAt + 950);

    this.later(() => this.revealResult(scene, `${visual.matchedValues.join(` + `)} = ${example.resultDisplay}`), matchAt + 1850);
    return matchAt + 3000;
  }

  animateCount(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);

    visual.criteria.forEach((criterion, index) => {
      this.later(() => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `${criterion.range} tests ${this.columnLabel(criterion.column)} for “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 1);
      }, 850 + index * 1150);
    });

    const matchAt = 1100 + visual.criteria.length * 1150;
    this.later(() => {
      this.clearTableState(scene);
      this.applyMatches(scene, visual.matchedRows);
      this.revealAllPieces(scene, example);
      note.textContent = `${visual.matchedRows.length} row${visual.matchedRows.length === 1 ? `` : `s`} survived the test${visual.criteria.length > 1 ? `s` : ``}.`;
    }, matchAt);

    this.later(() => {
      this.flyRowsToResult(scene, visual.matchedRows);
      this.animateCounter(scene, visual.matchedRows.length);
      note.textContent = `Each surviving row contributes exactly +1.`;
    }, matchAt + 900);

    this.later(() => this.revealResult(scene, `COUNT = ${example.resultDisplay}`), matchAt + 1850);
    return matchAt + 3000;
  }

  animateLookup(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);
    const returnIndex = this.columnIndex(visual.returnColumn);

    this.later(() => {
      this.highlightColumn(scene, visual.lookupColumn);
      this.activateChip(scene, 0);
      this.revealPieces(scene, [0, 1, 2, 3]);
      note.textContent = `lookup_array → ${visual.lookupRange}. Scan for “${visual.lookupValue}”.`;
      this.scanColumn(scene, visual.lookupColumn, visual.matchedRow);
    }, 700);

    this.later(() => {
      this.clearTableState(scene);
      this.focusRow(scene, visual.matchedRow);
      scene.querySelector(`[data-row="${visual.matchedRow}"] [data-col="${visual.lookupColumn}"]`)?.classList.add(`is-value-match`, `cell-pulse`);
      note.textContent = `Match locked on row ${visual.matchedRow + 2}. Keep the row alignment.`;
      this.setLookupTrack(scene, `MATCH`, visual.lookupValue);
    }, 2400);

    this.later(() => {
      this.clearTableState(scene);
      this.focusRow(scene, visual.matchedRow);
      this.highlightColumn(scene, visual.returnColumn);
      scene.querySelector(`[data-row="${visual.matchedRow}"] [data-col="${visual.returnColumn}"]`)?.classList.add(`is-value-match`, `cell-pulse`);
      this.activateChip(scene, 1);
      note.textContent = `return_array → ${visual.returnRange}. Retrieve the value from the same row.`;
      this.revealProgress(scene, example, 2, 3);
      this.setLookupTrack(scene, `RETURN`, this.cellDisplay(this.formula.dataset.rows[visual.matchedRow][visual.returnColumn], this.formula.dataset.columns[returnIndex]));
    }, 3450);

    if (visual.fallback || visual.exact) {
      this.later(() => {
        this.revealAllPieces(scene, example);
        note.textContent = `${visual.fallback ? `Fallback = “${visual.fallback}”. ` : ``}${visual.exact ? `Match mode 0 forces an exact match.` : ``}`;
      }, 4450);
    }

    this.later(() => {
      this.flyCellToResult(scene, visual.matchedRow, returnIndex);
      this.revealAllPieces(scene, example);
    }, 5000);

    this.later(() => this.revealResult(scene, `Retrieved → ${example.resultDisplay}`), 5850);
    return 7000;
  }

  animateLogic(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);

    this.later(() => {
      this.focusRow(scene, visual.targetRow);
      this.revealPieces(scene, [0]);
      note.textContent = `Evaluate only the highlighted record. Each check feeds the decision gate.`;
    }, 750);

    visual.checks.forEach((check, index) => {
      this.later(() => {
        this.clearTableState(scene);
        this.focusRow(scene, visual.targetRow);
        check.columns.forEach((column) => this.highlightCell(scene, visual.targetRow, column));
        const chip = scene.querySelector(`[data-decision-check="${index}"]`);
        chip?.classList.add(check.passed ? `is-pass` : `is-fail`);
        note.textContent = `${check.label} → ${check.passed ? `TRUE` : `FALSE`}`;
        this.revealProgress(scene, example, index + 1, visual.checks.length + 1);
      }, 1450 + index * 850);
    });

    const branchAt = 1750 + visual.checks.length * 850;
    this.later(() => {
      this.revealAllPieces(scene, example);
      const gate = scene.querySelector(`[data-decision-gate]`);
      gate?.classList.add(visual.branch === `true` ? `choose-true` : `choose-false`);
      note.textContent = `The logical test resolves to ${visual.branch.toUpperCase()}. Follow that branch.`;
    }, branchAt);

    this.later(() => this.revealResult(scene, `${visual.branch.toUpperCase()} → ${example.resultDisplay}`), branchAt + 1150);
    return branchAt + 2450;
  }

  animateThreshold(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);

    this.later(() => {
      this.focusRow(scene, visual.targetRow);
      this.highlightCell(scene, visual.targetRow, visual.valueColumn);
      this.revealPieces(scene, [0]);
      note.textContent = `Start with ${visual.valueDisplay}. IFS tests thresholds from left to right.`;
      scene.querySelector(`[data-threshold-value]`)?.classList.add(`is-live`);
    }, 750);

    visual.bands.forEach((band, index) => {
      this.later(() => {
        const node = scene.querySelector(`[data-band="${index}"]`);
        const selected = index === visual.selectedIndex;
        node?.classList.add(selected ? `is-selected` : index < visual.selectedIndex ? `is-failed` : `is-waiting`);
        note.textContent = selected
          ? `${visual.valueDisplay} satisfies ${band.test}. Stop here → ${band.label}.`
          : `${band.test} → FALSE. Move to the next test.`;
        this.revealProgress(scene, example, index + 1, visual.bands.length);
      }, 1500 + index * 720);
    });

    const resultAt = 1750 + visual.selectedIndex * 720 + 1100;
    this.later(() => {
      this.revealAllPieces(scene, example);
      this.revealResult(scene, `First TRUE → ${example.resultDisplay}`);
    }, resultAt);
    return Math.max(resultAt + 1900, 5600);
  }

  animateFilter(scene, example) {
    const { visual } = example;
    const note = scene.querySelector(`[data-step-note]`);

    this.later(() => {
      scene.querySelectorAll(`tbody tr`).forEach((row) => row.classList.add(`filter-ready`));
      this.revealPieces(scene, [0, 1]);
      note.textContent = `array → ${this.formula.dataset.range.replace(`1`, `2`)}. This is the table FILTER may return.`;
    }, 700);

    visual.criteria.forEach((criterion, index) => {
      this.later(() => {
        this.clearTableState(scene);
        this.highlightColumn(scene, criterion.column);
        this.activateChip(scene, index);
        note.textContent = `include test ${index + 1}: ${this.columnLabel(criterion.column)} = “${criterion.value}”.`;
        this.revealProgress(scene, example, index + 1, visual.criteria.length + 2);
      }, 1500 + index * 950);
    });

    const filterAt = 1700 + visual.criteria.length * 950;
    this.later(() => {
      this.clearTableState(scene);
      this.applyMatches(scene, visual.matchedRows);
      this.revealAllPieces(scene, example);
      note.textContent = `${visual.matchedRows.length} rows remain TRUE. Everything else fades out.`;
    }, filterAt);

    this.later(() => {
      scene.querySelector(`[data-spill-preview]`)?.classList.add(`is-spilled`);
      note.textContent = `FILTER spills the surviving rows into a new dynamic array.`;
    }, filterAt + 1050);

    this.later(() => this.revealResult(scene, `${visual.matchedRows.length} row${visual.matchedRows.length === 1 ? `` : `s`} spilled`), filterAt + 1900);
    return filterAt + 3100;
  }

  animateGeneric(scene, example) {
    this.later(() => this.revealAllPieces(scene, example), 1000);
    this.later(() => this.revealResult(scene, example.resultDisplay), 2500);
    return 4200;
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
