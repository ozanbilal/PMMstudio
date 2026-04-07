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

const CLASS_INFO: Record<string, string[]> = {
  "I.A":   ["Basit hayvancılık ve tarım yapıları", "Çardaklar, gölgelikler", "İhata duvarları (3 m'ye kadar)", "Plastik örtülü seralar"],
  "I.B":   ["Basit padok ve küçükbaş hayvan ağılları", "Cam/sert plastik örtülü seralar", "Depo amaçlı kayadan oyma yapılar", "Kalıcı kullanımlı yardımcı yapılar"],
  "I.C":   ["Betonarme ve kâgir su depoları", "Büyükbaş hayvan ahırları", "Elektrikli araç şarj istasyonları", "İstinat duvarları", "Palplanş ve ankrajlı perde", "Şişirme yapılar"],
  "I.D":   ["Güneş enerji santralleri (GES)"],
  "II.A":  ["Deniz iskeleleri", "Genel amaçlı depolar (betonarme, çelik)", "Hayvan bakımevi ve barınakları", "Hayvan satış pazar yerleri", "Tarımsal endüstri yapıları"],
  "II.B":  ["Botanik, jeopark ve tema park yapıları", "Geçici yapılar, konteyner kentler", "Halı sahalar, semt sahaları", "Hangar yapıları", "Kapalı pazar yerleri"],
  "II.C":  ["Bağ/dağ/köy ve yayla evleri (brüt < 200 m²)", "Bungalov evleri", "Hal binaları", "Mezbahalar", "Sanayi tesisleri (0–500 kg/m²)", "Taziye evleri"],
  "III.A": ["Akaryakıt ve otogaz dolum istasyonları", "Aquaparklar", "Garajlar, katlı otoparklar", "Havalimanı destek binaları", "İtfaiye binaları", "Kayadan oyma konutlar", "Konutlar (apartman, 3 kata kadar)", "Kreşler, okul öncesi eğitim", "Köy ve mahalle konakları", "Muhtarlık binaları", "Özelliği olan depolar (kimyasal, soğuk hava)", "Semt postaneleri", "Sosyal tesisler (havuz, hamam, sauna)"],
  "III.B": ["112 acil sağlık hizmetleri istasyonları", "Aile sağlığı merkezleri", "Apart oteller", "Gece kulübü ve eğlence yerleri", "Hayvan hastaneleri", "İbadethaneler (< 500 kişi)", "İlçe tipi otobüs terminalleri", "İlkokul ve ortaokul yapıları", "İş merkezleri (3 kata kadar)", "Kapalı spor salonları (< 1.000 seyirci)", "Konutlar (yükseklik ≤ 21,50 m, 3 kat üzeri)", "Kütüphaneler (< 1.000 m²)", "Liman binaları ve marinalar", "Müstakil/ikiz konutlar (bağımsız bölüm < 200 m²)", "Sanayi tesisleri (501–3.000 kg/m²)", "Sanayi tesisleri idari binaları"],
  "III.C": ["Ağız ve diş sağlığı merkezleri", "Emniyet ve jandarma karakol binaları", "Halk eğitim merkezleri", "Huzurevi, rehabilitasyon, yaşlı bakım", "İl tipi otobüs terminalleri", "İş merkezleri (≤ 21,50 m, 3 kat üzeri)", "Kaplıcalar, termal tesisler", "Konutlar (21,50 m–30,50 m arası)", "Lise ve dengi okul yapıları", "Müstakil/ikiz konutlar (bağımsız bölüm 200–500 m²)", "Öğrenci yurtları", "Tren gar/istasyon binaları (< 1.500 m²)"],
  "IV.A":  ["Açık cezaevleri", "Alışveriş merkezleri (< 25.000 m²)", "AR-GE merkezleri, laboratuvarlar", "Enstitüler, fakülteler, yüksekokullar", "Fuar merkezleri", "İlçe tipi kamu binaları", "İş merkezleri (21,50–30,50 m arası)", "Kapalı spor salonları (1.000–5.000 seyirci)", "Konutlar (30,50–51,50 m arası)", "Oteller (1 ve 2 yıldızlı)", "Sanayi tesisleri (> 3.000 kg/m²)", "Tıp merkezleri", "Yüzme havuzu tesisleri"],
  "IV.B":  ["Arşiv binaları", "Banka ve borsa binaları", "Büyük (merkez) postaneler", "Düğün salonları", "Fizik tedavi ve rehabilitasyon merkezleri", "İbadethaneler (500–1.500 kişi)", "İş merkezleri (30,50–51,50 m arası)", "Kapalı spor salonları (≥ 5.000 seyirci)", "Konutlar (yükseklik > 51,50 m)", "Müstakil/ikiz konutlar (bağımsız bölüm ≥ 500 m²)", "Radyo ve televizyon istasyon binaları", "Üniversite idari binaları"],
  "IV.C":  ["Adalet sarayları", "Alışveriş merkezleri (≥ 25.000 m²)", "Bakanlık binaları", "Büyükşehir belediye hizmet binaları", "Hastaneler (< 200 yatak)", "İl tipi kamu binaları", "Kapalı cezaevleri", "Kütüphaneler (≥ 1.000 m²)", "Olimpik spor tesisleri", "Oteller (3 yıldızlı)", "Tatil köyleri", "Tren gar/istasyon binaları (≥ 1.500 m²)"],
  "V.A":   ["Büyükelçilik ve konsolosluk binaları", "Eğitim ve araştırma hastaneleri", "İş merkezleri (yükseklik > 51,50 m)", "Karma kullanımlı yapılar (AVM + ofis/konut)", "Stadyumlar ve hipodromlar", "Üniversite kampüsleri"],
  "V.B":   ["Deniz, hava ve kara kuvvetleri komutanlığı tesisleri", "Hastaneler (200–400 yatak)", "İbadethaneler (≥ 1.500 kişi)", "Jandarma ve sahil güvenlik komutanlığı tesisleri", "Oteller (4 yıldızlı)"],
  "V.C":   ["Bale, opera ve tiyatro yapıları", "Hastaneler (≥ 400 yatak)", "Kongre ve/veya kültür merkezleri", "Müze yapıları", "Tarihi eser niteliğinde restore/aslına uygun yapılar"],
  "V.D":   ["Havalimanı terminal binaları", "Metro istasyonları", "Oteller (5 yıldızlı)", "Şehir hastaneleri", "Yüksek güvenlikli cezaevleri"],
  "V.E":   ["Rüzgâr enerji santralleri (RES)"],
};

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

function buildClassPickerHTML(): string {
  const sel = UNIT_COSTS.find((r) => r.cls === inputs.buildingClass)!;
  const btnLabel = `${sel.cls} — ${sel.y2026.toLocaleString("tr-TR")} TL/m²`;
  const optRows = UNIT_COSTS.map((r) => {
    const active = r.cls === inputs.buildingClass;
    return `<div class="tgua-cls-option${active ? " tgua-cls-option-active" : ""}" role="option" data-cls="${r.cls}" aria-selected="${active}">
      <span class="tgua-cls-opt-code">${r.cls}</span>
      <span class="tgua-cls-opt-price">${r.y2026.toLocaleString("tr-TR")}</span>
    </div>`;
  }).join("");
  const infoItems = (CLASS_INFO[inputs.buildingClass] ?? []).map((i) => `<li>${i}</li>`).join("");
  return `<div class="tgua-cls-picker" id="tgua-cls-picker">
  <button class="tgua-cls-btn" id="tgua-cls-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
    <span class="tgua-cls-btn-label" id="tgua-cls-btn-label">${btnLabel}</span>
    <svg class="tgua-cls-chevron" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="tgua-cls-panel" id="tgua-cls-panel" hidden role="listbox">
    <div class="tgua-cls-list" id="tgua-cls-list">${optRows}</div>
    <div class="tgua-cls-info" id="tgua-cls-info">
      <div class="tgua-cls-info-header">${sel.cls} — ${sel.y2026.toLocaleString("tr-TR")} TL/m²</div>
      <ul class="tgua-cls-info-list">${infoItems}</ul>
    </div>
  </div>
</div>`;
}

function buildInputsCard(): string {
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
    <label class="tgua-label" for="tgua-cls-btn">${t("buildingClassLabel")}</label>
    ${buildClassPickerHTML()}
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
      ...inputs,
      minWage:
        parseFloat((document.getElementById("inpMinWage") as HTMLInputElement).value) || 0,
      area: parseFloat((document.getElementById("inpArea") as HTMLInputElement).value) || 0,
      avgFloorArea:
        parseFloat((document.getElementById("inpAvgFloor") as HTMLInputElement).value) || 0,
    };
    updateResults();
  };

  for (const id of ["inpMinWage", "inpArea", "inpAvgFloor"]) {
    document.getElementById(id)?.addEventListener("input", onInputChange);
  }

  wireClassPicker();
}

// ── Class Picker ──────────────────────────────────────────────────────────────

function renderInfo(container: HTMLElement, cls: string): void {
  const row = UNIT_COSTS.find((r) => r.cls === cls)!;
  const items = CLASS_INFO[cls] ?? [];
  container.innerHTML = `
    <div class="tgua-cls-info-header">${cls} — ${row.y2026.toLocaleString("tr-TR")} TL/m²</div>
    <ul class="tgua-cls-info-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

function wireClassPicker(): void {
  const picker = document.getElementById("tgua-cls-picker");
  const btn    = document.getElementById("tgua-cls-btn");
  const panel  = document.getElementById("tgua-cls-panel") as HTMLElement | null;
  const list   = document.getElementById("tgua-cls-list");
  const info   = document.getElementById("tgua-cls-info") as HTMLElement | null;
  if (!picker || !btn || !panel || !list || !info) return;

  const open  = () => { panel.hidden = false; btn.setAttribute("aria-expanded", "true"); };
  const close = () => { panel.hidden = true;  btn.setAttribute("aria-expanded", "false"); };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.hidden ? open() : close();
  });

  list.addEventListener("mouseover", (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>(".tgua-cls-option");
    if (!opt) return;
    list.querySelectorAll(".tgua-cls-option-hover").forEach((el) => el.classList.remove("tgua-cls-option-hover"));
    opt.classList.add("tgua-cls-option-hover");
    renderInfo(info, opt.dataset.cls!);
  });

  list.addEventListener("click", (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLElement>(".tgua-cls-option");
    if (!opt) return;
    const cls = opt.dataset.cls!;
    inputs.buildingClass = cls;
    const row = UNIT_COSTS.find((r) => r.cls === cls)!;
    document.getElementById("tgua-cls-btn-label")!.textContent =
      `${cls} — ${row.y2026.toLocaleString("tr-TR")} TL/m²`;
    list.querySelectorAll(".tgua-cls-option-active").forEach((el) => el.classList.remove("tgua-cls-option-active"));
    opt.classList.add("tgua-cls-option-active");
    opt.setAttribute("aria-selected", "true");
    renderInfo(info, cls);
    close();
    updateResults();
  });

  document.addEventListener("click", (e) => {
    if (!picker.contains(e.target as Node)) close();
  }, { capture: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
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
