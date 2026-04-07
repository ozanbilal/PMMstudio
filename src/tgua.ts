import "./style.css";

type Lang = "tr" | "en";
type ThemeMode = "dark" | "light";

// ── i18n ─────────────────────────────────────────────────────────────────────

const i18nTr: Record<string, string> = {
  pageTitle: "TGUA Maliyet Hesap",
  pageSubtitle: "Mimarlık Hizmet Bedeli Hesaplayıcısı",
  inputsTitle: "Proje Girdileri",
  minWageLabel: "Aylık Asgari Brüt Ücret (₺)",
  areaLabel: "Proje İnşaat Alanı (m²)",
  buildingClassLabel: "Bina Sınıfı",
  avgFloorAreaLabel: "Ortalama Kat Alanı — TGUA2a (m²)",
  referenceTitle: "Referans Değerler",
  unitCostLabel: "Yapı Birim Maliyeti (BM)",
  initialCostLabel: "İlk Maliyet Hesabı",
  supervisionFeeLabel: "Gözetmenlik Ücreti",
  feesTitle: "Hizmet Bedelleri",
  tgua1Label: "TGUA1",
  tgua2aLabel: "TGUA2a",
  tgua2bLabel: "TGUA2b",
  tgua3Label: "TGUA3",
  tgua4Label: "TGUA4",
  tgua5Label: "TGUA5",
  refTableTitle: "Yapı Birim Maliyet (TL/m²)",
  classHeader: "Sınıf",
  col2026: "03.02.2026",
  col2025: "31.01.2025",
  col2024: "20.02.2024",
  col2023: "12.08.2023",
  sourceLabel: "Yasal Dayanak",
  sourceText:
    "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı — <a class=\"tgua-link\" href=\"https://www.resmigazete.gov.tr/eskiler/2026/02/20260203-4.htm\" target=\"_blank\" rel=\"noopener\">Resmi Gazete, 3 Şubat 2026, Sayı: 33157</a>",
  note: "2026 yılı değerleri. KDV hariç; %15 genel gider + %10 yüklenici kârı dahil.",
};

const i18nEn: Record<string, string> = {
  pageTitle: "TGUA Cost Calculator",
  pageSubtitle: "Architecture Service Fee Calculator",
  inputsTitle: "Project Inputs",
  minWageLabel: "Monthly Gross Minimum Wage (₺)",
  areaLabel: "Project Construction Area (m²)",
  buildingClassLabel: "Building Class",
  avgFloorAreaLabel: "Average Floor Area — TGUA2a (m²)",
  referenceTitle: "Reference Values",
  unitCostLabel: "Building Unit Cost (BM)",
  initialCostLabel: "Initial Cost Estimate",
  supervisionFeeLabel: "Supervision Fee",
  feesTitle: "Service Fees",
  tgua1Label: "TGUA1",
  tgua2aLabel: "TGUA2a",
  tgua2bLabel: "TGUA2b",
  tgua3Label: "TGUA3",
  tgua4Label: "TGUA4",
  tgua5Label: "TGUA5",
  refTableTitle: "Building Unit Cost (TL/m²)",
  classHeader: "Class",
  col2026: "03.02.2026",
  col2025: "31.01.2025",
  col2024: "20.02.2024",
  col2023: "12.08.2023",
  sourceLabel: "Legal Reference",
  sourceText:
    "Ministry of Environment, Urbanization and Climate Change — <a class=\"tgua-link\" href=\"https://www.resmigazete.gov.tr/eskiler/2026/02/20260203-4.htm\" target=\"_blank\" rel=\"noopener\">Official Gazette, 3 Feb 2026, No: 33157</a>",
  note: "Values for 2026. Excluding VAT; includes 15% general expenses + 10% contractor profit.",
};

// ── Data — Resmi Gazete tarihleri: H=03.02.2026, J=31.01.2025, K=20.02.2024, L=12.08.2023 ──

interface UnitCostRow {
  cls: string;
  y2026: number;
  y2025: number;
  y2024: number | null;
  y2023: number | null;
}

const UNIT_COSTS: UnitCostRow[] = [
  { cls: "I.A",   y2026: 2600,   y2025: 2100,  y2024: 1450,  y2023: 1050 },
  { cls: "I.B",   y2026: 3900,   y2025: 3050,  y2024: 2100,  y2023: 1550 },
  { cls: "I.C",   y2026: 4200,   y2025: 3300,  y2024: null,  y2023: null },
  { cls: "I.D",   y2026: 4800,   y2025: 3900,  y2024: null,  y2023: null },
  { cls: "II.A",  y2026: 8100,   y2025: 6600,  y2024: 3500,  y2023: 2600 },
  { cls: "II.B",  y2026: 12500,  y2025: 10200, y2024: 5250,  y2023: 3800 },
  { cls: "II.C",  y2026: 15100,  y2025: 12400, y2024: 7750,  y2023: 5350 },
  { cls: "III.A", y2026: 19800,  y2025: 17100, y2024: 12250, y2023: 7500 },
  { cls: "III.B", y2026: 21050,  y2025: 18200, y2024: 14400, y2023: 9000 },
  { cls: "III.C", y2026: 23400,  y2025: 19150, y2024: null,  y2023: null },
  { cls: "IV.A",  y2026: 26450,  y2025: 21500, y2024: 15300, y2023: 10200 },
  { cls: "IV.B",  y2026: 33900,  y2025: 27500, y2024: 17400, y2023: 12050 },
  { cls: "IV.C",  y2026: 40500,  y2025: 32600, y2024: 18700, y2023: 12450 },
  { cls: "V.A",   y2026: 42350,  y2025: 34400, y2024: 21300, y2023: 13800 },
  { cls: "V.B",   y2026: 43850,  y2025: 35600, y2024: 22250, y2023: 16250 },
  { cls: "V.C",   y2026: 48750,  y2025: 39500, y2024: 24300, y2023: 18100 },
  { cls: "V.D",   y2026: 53500,  y2025: 43400, y2024: 26800, y2023: 21400 },
  { cls: "V.E",   y2026: 103500, y2025: 86250, y2024: null,  y2023: null },
];

const UNIT_COST_BY_CLASS: Record<string, number> = Object.fromEntries(
  UNIT_COSTS.map((r) => [r.cls, r.y2026])
);

// ── Calculation ───────────────────────────────────────────────────────────────

interface CalcInputs {
  minWage: number;
  area: number;
  buildingClass: string;
  avgFloorArea: number;
}

interface CalcResults {
  unitCost: number;
  initialCost: number;
  supervisionFee: number;
  tgua1: number;
  tgua2a: number;
  tgua2b: number;
  tgua3: number;
  tgua4: number;
  tgua5: number;
}

// Excel B9 formülü — doğrusal interpolasyon (lineer rate her bracket içinde)
function calcSupervisionFee(area: number, bm: number): number {
  if (area < 10_000) {
    return (area * 0.08 * bm) / 100;
  }
  if (area < 40_000) {
    const base = (0.08 * 10_000 * bm) / 100;
    const rate = 0.08 + ((area - 10_000) / 30_000) * -0.02;
    return base + (rate * bm * (area - 10_000)) / 100;
  }
  if (area < 80_000) {
    const base = (0.08 * 10_000 * bm) / 100 + (0.06 * 30_000 * bm) / 100;
    const rate = 0.06 + ((area - 40_000) / 40_000) * -0.02;
    return base + (rate * bm * (area - 40_000)) / 100;
  }
  return (
    (0.08 * 10_000 * bm) / 100 +
    (0.06 * 30_000 * bm) / 100 +
    (0.04 * 40_000 * bm) / 100 +
    ((area - 80_000) * 0.02 * bm) / 100
  );
}

// TGUA2a — Excel B13: IF(D2<1000, B2/2, IF(D2<2500, (1.5-(2500-D2)/1500)*B2, B2*1.5))
function calcTgua2a(avgFloorArea: number, minWage: number): number {
  if (avgFloorArea < 1000) return minWage / 2;
  if (avgFloorArea < 2500) return (1.5 - (2500 - avgFloorArea) / 1500) * minWage;
  return minWage * 1.5;
}

function calculate(inp: CalcInputs): CalcResults {
  const unitCost = UNIT_COST_BY_CLASS[inp.buildingClass] ?? 0;
  const initialCost = unitCost * inp.area;
  const sf = calcSupervisionFee(inp.area, unitCost);
  return {
    unitCost,
    initialCost,
    supervisionFee: sf,
    tgua1: Math.min(sf / 5, inp.minWage * 10),
    tgua2a: calcTgua2a(inp.avgFloorArea, inp.minWage),
    tgua2b: Math.max(sf / 3, inp.minWage),
    tgua3: Math.max(sf / 3, inp.minWage),
    tgua4: sf,
    tgua5: sf,
  };
}

// ── State ─────────────────────────────────────────────────────────────────────

let lang: Lang = "tr";
let theme: ThemeMode = "dark";
let inputs: CalcInputs = {
  minWage: 33030,
  area: 1564,
  buildingClass: "III.B",
  avgFloorArea: 500,
};

// ── Formatting ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

function fmtLarge(n: number): string {
  return (
    n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " ₺"
  );
}

function fmtCost(n: number | null): string {
  if (n === null) return `<span class="tgua-ref-empty">—</span>`;
  return n.toLocaleString("tr-TR");
}

function t(key: string): string {
  return (lang === "tr" ? i18nTr : i18nEn)[key] ?? key;
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function buildHeader(): string {
  return `
<header class="tgua-header">
  <div class="tgua-header-left">
    <div>
      <h1 class="tgua-title">${t("pageTitle")}</h1>
      <p class="tgua-subtitle">${t("pageSubtitle")}</p>
    </div>
  </div>
  <div class="tgua-header-right">
    <button class="tgua-ctrl-btn" id="btnLang">${lang === "tr" ? "EN" : "TR"}</button>
    <button class="tgua-ctrl-btn" id="btnTheme">${theme === "dark" ? "☀" : "☾"}</button>
  </div>
</header>`;
}

function buildInputsCard(): string {
  const classOptions = UNIT_COSTS.map(
    (r) =>
      `<option value="${r.cls}"${r.cls === inputs.buildingClass ? " selected" : ""}>${r.cls} — ${r.y2026.toLocaleString("tr-TR")} TL/m²</option>`
  ).join("");

  return `
<section class="tgua-card">
  <h2 class="tgua-card-title">${t("inputsTitle")}</h2>
  <div class="tgua-field">
    <label class="tgua-label" for="inpMinWage">${t("minWageLabel")}</label>
    <input class="tgua-input" type="number" id="inpMinWage" value="${inputs.minWage}" min="0" step="10" />
  </div>
  <div class="tgua-field">
    <label class="tgua-label" for="inpArea">${t("areaLabel")}</label>
    <input class="tgua-input" type="number" id="inpArea" value="${inputs.area}" min="0" step="1" />
  </div>
  <div class="tgua-field">
    <label class="tgua-label" for="inpClass">${t("buildingClassLabel")}</label>
    <select class="tgua-input tgua-select" id="inpClass">${classOptions}</select>
  </div>
  <div class="tgua-field">
    <label class="tgua-label" for="inpAvgFloor">${t("avgFloorAreaLabel")}</label>
    <input class="tgua-input" type="number" id="inpAvgFloor" value="${inputs.avgFloorArea}" min="0" step="1" />
  </div>
</section>`;
}

function buildReferenceCard(r: CalcResults): string {
  return `
<section class="tgua-card" id="tgua-ref-card">
  <h2 class="tgua-card-title">${t("referenceTitle")}</h2>
  <div class="tgua-result-row">
    <span class="tgua-result-label">${t("unitCostLabel")}</span>
    <span class="tgua-result-value">${r.unitCost.toLocaleString("tr-TR")} TL/m²</span>
  </div>
  <div class="tgua-result-row">
    <span class="tgua-result-label">${t("initialCostLabel")}</span>
    <span class="tgua-result-value">${fmtLarge(r.initialCost)}</span>
  </div>
  <div class="tgua-result-row tgua-result-row-last">
    <span class="tgua-result-label">${t("supervisionFeeLabel")}</span>
    <span class="tgua-result-value tgua-result-accent">${fmt(r.supervisionFee)}</span>
  </div>
</section>`;
}

function buildFeesCard(r: CalcResults): string {
  const entries: [string, number][] = [
    [t("tgua1Label"),  r.tgua1],
    [t("tgua2aLabel"), r.tgua2a],
    [t("tgua2bLabel"), r.tgua2b],
    [t("tgua3Label"),  r.tgua3],
    [t("tgua4Label"),  r.tgua4],
    [t("tgua5Label"),  r.tgua5],
  ];

  const rows = entries
    .map(
      ([label, val], i) => `
  <div class="tgua-result-row${i === entries.length - 1 ? " tgua-result-row-last" : ""}">
    <span class="tgua-result-label">${label}</span>
    <span class="tgua-result-value">${fmt(val)}</span>
  </div>`
    )
    .join("");

  return `
<section class="tgua-card" id="tgua-fees-card">
  <h2 class="tgua-card-title">${t("feesTitle")}</h2>
  ${rows}
</section>`;
}

function buildRefTableCard(): string {
  const rows = UNIT_COSTS.map((r) => {
    const active = r.cls === inputs.buildingClass;
    return `<tr class="${active ? "tgua-ref-active" : ""}" data-class="${r.cls}">
      <td>${r.cls}</td>
      <td>${r.y2026.toLocaleString("tr-TR")}</td>
      <td>${r.y2025.toLocaleString("tr-TR")}</td>
      <td>${fmtCost(r.y2024)}</td>
      <td>${fmtCost(r.y2023)}</td>
    </tr>`;
  }).join("");

  return `
<section class="tgua-card tgua-card-wide">
  <h2 class="tgua-card-title tgua-card-title-sm">${t("refTableTitle")}</h2>
  <table class="tgua-ref-table-wide">
    <thead>
      <tr>
        <th>${t("classHeader")}</th>
        <th>${t("col2026")}</th>
        <th>${t("col2025")}</th>
        <th>${t("col2024")}</th>
        <th>${t("col2023")}</th>
      </tr>
    </thead>
    <tbody id="tgua-ref-tbody">${rows}</tbody>
  </table>
</section>`;
}

function buildFooter(): string {
  return `
<footer class="tgua-footer">
  <strong>${t("sourceLabel")}:</strong> ${t("sourceText")}<br/>
  ${t("note")}
</footer>`;
}

function buildPage(): string {
  const r = calculate(inputs);
  return `
<div class="tgua-layout">
  ${buildHeader()}
  <main class="tgua-main">
    <div class="tgua-col">
      ${buildInputsCard()}
    </div>
    <div class="tgua-col">
      ${buildReferenceCard(r)}
      ${buildFeesCard(r)}
    </div>
  </main>
  ${buildRefTableCard()}
  ${buildFooter()}
</div>`;
}

// ── Events ────────────────────────────────────────────────────────────────────

function wireEvents(): void {
  document.getElementById("btnLang")?.addEventListener("click", () => {
    lang = lang === "tr" ? "en" : "tr";
    update();
  });

  document.getElementById("btnTheme")?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    update();
  });

  const onInputChange = (): void => {
    inputs = {
      minWage:
        parseFloat((document.getElementById("inpMinWage") as HTMLInputElement).value) || 0,
      area: parseFloat((document.getElementById("inpArea") as HTMLInputElement).value) || 0,
      buildingClass: (document.getElementById("inpClass") as HTMLSelectElement).value,
      avgFloorArea:
        parseFloat((document.getElementById("inpAvgFloor") as HTMLInputElement).value) || 0,
    };
    updateResults();
  };

  for (const id of ["inpMinWage", "inpArea", "inpClass", "inpAvgFloor"]) {
    document.getElementById(id)?.addEventListener("input", onInputChange);
  }
}

// ── Update & init ─────────────────────────────────────────────────────────────

function updateResults(): void {
  const r = calculate(inputs);

  const refEl = document.getElementById("tgua-ref-card");
  if (refEl) {
    const tmp = document.createElement("div");
    tmp.innerHTML = buildReferenceCard(r);
    refEl.replaceWith(tmp.firstElementChild!);
  }

  const feesEl = document.getElementById("tgua-fees-card");
  if (feesEl) {
    const tmp = document.createElement("div");
    tmp.innerHTML = buildFeesCard(r);
    feesEl.replaceWith(tmp.firstElementChild!);
  }

  document.querySelectorAll<HTMLElement>("#tgua-ref-tbody tr[data-class]").forEach((el) => {
    el.classList.toggle("tgua-ref-active", el.dataset.class === inputs.buildingClass);
  });
}

function update(): void {
  document.getElementById("app")!.innerHTML = buildPage();
  wireEvents();
}

document.documentElement.setAttribute("data-theme", "dark");
update();
