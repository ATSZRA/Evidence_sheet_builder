const stateKey = "evidence-builder-state-v1";

function makeId() {
  return crypto.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultState() {
  const firstId = makeId();
  return {
    caseName: "",
    plaintiff: "",
    defendant: "",
    court: "",
    submitDate: "令和8年6月12日",
    attorney: "原告訴訟代理人弁護士　　　　黒　葛　原　　　歩",
    prefix: "甲",
    startNumber: 1,
    activeId: firstId,
    pdfName: "",
    pdfRotation: 0,
    rows: [
      {
        id: firstId,
        number: "甲1",
        title: "",
        copyType: "写し",
        date: "",
        author: "",
        purpose: "",
      },
    ],
  };
}

let state = loadState();
let pdfObjectUrl = "";

const els = {
  list: document.querySelector("#evidence-list"),
  preview: document.querySelector("#sheet-preview"),
  modalPreview: document.querySelector("#sheet-preview-modal"),
  stamp: document.querySelector("#stamp-overlay"),
  pdfInput: document.querySelector("#pdf-input"),
  pdfViewer: document.querySelector("#pdf-viewer"),
  pdfRotator: document.querySelector("#pdf-rotator"),
  dropZone: document.querySelector("#drop-zone"),
  rotationLabel: document.querySelector("#rotation-label"),
  addRow: document.querySelector("#add-row"),
  renumber: document.querySelector("#renumber"),
  prefix: document.querySelector("#evidence-prefix"),
  startNumber: document.querySelector("#start-number"),
  print: document.querySelector("#print-sheet"),
  printFromPreview: document.querySelector("#print-from-preview"),
  previewButton: document.querySelector("#preview-button"),
  previewDialog: document.querySelector("#preview-dialog"),
  exportJson: document.querySelector("#export-json"),
  importJson: document.querySelector("#import-json"),
  clearFocus: document.querySelector("#clear-focus"),
  pdfPopout: document.querySelector("#pdf-popout"),
  rotateLeft: document.querySelector("#rotate-left"),
  rotateRight: document.querySelector("#rotate-right"),
  rotateReset: document.querySelector("#rotate-reset"),
  meta: {
    caseName: document.querySelector("#case-name"),
    plaintiff: document.querySelector("#plaintiff"),
    defendant: document.querySelector("#defendant"),
    court: document.querySelector("#court"),
    submitDate: document.querySelector("#submit-date"),
    attorney: document.querySelector("#attorney"),
  },
};

function loadState() {
  try {
    const saved = localStorage.getItem(stateKey);
    if (!saved) return createDefaultState();
    return { ...createDefaultState(), ...JSON.parse(saved) };
  } catch {
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getActiveRow() {
  return state.rows.find((row) => row.id === state.activeId) || state.rows[0];
}

function syncRowsFromInputs() {
  document.querySelectorAll(".evidence-card").forEach((card) => {
    const row = state.rows.find((item) => item.id === card.dataset.id);
    if (!row) return;

    card.querySelectorAll("[data-field]").forEach((field) => {
      row[field.dataset.field] = field.value;
    });
  });
}

function syncMetaInputs() {
  els.meta.caseName.value = state.caseName;
  els.meta.plaintiff.value = state.plaintiff;
  els.meta.defendant.value = state.defendant;
  els.meta.court.value = state.court;
  els.meta.submitDate.value = state.submitDate;
  els.meta.attorney.value = state.attorney;
  els.prefix.value = state.prefix;
  els.startNumber.value = state.startNumber;
}

function renderList() {
  els.list.innerHTML = state.rows
    .map((row) => {
      const active = row.id === state.activeId ? " active" : "";
      return `
        <section class="evidence-card${active}" data-id="${row.id}">
          <div class="card-head">
            <button class="evidence-no" data-action="activate">${escapeHtml(row.number)}</button>
            <div class="card-actions">
              <button data-action="duplicate">複製</button>
              <button data-action="delete" ${state.rows.length === 1 ? "disabled" : ""}>削除</button>
            </div>
          </div>
          <div class="card-grid">
            <label class="wide">証拠の標目
              <textarea data-field="title" rows="2">${escapeHtml(row.title)}</textarea>
            </label>
            <label>写／原本の別
              <select data-field="copyType">
                ${["写し", "原本"].map((item) =>
                  `<option value="${item}" ${row.copyType === item ? "selected" : ""}>${item}</option>`
                ).join("")}
              </select>
            </label>
            <label>作成日付
              <input data-field="date" type="text" value="${escapeHtml(row.date)}" placeholder="令和7年8月13日" />
            </label>
            <label class="wide">作成者
              <input data-field="author" type="text" value="${escapeHtml(row.author)}" />
            </label>
            <label class="wide">立証趣旨
              <textarea data-field="purpose" rows="4">${escapeHtml(row.purpose)}</textarea>
            </label>
          </div>
        </section>
      `;
    })
    .join("");
}

function buildSheetHtml() {
  syncRowsFromInputs();
  const caseLine = state.caseName ? `<div class="case-line">${escapeHtml(state.caseName)}</div>` : `<div class="case-line"></div>`;
  const plaintiff = `原告　${escapeHtml(state.plaintiff)}`;
  const defendant = `被告　${escapeHtml(state.defendant)}`;
  const court = `${escapeHtml(state.court)}　御中`;
  const rows = state.rows.map((row) => `
    <tr>
      <td class="col-no">${escapeHtml(row.number)}</td>
      <td class="col-title">${escapeHtml(row.title)}</td>
      <td class="col-copy">${escapeHtml(row.copyType)}</td>
      <td class="col-date">${escapeHtml(row.date || "")}</td>
      <td class="col-author">${escapeHtml(row.author)}</td>
      <td class="col-purpose">${escapeHtml(row.purpose)}</td>
    </tr>
  `).join("");

  return `
    ${caseLine}
    <div class="case-line">${plaintiff}</div>
    <div class="case-line">${defendant}</div>
    <h1>証　拠　説　明　書</h1>
    <div class="sheet-date">${escapeHtml(state.submitDate)}</div>
    <div class="court-line">${court}</div>
    <div class="attorney-line">${escapeHtml(state.attorney)}</div>
    <table class="evidence-table">
      <thead>
        <tr>
          <th class="col-no">号　証</th>
          <th class="col-title">標　　　　　目<br>（原本・写しの別）</th>
          <th class="col-copy"></th>
          <th class="col-date">作成年月日</th>
          <th class="col-author">作成者</th>
          <th class="col-purpose">立　証　趣　旨</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPreview() {
  const html = buildSheetHtml();
  els.preview.innerHTML = html;
  els.modalPreview.innerHTML = html;

  const active = getActiveRow();
  els.stamp.textContent = active?.number || `${state.prefix}${state.startNumber}`;
}

function renderRotation() {
  const rotation = Number(state.pdfRotation || 0);
  els.pdfRotator.style.setProperty("--pdf-rotation", `${rotation}deg`);
  els.pdfRotator.dataset.rotation = String(((rotation % 360) + 360) % 360);
  els.rotationLabel.textContent = `${rotation}°`;
}

function render() {
  syncMetaInputs();
  renderList();
  renderPreview();
  renderRotation();
  saveState();
}

function renumberRows() {
  const start = Number.parseInt(state.startNumber, 10) || 1;
  state.rows.forEach((row, index) => {
    row.number = `${state.prefix}${start + index}`;
  });
}

function addRow(afterId) {
  const index = afterId ? state.rows.findIndex((row) => row.id === afterId) + 1 : state.rows.length;
  const row = {
    id: makeId(),
    number: `${state.prefix}${(Number.parseInt(state.startNumber, 10) || 1) + index}`,
    title: "",
    copyType: "写し",
    date: "",
    author: "",
    purpose: "",
  };
  state.rows.splice(index, 0, row);
  state.activeId = row.id;
  renumberRows();
  render();
}

function setPdf(file) {
  if (!file || file.type !== "application/pdf") return;
  if (pdfObjectUrl) URL.revokeObjectURL(pdfObjectUrl);
  pdfObjectUrl = URL.createObjectURL(file);
  state.pdfName = file.name;
  els.pdfViewer.src = pdfObjectUrl;
  els.dropZone.innerHTML = `<p>${escapeHtml(file.name)}</p><small>右上の赤枠は選択中の証拠番号プレビューです。</small>`;
  saveState();
}

function setFocus(panelName) {
  document.body.dataset.focusPanel = panelName || "";
  els.clearFocus.hidden = !panelName;
}

function handleEvidenceFieldEdit(event) {
  const card = event.target.closest(".evidence-card");
  const field = event.target.dataset.field;
  if (!card || !field) return;
  const row = state.rows.find((item) => item.id === card.dataset.id);
  if (!row) return;
  row[field] = event.target.value;
  state.activeId = row.id;
  renderPreview();
  saveState();
}

els.list.addEventListener("input", handleEvidenceFieldEdit);
els.list.addEventListener("change", handleEvidenceFieldEdit);

els.list.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const card = event.target.closest(".evidence-card");
  if (!card) return;
  const row = state.rows.find((item) => item.id === card.dataset.id);
  if (!row) return;

  if (action === "activate") {
    state.activeId = row.id;
    render();
  }

  if (action === "delete" && state.rows.length > 1) {
    state.rows = state.rows.filter((item) => item.id !== row.id);
    state.activeId = state.rows[0].id;
    renumberRows();
    render();
  }

  if (action === "duplicate") {
    const clone = { ...row, id: makeId(), number: "" };
    const index = state.rows.findIndex((item) => item.id === row.id);
    state.rows.splice(index + 1, 0, clone);
    state.activeId = clone.id;
    renumberRows();
    render();
  }
});

Object.entries(els.meta).forEach(([field, input]) => {
  input.addEventListener("input", () => {
    state[field] = input.value;
    renderPreview();
    saveState();
  });
});

els.prefix.addEventListener("change", () => {
  state.prefix = els.prefix.value;
  renumberRows();
  render();
});

els.startNumber.addEventListener("input", () => {
  state.startNumber = Number.parseInt(els.startNumber.value, 10) || 1;
  renumberRows();
  render();
});

els.renumber.addEventListener("click", () => {
  renumberRows();
  render();
});

els.addRow.addEventListener("click", () => addRow());
els.print.addEventListener("click", () => {
  syncRowsFromInputs();
  renderPreview();
  saveState();
  window.print();
});
els.printFromPreview.addEventListener("click", () => {
  syncRowsFromInputs();
  renderPreview();
  saveState();
  window.print();
});

els.previewButton.addEventListener("click", () => {
  syncRowsFromInputs();
  renderPreview();
  saveState();
  els.previewDialog.showModal();
});

document.querySelectorAll("[data-focus]").forEach((button) => {
  button.addEventListener("click", () => setFocus(button.dataset.focus));
});

els.clearFocus.addEventListener("click", () => setFocus(""));

els.pdfPopout.addEventListener("click", () => {
  if (pdfObjectUrl) {
    window.open(pdfObjectUrl, "_blank", "noopener,noreferrer");
    return;
  }
  setFocus("viewer");
});

els.rotateLeft.addEventListener("click", () => {
  state.pdfRotation = (Number(state.pdfRotation || 0) - 90) % 360;
  renderRotation();
  saveState();
});

els.rotateRight.addEventListener("click", () => {
  state.pdfRotation = (Number(state.pdfRotation || 0) + 90) % 360;
  renderRotation();
  saveState();
});

els.rotateReset.addEventListener("click", () => {
  state.pdfRotation = 0;
  renderRotation();
  saveState();
});

els.pdfInput.addEventListener("change", () => {
  setPdf(els.pdfInput.files?.[0]);
});

["dragenter", "dragover"].forEach((type) => {
  els.dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((type) => {
  els.dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    els.dropZone.classList.remove("dragging");
  });
});

els.dropZone.addEventListener("drop", (event) => {
  setPdf(event.dataTransfer.files?.[0]);
});

els.exportJson.addEventListener("click", () => {
  syncRowsFromInputs();
  saveState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "証拠説明書データ.json";
  a.click();
  URL.revokeObjectURL(url);
});

els.importJson.addEventListener("change", async () => {
  const file = els.importJson.files?.[0];
  if (!file) return;
  const text = await file.text();
  state = { ...createDefaultState(), ...JSON.parse(text) };
  render();
});

render();
