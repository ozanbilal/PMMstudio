import "./style.css";
import Plotly from "plotly.js-dist-min";

type Shape = "rect" | "circle";
type CodeMode = "ts500" | "ts500_tbdy" | "aci318_19";
type ConcreteModel = "ts500_block" | "mander_core_cover";
type Lang = "tr" | "en";
type ThemeMode = "dark" | "light";
type PSignMode = "compression_positive" | "compression_negative";
type ComplianceStatus = "pass" | "fail" | "info";
type StatusLevel = "info" | "danger";

interface WasmExports {
  setConcreteModel: (model: number, tieSpacingConf: number) => void;
  configureRect: (
    width: number,
    height: number,
    cover: number,
    tieDia: number,
    barDia: number,
    barsX: number,
    barsY: number,
    useDoubleLayer: number,
    barsX2: number,
    barsY2: number,
    layerSpacing: number,
    coverToCenter: number,
    fck: number,
    fyk: number,
    gammaC: number,
    gammaS: number,
    esMpa: number,
    epsCu: number,
    mesh: number,
    nAngle: number,
    nDepth: number
  ) => number;
  configureCircle: (
    diameter: number,
    cover: number,
    tieDia: number,
    barDia: number,
    bars: number,
    useDoubleLayer: number,
    bars2: number,
    layerSpacing: number,
    coverToCenter: number,
    fck: number,
    fyk: number,
    gammaC: number,
    gammaS: number,
    esMpa: number,
    epsCu: number,
    mesh: number,
    nAngle: number,
    nDepth: number
  ) => number;
  setDesignFactors: (phiP: number, phiM: number, pCutoff: number) => void;
  evaluateLoad: (p: number, mx: number, my: number) => number;
  getLastPcap: () => number;
  getLastMxcap: () => number;
  getLastMycap: () => number;
  getLastScale: () => number;
  getLastDcr: () => number;
  getLastOk: () => number;
  getPointCount: () => number;
  getPointP: (index: number) => number;
  getPointMx: (index: number) => number;
  getPointMy: (index: number) => number;
  buildMomentCurvature: (
    pKn: number,
    nx: number,
    ny: number,
    nSteps: number,
    fck: number,
    fyk: number,
    gammaC: number,
    gammaS: number,
    esMpa: number,
    barDia: number
  ) => number;
  getMcCount: () => number;
  getMcPhi: (index: number) => number;
  getMcMoment: (index: number) => number;
  getMcNeutralAxis: (index: number) => number;
  getMcEpsC: (index: number) => number;
  getMcEpsS: (index: number) => number;
}

interface LoadCase {
  name: string;
  pu: number;
  mux: number;
  muy: number;
}

interface SectionDef {
  id: number;
  name: string;
  shape: Shape;
  width: string;
  height: string;
  diameter: string;
  barsX: string;
  barsY: string;
  bars: string;
  useDoubleLayer: boolean;
  barsX2: string;
  barsY2: string;
  bars2: string;
  layerSpacing: string;
  cover: string;
  tieDia: string;
  barDia: string;
  tieSpacingConf: string;
  tieSpacingMid: string;
  coverToCenter: boolean;
}

type LoadSheetCol = "name" | "pu" | "mux" | "muy";

interface LoadSheetRow {
  name: string;
  pu: string;
  mux: string;
  muy: string;
}

interface LoadSheetValidationIssue {
  row: number;
  col: LoadSheetCol;
  message: string;
}

interface LoadCellRange {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

interface ReportSectionOptions {
  cover: boolean;
  summary: boolean;
  visuals: boolean;
  loadInput: boolean;
  loadResults: boolean;
  compliance: boolean;
  mphi: boolean;
  appendix: boolean;
}

interface ReportMeta {
  project: string;
  company: string;
  documentTitle: string;
  client: string;
  preparedBy: string;
  checkedBy: string;
  revision: string;
  reportDate: string;
  logoDataUrl: string;
  sections: ReportSectionOptions;
}

interface ProjectInputState {
  codeMode: CodeMode;
  concreteModel: ConcreteModel;
  materialPreset: string;
  steelPreset: string;
  shape: Shape;
  width: string;
  height: string;
  diameter: string;
  barsX: string;
  barsY: string;
  bars: string;
  useDoubleLayer: boolean;
  barsX2: string;
  barsY2: string;
  bars2: string;
  layerSpacing: string;
  cover: string;
  tieDia: string;
  barDia: string;
  tieSpacingConf: string;
  tieSpacingMid: string;
  coverToCenter: boolean;
  useExpectedStrength: boolean;
  expectedFckFactor: string;
  expectedFykFactor: string;
  fck: string;
  fyk: string;
  gammaC: string;
  gammaS: string;
  es: string;
  epsCu: string;
  mesh: string;
  nAngle: string;
  nDepth: string;
  phiP: string;
  phiM: string;
  pCutoffRatio: string;
  pVisualScale: string;
  surfaceOpacity: string;
  pSign: PSignMode;
  projection: string;
  showNominalSurface: boolean;
  sliceAngle: string;
  sliceHideZero: boolean;
  mcP: string;
  mcAngle: string;
  mcSteps: string;
  controlsOpen: boolean;
}

interface ProjectReportState {
  company: string;
  documentTitle: string;
  project: string;
  client: string;
  preparedBy: string;
  checkedBy: string;
  revision: string;
  reportDate: string;
  logoDataUrl: string;
  logoName: string;
  sections: ReportSectionOptions;
}

interface ProjectFileV1 {
  schema: "pmmstudio-project";
  version: 1;
  savedAt: string;
  input: ProjectInputState;
  sections?: SectionDef[];
  loadSheet: LoadSheetRow[];
  report: ProjectReportState;
}

interface MphiReportSection {
  angleDeg: number;
  axialLoadKn: number;
  data: McData;
  keyPoints: McKeyPoints;
  imageDataUrl: string;
}

interface ReportSnapshot {
  meta: ReportMeta;
  input: AppInput;
  loadCases: LoadCase[];
  results: ResultRow[];
  compliance: ComplianceCheck[];
  axis: AxisExportData;
  pmmPointCount: number;
  maxDcr: number;
  minDcr: number;
  failCount: number;
  passCount: number;
  infoCount: number;
  sectionPreviewDataUrl: string;
  pmmCloudDataUrl: string;
  pmm3dDataUrl: string;
  mphi0: MphiReportSection;
  mphi90: MphiReportSection;
}

interface ResultRow extends LoadCase {
  pcap: number;
  mxcap: number;
  mycap: number;
  scale: number;
  dcr: number;
  ok: boolean;
}

interface PmmPoint {
  p: number;
  mx: number;
  my: number;
}

interface ComplianceCheck {
  code: string;
  clause: string;
  description: string;
  value: string;
  limit: string;
  status: ComplianceStatus;
  note: string;
}

interface AppInput {
  codeMode: CodeMode;
  concreteModel: ConcreteModel;
  useExpectedStrength: boolean;
  expectedFckFactor: number;
  expectedFykFactor: number;
  shape: Shape;
  widthM: number;
  heightM: number;
  diameterM: number;
  barsX: number;
  barsY: number;
  bars: number;
  useDoubleLayer: boolean;
  barsX2: number;
  barsY2: number;
  bars2: number;
  layerSpacingMm: number;
  coverM: number;
  tieDiaMm: number;
  barDiaMm: number;
  tieSpacingConfMm: number;
  tieSpacingMidMm: number;
  coverToCenter: boolean;
  fck: number;
  fyk: number;
  gammaC: number;
  gammaS: number;
  es: number;
  epsCu: number;
  mesh: number;
  nAngle: number;
  nDepth: number;
  phiP: number;
  phiM: number;
  pCutoffRatio: number;
  pVisualScale: number;
  pSignMode: PSignMode;
  loads: LoadCase[];
}

interface MaterialPresetValues {
  fck: number;
  fyk: number;
  gammaC: number;
  gammaS: number;
  es: number;
  epsCu: number;
}

interface SteelPresetValues {
  fyk: number;
}

const MATERIAL_PRESETS = {
  "ts500-c25-30": {
    fck: 25,
    fyk: 420,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "ts500-c30-35": {
    fck: 30,
    fyk: 420,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "ts500-c35-40": {
    fck: 35,
    fyk: 420,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "ts500-c40-50": {
    fck: 40,
    fyk: 420,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "ts500-c45-55": {
    fck: 45,
    fyk: 420,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c25-30": {
    fck: 25,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c30-37": {
    fck: 30,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c35-45": {
    fck: 35,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c40-50": {
    fck: 40,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c45-55": {
    fck: 45,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "eu-c50-60": {
    fck: 50,
    fyk: 500,
    gammaC: 1.5,
    gammaS: 1.15,
    es: 200000,
    epsCu: 0.003,
  },
  "aci-fc-30": {
    fck: 30,
    fyk: 420,
    gammaC: 1,
    gammaS: 1,
    es: 200000,
    epsCu: 0.003,
  },
  "aci-fc-35": {
    fck: 35,
    fyk: 420,
    gammaC: 1,
    gammaS: 1,
    es: 200000,
    epsCu: 0.003,
  },
  "aci-fc-40": {
    fck: 40,
    fyk: 420,
    gammaC: 1,
    gammaS: 1,
    es: 200000,
    epsCu: 0.003,
  },
  "aci-fc-45": {
    fck: 45,
    fyk: 420,
    gammaC: 1,
    gammaS: 1,
    es: 200000,
    epsCu: 0.003,
  },
} as const;

const STEEL_PRESETS = {
  "steel-ts500-s220": { fyk: 220 },
  "steel-ts500-s275": { fyk: 275 },
  "steel-ts500-s320": { fyk: 320 },
  "steel-ts500-s420": { fyk: 420 },
  "steel-ts500-s500": { fyk: 500 },
  "steel-eu-b400": { fyk: 400 },
  "steel-eu-b500a": { fyk: 500 },
  "steel-eu-b500b": { fyk: 500 },
  "steel-eu-b550b": { fyk: 550 },
  "steel-eu-b600b": { fyk: 600 },
  "steel-aci-gr40": { fyk: 276 },
  "steel-aci-gr60": { fyk: 414 },
  "steel-aci-gr75": { fyk: 517 },
} as const;

type MaterialPresetId = keyof typeof MATERIAL_PRESETS;
type SteelPresetId = keyof typeof STEEL_PRESETS;

function getMaterialPreset(id: string): MaterialPresetValues | null {
  if (!Object.prototype.hasOwnProperty.call(MATERIAL_PRESETS, id)) return null;
  return MATERIAL_PRESETS[id as MaterialPresetId];
}

function getSteelPreset(id: string): SteelPresetValues | null {
  if (!Object.prototype.hasOwnProperty.call(STEEL_PRESETS, id)) return null;
  return STEEL_PRESETS[id as SteelPresetId];
}

function isMaterialPresetId(value: string): value is MaterialPresetId | "custom" {
  return value === "custom" || Object.prototype.hasOwnProperty.call(MATERIAL_PRESETS, value);
}

function isSteelPresetId(value: string): value is SteelPresetId | "custom" {
  return value === "custom" || Object.prototype.hasOwnProperty.call(STEEL_PRESETS, value);
}

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

app.innerHTML = `
  <div class="app-shell">
    <header class="hero">
      <div class="hero-copy">
        <p class="eyebrow" data-i18n="kicker">TS500 + WebAssembly</p>
        <h1 data-i18n="title">Concrete Column PMM Studio</h1>
        <p class="sub" data-i18n="subtitle">Dairesel ve dörtgen kesit için tarayıcıda çalışan PMM/DCR kontrol aracı</p>
      </div>
      <div class="hero-actions">
        <div class="hero-controls hero-controls--toggles">
          <button id="lang-toggle" type="button" class="hero-ctrl-btn" aria-label="Dil / Language">EN</button>
          <button id="theme-toggle" type="button" class="hero-ctrl-btn hero-ctrl-btn-theme" aria-label="Tema / Theme">☀</button>
        </div>
      </div>

      <svg class="hero-pmm" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pmm-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#5be7ff" stop-opacity="0" />
            <stop offset="0.22" stop-color="#5be7ff" stop-opacity="1" />
            <stop offset="0.62" stop-color="#e0882c" stop-opacity="1" />
            <stop offset="1" stop-color="#e0882c" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="pmm-scan-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="#5be7ff" stop-opacity="0" />
            <stop offset="0.5" stop-color="#5be7ff" stop-opacity="1" />
            <stop offset="1" stop-color="#5be7ff" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path class="hero-pmm__axis hero-pmm__axis--x" d="M120 60 L1080 60" />
        <path class="hero-pmm__axis hero-pmm__axis--y" d="M600 12 L600 108" />

        <path class="hero-pmm__ring hero-pmm__ring--outer" d="M120 60 C300 15 900 15 1080 60 C900 105 300 105 120 60 Z" />
        <path class="hero-pmm__ring hero-pmm__ring--mid" d="M190 60 C338 25 862 25 1010 60 C862 95 338 95 190 60 Z" />
        <path class="hero-pmm__ring hero-pmm__ring--inner" d="M260 60 C378 34 822 34 940 60 C822 86 378 86 260 60 Z" />
        <path class="hero-pmm__ring hero-pmm__ring--core" d="M330 60 C422 42 778 42 870 60 C778 78 422 78 330 60 Z" />

        <path class="hero-pmm__scan-shell" stroke="url(#pmm-grad)" d="M120 60 C300 15 900 15 1080 60 C900 105 300 105 120 60 Z" />
        <line class="hero-pmm__scan-line" x1="160" y1="14" x2="160" y2="106" stroke="url(#pmm-scan-grad)" />

        <circle class="hero-pmm__point hero-pmm__point--a" cx="655" cy="48" r="3.2" />
        <circle class="hero-pmm__point hero-pmm__point--b" cx="712" cy="66" r="2.7" />
        <circle class="hero-pmm__point hero-pmm__point--c" cx="540" cy="73" r="2.7" />
      </svg>
    </header>

    <main id="workspace-main" class="workspace">
      <details class="panel controls accordion controls-accordion" id="controls-accordion" open>
        <summary class="accordion-head controls-accordion-head">
          <h2 data-i18n="headingInputs">Girdi ve Kesit Tanımı</h2>
          <span class="accordion-hint" data-i18n="accordionHint">Aç / Kapat</span>
        </summary>
        <div class="accordion-body controls-accordion-body">
        <div class="panel-head panel-head-inline controls-panel-actions">
          <div class="panel-head-actions">
            <button id="run-btn" class="run-btn" data-i18n="btnRun">PMM Hesapla</button>
          </div>
        </div>
        <section class="status-console status-console--panel" aria-live="polite">
          <p class="status-console-title" data-i18n="headingRunLog">Çalışma Günlüğü</p>
          <p id="status" class="status status-chip" data-i18n="statusWasmLoading">WASM modülü yükleniyor...</p>
          <ol id="status-log" class="status-log">
            <li class="status-log-empty" data-i18n="statusLogEmpty">Henüz kayıt yok.</li>
          </ol>
        </section>

        <div class="controls-groups">
          <section class="input-group input-group--design">
            <div class="input-group-head">
              <h3 data-i18n="headingGroupDesign">Tasarım Seçimleri</h3>
            </div>
            <div class="grid controls-top-grid">
              <label>
                <span data-i18n="labelCodeMode">Kod Modu</span>
                <select id="code-mode">
                  <option value="ts500_tbdy" data-i18n="optCodeTs500Tbdy">TS500 + TBDY 2018 (Kolon)</option>
                  <option value="ts500" data-i18n="optCodeTs500">TS500</option>
                  <option value="aci318_19" data-i18n="optCodeAci318_19">ACI 318-19 (Column)</option>
                </select>
              </label>

              <label>
                <span data-i18n="labelConcreteModel">Beton modeli</span>
                <select id="concrete-model">
                  <option value="ts500_block" data-i18n="optConcreteTs500Block">TS500 eşdeğer blok</option>
                  <option value="mander_core_cover" data-i18n="optConcreteMander">Mander (core+cover)</option>
                </select>
              </label>
            </div>
          </section>

          <section class="input-group input-group--section">
            <div class="input-group-head">
              <h3 data-i18n="headingGroupSection">Kesit ve Donatı</h3>
              <button id="section-add-btn" type="button" class="action-btn-lite" data-i18n="btnSectionAdd">+ Kesit Ekle</button>
            </div>
            <div id="section-strip" class="section-strip"></div>
            <div id="section-form-body">
              <div class="grid controls-grid controls-grid--section">
                <label>
                  <span data-i18n="labelShape">Kesit Tipi</span>
                  <select id="shape">
                    <option value="rect" data-i18n="optShapeRect">Dörtgen</option>
                    <option value="circle" data-i18n="optShapeCircle">Dairesel</option>
                  </select>
                </label>
                <label id="field-width">
                  <span data-i18n="labelWidth">Genişlik b (m)</span>
                  <input id="width" type="number" value="0.40" min="0.01" step="0.01" />
                </label>
                <label id="field-height">
                  <span data-i18n="labelHeight">Yükseklik h (m)</span>
                  <input id="height" type="number" value="0.60" min="0.01" step="0.01" />
                </label>

                <label id="field-diameter" class="hidden">
                  <span data-i18n="labelDiameter">Çap D (m)</span>
                  <input id="diameter" type="number" value="0.60" min="0.01" step="0.01" />
                </label>

                <label id="field-bars-x">
                  <span data-i18n="labelBarsX">Üst/alt bar adedi</span>
                  <input id="bars-x" type="number" value="4" min="2" step="1" />
                </label>
                <label id="field-bars-y">
                  <span data-i18n="labelBarsY">Sol/sağ bar adedi</span>
                  <input id="bars-y" type="number" value="4" min="2" step="1" />
                </label>
                <label id="field-bars" class="hidden">
                  <span data-i18n="labelBars">Dairesel toplam bar</span>
                  <input id="bars" type="number" value="12" min="3" step="1" />
                </label>
                <label id="field-double-layer" class="checkbox-inline">
                  <input id="double-layer" type="checkbox" />
                  <span data-i18n="labelDoubleLayer">Çift sıra donatı kullan</span>
                </label>
                <label id="field-bars-x2" class="hidden">
                  <span data-i18n="labelBarsX2">2. sıra üst/alt bar adedi</span>
                  <input id="bars-x2" type="number" value="2" min="2" step="1" />
                </label>
                <label id="field-bars-y2" class="hidden">
                  <span data-i18n="labelBarsY2">2. sıra sol/sağ bar adedi</span>
                  <input id="bars-y2" type="number" value="2" min="2" step="1" />
                </label>
                <label id="field-bars-2" class="hidden">
                  <span data-i18n="labelBars2">2. halka bar adedi</span>
                  <input id="bars-2" type="number" value="6" min="3" step="1" />
                </label>
                <label id="field-layer-spacing" class="hidden">
                  <span data-i18n="labelLayerSpacing">Sıra eksenleri arası a_row (mm)</span>
                  <input id="layer-spacing" type="number" value="60" min="20" step="5" />
                </label>

                <label>
                  <span data-i18n="labelCover">Cover (m)</span>
                  <input id="cover" type="number" value="0.04" min="0.005" step="any" />
                </label>
                <label>
                  <span data-i18n="labelTieDia">Etriye çapı (mm)</span>
                  <input id="tie-dia" type="number" value="10" min="4" step="1" />
                </label>
                <label>
                  <span data-i18n="labelBarDia">Boyuna donatı çapı (mm)</span>
                  <input id="bar-dia" type="number" value="16" min="6" step="1" />
                </label>

                <label>
                  <span data-i18n="labelTieSpacingConf">Sarılma bölgesi etriye aralığı s_conf (mm)</span>
                  <input id="tie-spacing-conf" type="number" value="100" min="30" step="5" />
                </label>
                <label>
                  <span data-i18n="labelTieSpacingMid">Orta bölge etriye aralığı s_mid (mm)</span>
                  <input id="tie-spacing-mid" type="number" value="150" min="30" step="5" />
                </label>
              </div>

              <label class="checkbox">
                <input id="cover-to-center" type="checkbox" />
                <span data-i18n="labelCoverToCenter">Cover değeri donatı merkezine kadar verildi</span>
              </label>
            </div>
            </section>

            <section class="input-group input-group--analysis">
              <div class="input-group-head">
                <h3 data-i18n="headingGroupAnalysis">Malzeme ve Analiz</h3>
              </div>
              <div class="grid controls-grid controls-grid--analysis">
                <label>
                  <span data-i18n="labelMaterialPreset">Hazır beton sınıfı</span>
                  <select id="material-preset">
                    <option value="custom" data-i18n="optMaterialPresetCustom">Özel</option>
                    <optgroup label="TS500 / TBDY" data-preset-family="ts500">
                      <option value="ts500-c25-30" data-i18n="optMaterialPresetTs500C25_30">C25/30</option>
                      <option value="ts500-c30-35" data-i18n="optMaterialPresetTs500C30_35">C30/35</option>
                      <option value="ts500-c35-40" data-i18n="optMaterialPresetTs500C35_40">C35/40</option>
                      <option value="ts500-c40-50" data-i18n="optMaterialPresetTs500C40_50">C40/50</option>
                      <option value="ts500-c45-55" data-i18n="optMaterialPresetTs500C45_55">C45/55</option>
                    </optgroup>
                    <optgroup label="Eurocode" data-preset-family="eu">
                      <option value="eu-c25-30" data-i18n="optMaterialPresetEuC25_30">C25/30</option>
                      <option value="eu-c30-37" data-i18n="optMaterialPresetEuC30_37">C30/37</option>
                      <option value="eu-c35-45" data-i18n="optMaterialPresetEuC35_45">C35/45</option>
                      <option value="eu-c40-50" data-i18n="optMaterialPresetEuC40_50">C40/50</option>
                      <option value="eu-c45-55" data-i18n="optMaterialPresetEuC45_55">C45/55</option>
                      <option value="eu-c50-60" data-i18n="optMaterialPresetEuC50_60">C50/60</option>
                    </optgroup>
                    <optgroup label="ACI 318" data-preset-family="aci">
                      <option value="aci-fc-30" data-i18n="optMaterialPresetAciF30">f'c=30 MPa</option>
                      <option value="aci-fc-35" data-i18n="optMaterialPresetAciF35">f'c=35 MPa</option>
                      <option value="aci-fc-40" data-i18n="optMaterialPresetAciF40">f'c=40 MPa</option>
                      <option value="aci-fc-45" data-i18n="optMaterialPresetAciF45">f'c=45 MPa</option>
                    </optgroup>
                  </select>
                </label>
                  <label>
                  <span data-i18n="labelSteelPreset">Hazır çelik sınıfı</span>
                  <select id="steel-preset">
                    <option value="custom" data-i18n="optSteelPresetCustom">Özel</option>
                    <optgroup label="TS500 / TBDY" data-preset-family="ts500">
                      <option value="steel-ts500-s220" data-i18n="optSteelPresetTs500S220">S220</option>
                      <option value="steel-ts500-s275" data-i18n="optSteelPresetTs500S275">S275</option>
                      <option value="steel-ts500-s320" data-i18n="optSteelPresetTs500S320">S320</option>
                      <option value="steel-ts500-s420" data-i18n="optSteelPresetTs500S420">S420</option>
                      <option value="steel-ts500-s500" data-i18n="optSteelPresetTs500S500">S500</option>
                    </optgroup>
                    <optgroup label="Eurocode" data-preset-family="eu">
                      <option value="steel-eu-b400" data-i18n="optSteelPresetEuB400">B400</option>
                      <option value="steel-eu-b500a" data-i18n="optSteelPresetEuB500A">B500A</option>
                      <option value="steel-eu-b500b" data-i18n="optSteelPresetEuB500B">B500B</option>
                      <option value="steel-eu-b550b" data-i18n="optSteelPresetEuB550B">B550B</option>
                      <option value="steel-eu-b600b" data-i18n="optSteelPresetEuB600B">B600B</option>
                    </optgroup>
                    <optgroup label="ACI 318" data-preset-family="aci">
                      <option value="steel-aci-gr40" data-i18n="optSteelPresetAciGr40">ASTM A615 Gr.40</option>
                      <option value="steel-aci-gr60" data-i18n="optSteelPresetAciGr60">ASTM A615 Gr.60</option>
                      <option value="steel-aci-gr75" data-i18n="optSteelPresetAciGr75">ASTM A615 Gr.75</option>
                    </optgroup>
                  </select>
                </label>
                <label>
                  <span data-i18n="labelFck">fck (MPa)</span>
                  <input id="fck" type="number" value="30" min="10" step="1" />
                </label>
              <label>
                <span data-i18n="labelFyk">fyk (MPa)</span>
                <input id="fyk" type="number" value="420" min="220" step="1" />
              </label>
              <label>
                <span data-i18n="labelGammaC">gc</span>
                <input id="gamma-c" type="number" value="1.5" min="1" step="0.01" />
              </label>
              <label>
                <span data-i18n="labelGammaS">gs</span>
                <input id="gamma-s" type="number" value="1.15" min="1" step="0.01" />
              </label>
              <label>
                <span data-i18n="labelEs">Es (MPa)</span>
                <input id="es" type="number" value="200000" min="100000" step="1000" />
              </label>
              <label>
                <span data-i18n="labelEpsCu">ecu</span>
                <input id="eps-cu" type="number" value="0.003" min="0.001" step="0.0001" />
              </label>

              <label>
                <span data-i18n="labelMesh">Fiber mesh</span>
                <input id="mesh" type="number" value="55" min="10" step="1" />
              </label>
              <label>
                <span data-i18n="labelNAngle">Açı sayısı</span>
                <input id="n-angle" type="number" value="72" min="8" step="1" />
              </label>
              <label>
                <span data-i18n="labelNDepth">Nötr eksen sayısı</span>
                <input id="n-depth" type="number" value="55" min="10" step="1" />
              </label>

              <label>
                <span data-i18n="labelPhiP">phiP (eksenel)</span>
                <input id="phi-p" type="number" value="0.65" min="0.10" max="1.00" step="0.01" />
              </label>
              <label>
                <span data-i18n="labelPhiM">phiM (eğilme)</span>
                <input id="phi-m" type="number" value="0.90" min="0.10" max="1.00" step="0.01" />
              </label>
              <label>
                <span data-i18n="labelPCutoff">P cut-off katsayısı</span>
                <input id="p-cutoff-ratio" type="number" value="0.80" min="0.10" max="1.00" step="0.01" />
              </label>
              <label>
                <span data-i18n="labelPVisualScale">3B P ekseni görsel ölçeği</span>
                <input id="p-visual-scale" type="number" value="0.55" min="0.20" max="1.50" step="0.05" />
              </label>
              <label>
                <span data-i18n="labelSurfaceOpacity">3B yüzey saydamlığı</span>
                <input id="surface-opacity" type="range" value="0.88" min="0.15" max="1.00" step="0.01" />
                <small id="surface-opacity-value" class="range-hint">0.88</small>
              </label>
              <label>
                <span data-i18n="labelPSign">P işaret konvansiyonu</span>
                <select id="p-sign">
                  <option value="compression_positive" data-i18n="optPSignPositive">Basınç (+)</option>
                  <option value="compression_negative" data-i18n="optPSignNegative">Basınç (-) [SAP2000]</option>
                </select>
              </label>
            </div>

            <section id="expected-strength-panel" class="expected-strength-panel hidden">
              <label class="checkbox">
                <input id="use-expected-strength" type="checkbox" />
                <span data-i18n="labelExpectedStrength">TBDY beklenen dayanım artışı aktif (önerilen: fce=1.30*fck, fye=1.20*fyk)</span>
              </label>
              <div class="grid expected-strength-grid">
                <label id="field-expected-fck-factor" class="hidden">
                  <span data-i18n="labelExpectedFckFactor">Beklenen beton katsayısı fce/fck</span>
                  <input id="expected-fck-factor" type="number" value="1.30" min="1.00" max="2.00" step="0.01" />
                </label>
                <label id="field-expected-fyk-factor" class="hidden">
                  <span data-i18n="labelExpectedFykFactor">Beklenen çelik katsayısı fye/fyk</span>
                  <input id="expected-fyk-factor" type="number" value="1.20" min="1.00" max="2.00" step="0.01" />
                </label>
              </div>
            </section>
          </section>
        </div>

        <section class="section-preview-card">
          <div class="section-preview-head">
            <h3 data-i18n="headingSectionPreview">Kesit ve Donatı Yerleşimi</h3>
            <p id="section-preview-meta" class="section-preview-meta">-</p>
          </div>
          <canvas id="section-preview" width="520" height="260"></canvas>
        </section>

        <section class="input-group input-group--loads">
          <div class="input-group-head">
            <h3 data-i18n="headingGroupLoads">Yük Tanımı ve Dışa Aktarım</h3>
            <div class="loads-head-actions">
              <button type="button" id="load-add-row" class="action-btn-lite" data-i18n="btnLoadAddRow">Satır Ekle</button>
              <button type="button" id="load-delete-row" class="action-btn-lite" data-i18n="btnLoadDeleteRow">Seçiliyi Sil</button>
              <button type="button" id="load-clean-empty" class="action-btn-lite" data-i18n="btnLoadCleanRows">Boşları Temizle</button>
              <button type="button" id="load-copy" class="action-btn-lite" data-i18n="btnLoadCopy">TSV Kopyala</button>
            </div>
          </div>

          <div class="load-sheet-wrap">
            <table id="load-sheet-table" class="load-sheet-table" aria-label="Yük tablo girişi">
              <thead>
                <tr>
                  <th data-i18n="colLoadSelect">Seç</th>
                  <th data-i18n="colLoadNameEdit">Yük Adı</th>
                  <th data-i18n="colLoadPuEdit">Pu (kN)</th>
                  <th data-i18n="colLoadMuxEdit">Mux (kNm)</th>
                  <th data-i18n="colLoadMuyEdit">Muy (kNm)</th>
                </tr>
              </thead>
              <tbody id="load-sheet-body"></tbody>
            </table>
          </div>

          <div class="loads loads-secondary">
            <label>
              <span data-i18n="labelLoadsTextarea">Yedek metin girişi (satır başına: </span><code data-i18n="labelLoadsFmtA">ad,Pu,Mux,Muy</code><span data-i18n="labelLoadsOr"> veya </span><code data-i18n="labelLoadsFmtB">Pu,Mux,Muy</code><span data-i18n="labelLoadsEnd">)</span>
              <textarea id="loads-text" rows="7">L1,1200,120,80
L2,1800,200,140
L3,650,90,45</textarea>
            </label>
            <div class="loads-secondary-actions">
              <button type="button" id="loads-apply-text" class="action-btn-lite" data-i18n="btnLoadApplyText">Metni Grid'e Aktar</button>
            </div>
            <label>
              <span data-i18n="labelCsvLoad">CSV yük dosyası (opsiyonel; kolonlar: name,Pu,Mux,Muy)</span>
              <input id="loads-file" type="file" accept=".csv,text/csv" />
            </label>
          </div>

          <section class="report-meta-card">
            <div class="input-group-head input-group-head--compact">
              <h4 data-i18n="headingReportMeta">Rapor Bilgileri</h4>
            </div>
            <div class="grid report-meta-grid">
              <label>
                <span data-i18n="labelReportCompany">Kurum/Firma</span>
                <input id="report-company" type="text" placeholder="Firma Adı" />
              </label>
              <label>
                <span data-i18n="labelReportDocTitle">Rapor başlığı</span>
                <input id="report-doc-title" type="text" placeholder="Kolon PMM Teknik Raporu" />
              </label>
              <label>
                <span data-i18n="labelReportProject">Proje adı</span>
                <input id="report-project" type="text" placeholder="PMM Tasarım Kontrolü" />
              </label>
              <label>
                <span data-i18n="labelReportClient">Müşteri</span>
                <input id="report-client" type="text" placeholder="-" />
              </label>
              <label>
                <span data-i18n="labelReportPrepared">Hazırlayan</span>
                <input id="report-prepared-by" type="text" placeholder="-" />
              </label>
              <label>
                <span data-i18n="labelReportChecked">Kontrol eden</span>
                <input id="report-checked-by" type="text" placeholder="-" />
              </label>
              <label>
                <span data-i18n="labelReportRevision">Revizyon</span>
                <input id="report-revision" type="text" value="R00" />
              </label>
              <label>
                <span data-i18n="labelReportDate">Rapor tarihi</span>
                <input id="report-date" type="date" />
              </label>
              <label class="report-logo-field">
                <span data-i18n="labelReportLogo">Kurumsal logo</span>
                <input id="report-logo" type="file" accept="image/*" />
                <small id="report-logo-name" class="range-hint" data-i18n="labelReportLogoNoFile">Logo seçilmedi</small>
              </label>
            </div>
            <section class="report-sections-card">
              <h5 data-i18n="headingReportSections">Rapor Ayarları</h5>
              <div class="report-sections-grid">
                <label class="checkbox-inline"><input id="report-sec-cover" type="checkbox" checked /><span data-i18n="labelReportSecCover">Kapak ve Kimlik</span></label>
                <label class="checkbox-inline"><input id="report-sec-summary" type="checkbox" checked /><span data-i18n="labelReportSecSummary">Analiz Özeti</span></label>
                <label class="checkbox-inline"><input id="report-sec-visuals" type="checkbox" checked /><span data-i18n="labelReportSecVisuals">Kesit ve PMM Görselleri</span></label>
                <label class="checkbox-inline"><input id="report-sec-load-input" type="checkbox" checked /><span data-i18n="labelReportSecLoadInput">Yük Girdileri</span></label>
                <label class="checkbox-inline"><input id="report-sec-load-results" type="checkbox" checked /><span data-i18n="labelReportSecLoadResults">Yük Sonuçları</span></label>
                <label class="checkbox-inline"><input id="report-sec-compliance" type="checkbox" checked /><span data-i18n="labelReportSecCompliance">Kod Uyumluluk Kontrolü</span></label>
                <label class="checkbox-inline"><input id="report-sec-mphi" type="checkbox" checked /><span data-i18n="labelReportSecMphi">Moment-Eğrilik</span></label>
                <label class="checkbox-inline"><input id="report-sec-appendix" type="checkbox" checked /><span data-i18n="labelReportSecAppendix">Ekler (Mx/My Zarf)</span></label>
              </div>
            </section>
          </section>

          <div class="actions">
            <input id="project-file" class="hidden" type="file" accept=".pmm,.json,application/json" />
            <button id="project-open" type="button" data-i18n="btnProjectOpen">PMM Aç</button>
            <button id="project-save" type="button" data-i18n="btnProjectSave">PMM Kaydet</button>
            <button id="export-results" disabled data-i18n="btnExportResults">Sonuç CSV</button>
            <button id="export-surface" disabled data-i18n="btnExportSurface">PMM Nokta CSV</button>
            <button id="export-report" disabled data-i18n="btnExportReport">Rapor Word</button>
            <button id="export-report-pdf" disabled data-i18n="btnExportReportPdf">Rapor PDF</button>
          </div>
          <p id="rho-display" class="status rho-line"></p>
        </section>
        </div>
      </details>

      <div class="right-col-wrap" style="display: flex; flex-direction: column; gap: 16px;">
        <section class="panel viz">
          <div class="viz-head">
          <h2 data-i18n="headingCloud">PMM Nokta Bulutu</h2>
          <div class="viz-head-controls">
            <label class="checkbox-inline checkbox-inline--viz">
              <input id="show-nominal-surface" type="checkbox" />
              <span data-i18n="labelShowNominalSurface">Nominal zarfı göster</span>
            </label>
            <label class="compact-field">
              <span data-i18n="labelProjection">Görünüm</span>
              <select id="projection">
                <option value="p-mx" data-i18n="optProjPMx">P - Mx</option>
                <option value="p-my" data-i18n="optProjPMy">P - My</option>
                <option value="mx-my" data-i18n="optProjMxMy">Mx - My</option>
              </select>
            </label>
          </div>
        </div>
        <canvas id="plot" width="1100" height="500"></canvas>
        <div class="viz3d-split">
          <section class="slice-panel">
            <div class="slice-head">
              <h3 data-i18n="heading3dTable">3B Kesit Tablosu</h3>
              <div class="slice-head-actions">
                <label class="compact-field">
                  <span data-i18n="labelSliceAngle">Tablo açısı (°)</span>
                  <input id="slice-angle" type="number" value="0" min="0" max="359" step="5" />
                </label>
                <label class="slice-zero-toggle">
                  <input id="slice-hide-zero" type="checkbox" checked />
                  <span data-i18n="labelSliceHideZero">Sıfıra yakın satırları gizle</span>
                </label>
                <button id="slice-copy" type="button" class="slice-copy-btn" data-i18n="btnSliceCopy">Tabloyu Kopyala</button>
              </div>
            </div>
            <p id="slice-meta" class="slice-meta">-</p>
            <div class="slice-table-wrap">
              <table id="slice-table">
                <thead>
                  <tr>
                    <th data-i18n="colSliceNo">No</th>
                    <th data-i18n="colSliceP">P (kN)</th>
                    <th data-i18n="colSliceMx">Mx (kNm)</th>
                    <th data-i18n="colSliceMy">My (kNm)</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </section>
          <div id="plot-3d" class="plot3d"></div>
        </div>
        </section>

        <details class="panel accordion" id="mc-accordion" open>
          <summary class="accordion-head">
            <h2 data-i18n="headingMc">Moment – Eğrilik Analizi</h2>
            <span class="accordion-hint" data-i18n="accordionHint">Aç / Kapat</span>
          </summary>
          <div class="accordion-body">
            <button id="mc-close-btn" class="mc-close-btn" type="button" aria-label="Kapat">✕</button>
            <p class="mc-intro" data-i18n="mcIntro">
              Verilen eksenel yük altında tek eksenli eğilme için M–φ eğrisi hesaplar.
              Önce PMM analizi çalıştırılmış olmalıdır.
            </p>
            <div class="mc-controls">
              <label>
                <span data-i18n="labelMcP">Eksenel yük P (kN)</span>
                <input id="mc-p" type="number" value="1200" step="50" />
              </label>
              <label>
                <span data-i18n="labelMcAngle">Eğilme açısı (°)</span>
                <input id="mc-angle" type="number" value="0" min="0" max="359" step="5" />
              </label>
              <label>
                <span data-i18n="labelMcSteps">Adım sayısı</span>
                <input id="mc-steps" type="number" value="80" min="20" max="400" step="10" />
              </label>
              <button id="mc-run-btn" class="run-btn" data-i18n="btnMcRun">M–φ Hesapla</button>
            </div>
            <p class="mc-angle-hint" data-i18n="mcAngleHint">
              0° = Mx eğilmesi (yatay nötr eksen) · 90° = My eğilmesi (düşey nötr eksen)
            </p>
            <div class="mc-plot-row">
              <div id="plot-mc" class="plot-mc"></div>
              <div id="plot-mc-strain" class="plot-mc-strain"></div>
              <div id="mc-data-table" class="mc-data-table"></div>
            </div>
            <div id="mc-stats" class="mc-stats hidden"></div>
            <div id="mc-hover-info" class="mc-hover-info hidden">
              <span class="mc-hi-label">Concrete Strain:</span><span id="mc-hi-epsc" class="mc-hi-val">—</span>
              <span class="mc-hi-label">Steel Strain:</span><span id="mc-hi-epss" class="mc-hi-val">—</span>
              <span class="mc-hi-label">Neutral Axis:</span><span id="mc-hi-na" class="mc-hi-val">—</span>
            </div>
            <div class="mc-actions">
              <button type="button" id="mc-export-btn" class="action-btn" data-i18n="btnMcExport">Excel (CSV)</button>
              <button type="button" id="mc-copy-btn" class="action-btn" data-i18n="btnMcCopy">Veriyi Kopyala</button>
              <button type="button" id="mc-fullscreen-btn" class="action-btn" data-i18n="btnMcFullscreen">Büyüt</button>
            </div>
          </div>
        </details>
      </div>

      <details class="panel panel-full accordion guide-accordion" id="guide-accordion">
        <summary class="accordion-head">
          <h2 data-i18n="headingGuide">PMM Kılavuzu ve Terimler</h2>
          <span class="accordion-hint" data-i18n="accordionHint">Aç / Kapat</span>
        </summary>
        <div class="accordion-body guide-body">
          <p class="guide-intro" data-i18n="guideIntro">
            Bu araç TS500/TBDY varsayımlarıyla coupled 3B PMM kapasite yüzeyi üretir ve girilen yüklerin DCR kontrolünü yapar.
          </p>
          <div class="guide-grid">
            <section class="guide-card">
              <h3 data-i18n="guideGlossaryTitle">Yük Sonuçları Terimleri</h3>
              <ul class="guide-list">
                <li data-i18n="guidePu">Pu: Girilen tasarım eksenel kuvveti (kN).</li>
                <li data-i18n="guideMux">Mux: Girilen x ekseni etrafındaki moment (kNm).</li>
                <li data-i18n="guideMuy">Muy: Girilen y ekseni etrafındaki moment (kNm).</li>
                <li data-i18n="guidePcap">Pcap: Aynı yük yönünde kapasite yüzeyindeki eksenel kuvvet bileşeni (kN).</li>
                <li data-i18n="guideMxcap">Mxcap: Aynı yük yönünde kapasite yüzeyindeki Mx bileşeni (kNm).</li>
                <li data-i18n="guideMycap">Mycap: Aynı yük yönünde kapasite yüzeyindeki My bileşeni (kNm).</li>
                <li data-i18n="guideScale">Scale: Talep vektörünü kapasite yüzeyine taşımak için kullanılan ölçek katsayısı.</li>
                <li data-i18n="guideDcr">DCR: Talep/Kapasite oranı = 1/Scale. DCR ≤ 1 ise kesit uygundur.</li>
                <li data-i18n="guideStatus">Durum: UYGUN (DCR ≤ 1), UYGUN DEĞİL (DCR > 1).</li>
              </ul>
            </section>
            <section class="guide-card">
              <h3 data-i18n="guideMethodTitle">Hesap Özeti</h3>
              <ul class="guide-list">
                <li data-i18n="guideMethod1">PMM noktaları tüm açı ve nötr eksen derinlikleri için fiber entegrasyonu ile hesaplanır.</li>
                <li data-i18n="guideMethod2">Değerlendirme tek tek 2B değil, coupled 3B (P-Mx-My) etkileşim yüzeyi üzerinden yapılır.</li>
                <li data-i18n="guideMethod3">phiP ve phiM tasarım katsayıları sırasıyla eksenel ve moment kapasitesine uygulanır.</li>
                <li data-i18n="guideMethod4">P cut-off katsayısı üst basınç kapasitesi tavanını sınırlar.</li>
                <li data-i18n="guideMethod5">P işaret konvansiyonu sonuçların işaretini etkiler, fiziksel kapasiteyi değiştirmez.</li>
              </ul>
            </section>
          </div>
        </div>
      </details>

      <details class="panel panel-full accordion" id="results-accordion" open>
        <summary class="accordion-head">
          <h2 data-i18n="headingResults">Yük Sonuçları</h2>
          <span class="accordion-hint" data-i18n="accordionHint">Aç / Kapat</span>
        </summary>
        <div class="accordion-body">
          <div class="table-wrap">
            <table id="results-table">
              <thead>
                <tr>
                  <th data-i18n="colLoad">Yük</th><th data-i18n="colPu">Pu</th><th data-i18n="colMux">Mux</th><th data-i18n="colMuy">Muy</th>
                  <th data-i18n="colPcap">Pcap</th><th data-i18n="colMxcap">Mxcap</th><th data-i18n="colMycap">Mycap</th><th data-i18n="colScale">Scale</th><th data-i18n="colDcr">DCR</th><th data-i18n="colStatus">Durum</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </details>

      <details class="panel panel-full accordion" id="compliance-accordion" open>
        <summary class="accordion-head">
          <h2 data-i18n="headingCompliance">Kod Uyumluluk Kontrolü</h2>
          <span class="accordion-hint" data-i18n="accordionHint">Aç / Kapat</span>
        </summary>
        <div class="accordion-body">
          <p id="compliance-summary" class="compliance-summary" data-i18n="complianceSummaryInit">Hesap sonrası doldurulur.</p>
          <div class="table-wrap">
            <table id="compliance-table">
              <thead>
                <tr>
                  <th data-i18n="colCode">Kod</th><th data-i18n="colClause">Madde</th><th data-i18n="colCheck">Kontrol</th><th data-i18n="colValue">Değer</th><th data-i18n="colLimit">Sınır/Kural</th><th data-i18n="colResult">Sonuç</th><th data-i18n="colNote">Not</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </details>

    </main>
  </div>
`;

const refs = {
  workspace: must<HTMLElement>("workspace-main"),
  controlsAccordion: must<HTMLDetailsElement>("controls-accordion"),
  sectionStrip: must<HTMLDivElement>("section-strip"),
  sectionFormBody: must<HTMLDivElement>("section-form-body"),
  sectionAddBtn: must<HTMLButtonElement>("section-add-btn"),
  langToggle: must<HTMLButtonElement>("lang-toggle"),
  themeToggle: must<HTMLButtonElement>("theme-toggle"),
  codeMode: must<HTMLSelectElement>("code-mode"),
  concreteModel: must<HTMLSelectElement>("concrete-model"),
  materialPreset: must<HTMLSelectElement>("material-preset"),
  steelPreset: must<HTMLSelectElement>("steel-preset"),
  shape: must<HTMLSelectElement>("shape"),
  width: must<HTMLInputElement>("width"),
  height: must<HTMLInputElement>("height"),
  diameter: must<HTMLInputElement>("diameter"),
  barsX: must<HTMLInputElement>("bars-x"),
  barsY: must<HTMLInputElement>("bars-y"),
  bars: must<HTMLInputElement>("bars"),
  doubleLayer: must<HTMLInputElement>("double-layer"),
  barsX2: must<HTMLInputElement>("bars-x2"),
  barsY2: must<HTMLInputElement>("bars-y2"),
  bars2: must<HTMLInputElement>("bars-2"),
  layerSpacing: must<HTMLInputElement>("layer-spacing"),
  cover: must<HTMLInputElement>("cover"),
  tieDia: must<HTMLInputElement>("tie-dia"),
  barDia: must<HTMLInputElement>("bar-dia"),
  tieSpacingConf: must<HTMLInputElement>("tie-spacing-conf"),
  tieSpacingMid: must<HTMLInputElement>("tie-spacing-mid"),
  coverToCenter: must<HTMLInputElement>("cover-to-center"),
  expectedStrengthPanel: must<HTMLElement>("expected-strength-panel"),
  useExpectedStrength: must<HTMLInputElement>("use-expected-strength"),
  expectedFckFactor: must<HTMLInputElement>("expected-fck-factor"),
  expectedFykFactor: must<HTMLInputElement>("expected-fyk-factor"),
  fck: must<HTMLInputElement>("fck"),
  fyk: must<HTMLInputElement>("fyk"),
  gammaC: must<HTMLInputElement>("gamma-c"),
  gammaS: must<HTMLInputElement>("gamma-s"),
  es: must<HTMLInputElement>("es"),
  epsCu: must<HTMLInputElement>("eps-cu"),
  mesh: must<HTMLInputElement>("mesh"),
  nAngle: must<HTMLInputElement>("n-angle"),
  nDepth: must<HTMLInputElement>("n-depth"),
  phiP: must<HTMLInputElement>("phi-p"),
  phiM: must<HTMLInputElement>("phi-m"),
  pCutoffRatio: must<HTMLInputElement>("p-cutoff-ratio"),
  pVisualScale: must<HTMLInputElement>("p-visual-scale"),
  surfaceOpacity: must<HTMLInputElement>("surface-opacity"),
  surfaceOpacityValue: must<HTMLElement>("surface-opacity-value"),
  pSign: must<HTMLSelectElement>("p-sign"),
  loadSheetBody: must<HTMLTableSectionElement>("load-sheet-body"),
  loadAddRowBtn: must<HTMLButtonElement>("load-add-row"),
  loadDeleteRowBtn: must<HTMLButtonElement>("load-delete-row"),
  loadCleanEmptyBtn: must<HTMLButtonElement>("load-clean-empty"),
  loadCopyBtn: must<HTMLButtonElement>("load-copy"),
  loadsApplyTextBtn: must<HTMLButtonElement>("loads-apply-text"),
  loadsText: must<HTMLTextAreaElement>("loads-text"),
  loadsFile: must<HTMLInputElement>("loads-file"),
  projectFile: must<HTMLInputElement>("project-file"),
  projectOpen: must<HTMLButtonElement>("project-open"),
  projectSave: must<HTMLButtonElement>("project-save"),
  runBtn: must<HTMLButtonElement>("run-btn"),
  exportResults: must<HTMLButtonElement>("export-results"),
  exportSurface: must<HTMLButtonElement>("export-surface"),
  exportReport: must<HTMLButtonElement>("export-report"),
  exportReportPdf: must<HTMLButtonElement>("export-report-pdf"),
  reportCompany: must<HTMLInputElement>("report-company"),
  reportDocTitle: must<HTMLInputElement>("report-doc-title"),
  reportProject: must<HTMLInputElement>("report-project"),
  reportClient: must<HTMLInputElement>("report-client"),
  reportPreparedBy: must<HTMLInputElement>("report-prepared-by"),
  reportCheckedBy: must<HTMLInputElement>("report-checked-by"),
  reportRevision: must<HTMLInputElement>("report-revision"),
  reportDate: must<HTMLInputElement>("report-date"),
  reportLogo: must<HTMLInputElement>("report-logo"),
  reportLogoName: must<HTMLElement>("report-logo-name"),
  reportSecCover: must<HTMLInputElement>("report-sec-cover"),
  reportSecSummary: must<HTMLInputElement>("report-sec-summary"),
  reportSecVisuals: must<HTMLInputElement>("report-sec-visuals"),
  reportSecLoadInput: must<HTMLInputElement>("report-sec-load-input"),
  reportSecLoadResults: must<HTMLInputElement>("report-sec-load-results"),
  reportSecCompliance: must<HTMLInputElement>("report-sec-compliance"),
  reportSecMphi: must<HTMLInputElement>("report-sec-mphi"),
  reportSecAppendix: must<HTMLInputElement>("report-sec-appendix"),
  status: must<HTMLParagraphElement>("status"),
  statusLog: must<HTMLOListElement>("status-log"),
  rhoDisplay: must<HTMLParagraphElement>("rho-display"),
  sectionPreview: must<HTMLCanvasElement>("section-preview"),
  sectionPreviewMeta: must<HTMLParagraphElement>("section-preview-meta"),
  projection: must<HTMLSelectElement>("projection"),
  showNominalSurface: must<HTMLInputElement>("show-nominal-surface"),
  sliceAngle: must<HTMLInputElement>("slice-angle"),
  sliceHideZero: must<HTMLInputElement>("slice-hide-zero"),
  sliceCopy: must<HTMLButtonElement>("slice-copy"),
  sliceMeta: must<HTMLParagraphElement>("slice-meta"),
  plot: must<HTMLCanvasElement>("plot"),
  plot3d: must<HTMLDivElement>("plot-3d"),
  sliceBody: must<HTMLTableSectionElement>("slice-table").querySelector("tbody")!,
  tableBody: must<HTMLTableSectionElement>("results-table").querySelector("tbody")!,
  complianceBody: must<HTMLTableSectionElement>("compliance-table").querySelector("tbody")!,
  complianceSummary: must<HTMLParagraphElement>("compliance-summary"),
  fieldWidth: must<HTMLElement>("field-width"),
  fieldHeight: must<HTMLElement>("field-height"),
  fieldDiameter: must<HTMLElement>("field-diameter"),
  fieldDoubleLayer: must<HTMLElement>("field-double-layer"),
  fieldBarsX: must<HTMLElement>("field-bars-x"),
  fieldBarsY: must<HTMLElement>("field-bars-y"),
  fieldBars: must<HTMLElement>("field-bars"),
  fieldBarsX2: must<HTMLElement>("field-bars-x2"),
  fieldBarsY2: must<HTMLElement>("field-bars-y2"),
  fieldBars2: must<HTMLElement>("field-bars-2"),
  fieldLayerSpacing: must<HTMLElement>("field-layer-spacing"),
  fieldExpectedFckFactor: must<HTMLElement>("field-expected-fck-factor"),
  fieldExpectedFykFactor: must<HTMLElement>("field-expected-fyk-factor"),
  mcP: must<HTMLInputElement>("mc-p"),
  mcAngle: must<HTMLInputElement>("mc-angle"),
  mcSteps: must<HTMLInputElement>("mc-steps"),
  mcRunBtn: must<HTMLButtonElement>("mc-run-btn"),
  plotMc: must<HTMLDivElement>("plot-mc"),
  mcStats: must<HTMLDivElement>("mc-stats"),
  mcFullscreenBtn: must<HTMLButtonElement>("mc-fullscreen-btn"),
  mcCloseBtn: must<HTMLButtonElement>("mc-close-btn"),
  mcDataTable: must<HTMLDivElement>("mc-data-table"),
  mcCopyBtn: must<HTMLButtonElement>("mc-copy-btn"),
  mcExportBtn: must<HTMLButtonElement>("mc-export-btn"),
  plotMcStrain: must<HTMLDivElement>("plot-mc-strain"),
  mcHoverInfo: must<HTMLDivElement>("mc-hover-info"),
  mcHiEpsC: must<HTMLSpanElement>("mc-hi-epsc"),
  mcHiEpsS: must<HTMLSpanElement>("mc-hi-epss"),
  mcHiNA: must<HTMLSpanElement>("mc-hi-na"),
};

interface McData {
  phi: number[];
  moment: number[];
  neutralAxis: number[];
  epsC: number[];
  epsS: number[];
}

const state: {
  wasm: WasmExports | null;
  results: ResultRow[];
  surface: PmmPoint[];
  nominalSurface: PmmPoint[];
  compliance: ComplianceCheck[];
  angleCount: number;
  depthCount: number;
  sliceAngleDeg: number;
  sliceActualAngleDeg: number;
  sliceShownRows: PmmPoint[];
  lang: Lang;
  theme: ThemeMode;
  lastInput: AppInput | null;
  statusLogEntries: Array<{ text: string; level: StatusLevel }>;
  mcData: McData | null;
  loadSheet: LoadSheetRow[];
  loadIssues: LoadSheetValidationIssue[];
  selectedLoadRows: Set<number>;
  activeLoadCell: { row: number; col: LoadSheetCol } | null;
  loadSelectionAnchor: { row: number; col: LoadSheetCol } | null;
  selectedLoadRange: LoadCellRange | null;
  loadMouseSelecting: boolean;
  reportLogoDataUrl: string;
  showNominalSurface: boolean;
  sections: SectionDef[];
  activeSectionIdx: number;
  sectionIdCounter: number;
  sectionFormExpanded: boolean;
} = {
  wasm: null,
  results: [],
  surface: [],
  nominalSurface: [],
  compliance: [],
  angleCount: 0,
  depthCount: 0,
  sliceAngleDeg: 0,
  sliceActualAngleDeg: 0,
  sliceShownRows: [],
  lang: "tr",
  theme: "dark",
  lastInput: null,
  statusLogEntries: [],
  mcData: null,
  loadSheet: [],
  loadIssues: [],
  selectedLoadRows: new Set<number>(),
  activeLoadCell: null,
  loadSelectionAnchor: null,
  selectedLoadRange: null,
  loadMouseSelecting: false,
  reportLogoDataUrl: "",
  showNominalSurface: false,
  sections: [],
  activeSectionIdx: 0,
  sectionIdCounter: 0,
  sectionFormExpanded: true,
};

const I18N = {
  tr: {
    kicker: "TS500 + WebAssembly",
    title: "Concrete Column PMM Studio",
    subtitle: "Dairesel ve dörtgen kesit için tarayıcıda çalışan PMM/DCR kontrol aracı",
    labelLanguage: "Dil / Language",
    optLangTr: "Türkçe",
    optLangEn: "English",
    labelTheme: "Tema",
    optThemeDark: "Karanlık",
    optThemeLight: "Aydınlık",
    headingRunLog: "Çalışma Günlüğü",
    statusLogEmpty: "Henüz kayıt yok.",
    labelCodeMode: "Kod Modu",
    optCodeTs500Tbdy: "TS500 + TBDY 2018 (Kolon)",
    optCodeTs500: "TS500",
    optCodeAci318_19: "ACI 318-19 (Kolon)",
    labelConcreteModel: "Beton modeli",
    optConcreteTs500Block: "TS500 eşdeğer blok",
    optConcreteMander: "Mander (çekirdek sargılı + örtü sargısız)",
    labelShape: "Kesit Tipi",
    optShapeRect: "Dörtgen",
    optShapeCircle: "Dairesel",
    labelWidth: "Genişlik b (m)",
    labelHeight: "Yükseklik h (m)",
    labelDiameter: "Çap D (m)",
    labelBarsX: "Üst/alt bar adedi",
    labelBarsY: "Sol/sağ bar adedi",
    labelBars: "Dairesel toplam bar",
    labelDoubleLayer: "Çift sıra donatı kullan",
    labelBarsX2: "2. sıra üst/alt bar adedi",
    labelBarsY2: "2. sıra sol/sağ bar adedi",
    labelBars2: "2. halka bar adedi",
    labelLayerSpacing: "Sıra eksenleri arası a_row (mm)",
    labelCover: "Cover (m)",
    labelTieDia: "Etriye çapı (mm)",
    labelBarDia: "Boyuna donatı çapı (mm)",
    labelTieSpacingConf: "Sarılma bölgesi etriye aralığı s_conf (mm)",
    labelTieSpacingMid: "Orta bölge etriye aralığı s_mid (mm)",
    labelFck: "fck (MPa)",
    labelFyk: "fyk (MPa)",
    labelMaterialPreset: "Hazır beton sınıfı",
    labelSteelPreset: "Hazır çelik sınıfı",
    optMaterialPresetCustom: "Özel",
    optMaterialPresetTs500C25_30: "C25/30",
    optMaterialPresetTs500C30_35: "C30/35",
    optMaterialPresetTs500C35_40: "C35/40",
    optMaterialPresetTs500C40_50: "C40/50",
    optMaterialPresetTs500C45_55: "C45/55",
    optMaterialPresetEuC25_30: "C25/30",
    optMaterialPresetEuC30_37: "C30/37",
    optMaterialPresetEuC35_45: "C35/45",
    optMaterialPresetEuC40_50: "C40/50",
    optMaterialPresetEuC45_55: "C45/55",
    optMaterialPresetEuC50_60: "C50/60",
    optMaterialPresetAciF30: "f'c=30 MPa",
    optMaterialPresetAciF35: "f'c=35 MPa",
    optMaterialPresetAciF40: "f'c=40 MPa",
    optMaterialPresetAciF45: "f'c=45 MPa",
    optSteelPresetCustom: "Özel",
    optSteelPresetTs500S220: "S220",
    optSteelPresetTs500S275: "S275",
    optSteelPresetTs500S320: "S320",
    optSteelPresetTs500S420: "S420",
    optSteelPresetTs500S500: "S500",
    optSteelPresetEuB400: "B400",
    optSteelPresetEuB500A: "B500A",
    optSteelPresetEuB500B: "B500B",
    optSteelPresetEuB550B: "B550B",
    optSteelPresetEuB600B: "B600B",
    optSteelPresetAciGr40: "ASTM A615 Gr.40",
    optSteelPresetAciGr60: "ASTM A615 Gr.60",
    optSteelPresetAciGr75: "ASTM A615 Gr.75",
    labelGammaC: "gc",
    labelGammaS: "gs",
    labelEs: "Es (MPa)",
    labelEpsCu: "ecu",
    labelMesh: "Fiber mesh",
    labelNAngle: "Açı sayısı",
    labelNDepth: "Nötr eksen sayısı",
    labelPhiP: "phiP (eksenel)",
    labelPhiM: "phiM (eğilme)",
    labelPCutoff: "P cut-off katsayısı",
    labelPVisualScale: "3B P ekseni görsel ölçeği",
    labelSurfaceOpacity: "3B yüzey saydamlığı",
    labelShowNominalSurface: "Nominal zarfı göster (phi uygulanmadan)",
    labelPSign: "P işaret konvansiyonu",
    optPSignPositive: "Basınç (+)",
    optPSignNegative: "Basınç (-) [SAP2000]",
    labelCoverToCenter: "Cover değeri donatı merkezine kadar verildi",
    labelExpectedStrength: "TBDY beklenen dayanım artışı aktif (önerilen: fce=1.30*fck, fye=1.20*fyk)",
    labelExpectedFckFactor: "Beklenen beton katsayısı fce/fck",
    labelExpectedFykFactor: "Beklenen çelik katsayısı fye/fyk",
    headingSectionPreview: "Kesit ve Donatı Yerleşimi",
    labelLoads: "Yükler (satır başına: ",
    labelLoadsTextarea: "Yedek metin girişi (satır başına: ",
    labelLoadsFmtA: "ad,Pu,Mux,Muy",
    labelLoadsOr: " veya ",
    labelLoadsFmtB: "Pu,Mux,Muy",
    labelLoadsEnd: ")",
    labelCsvLoad: "CSV yük dosyası (opsiyonel; kolonlar: name,Pu,Mux,Muy)",
    colLoadSelect: "Seç",
    colLoadNameEdit: "Yük Adı",
    colLoadPuEdit: "Pu (kN)",
    colLoadMuxEdit: "Mux (kNm)",
    colLoadMuyEdit: "Muy (kNm)",
    btnLoadAddRow: "Satır Ekle",
    btnLoadDeleteRow: "Seçiliyi Sil",
    btnLoadCleanRows: "Boşları Temizle",
    btnLoadCopy: "TSV Kopyala",
    btnLoadApplyText: "Metni Grid'e Aktar",
    headingReportMeta: "Rapor Bilgileri",
    headingReportSections: "Rapor Ayarları",
    labelReportCompany: "Kurum/Firma",
    labelReportDocTitle: "Rapor başlığı",
    labelReportProject: "Proje adı",
    labelReportClient: "Müşteri",
    labelReportPrepared: "Hazırlayan",
    labelReportChecked: "Kontrol eden",
    labelReportRevision: "Revizyon",
    labelReportDate: "Rapor tarihi",
    labelReportLogo: "Kurumsal logo",
    labelReportLogoNoFile: "Logo seçilmedi",
    labelReportSecCover: "Kapak ve Kimlik",
    labelReportSecSummary: "Analiz Özeti",
    labelReportSecVisuals: "Kesit ve PMM Görselleri",
    labelReportSecLoadInput: "Yük Girdileri",
    labelReportSecLoadResults: "Yük Sonuçları",
    labelReportSecCompliance: "Kod Uyumluluk Kontrolü",
    labelReportSecMphi: "Moment-Eğrilik",
    labelReportSecAppendix: "Ekler (Mx/My Zarf)",
    btnSectionAdd: "+ Kesit Ekle",
    btnProjectOpen: "PMM Aç",
    btnProjectSave: "PMM Kaydet",
    btnRun: "PMM Hesapla",
    btnExportResults: "Sonuç CSV",
    btnExportSurface: "PMM Nokta CSV",
    btnExportReport: "Rapor Word",
    btnExportReportPdf: "Rapor PDF",
    statusWasmLoading: "WASM modülü yükleniyor...",
    statusWasmReady: "Hazır. Parametreleri girip hesap başlatabilirsiniz.",
    statusAciPresetApplied: "ACI 318-19 preset uygulandi: gc=1.00, gs=1.00, phiP=0.65, phiM=0.90",
    statusPmmCalculating: "PMM yüzeyi hesaplanıyor...",
    statusEvaluatingPrefix: "Yükler değerlendiriliyor",
    headingInputs: "Girdi ve Kesit Tanımı",
    headingGuide: "PMM Kılavuzu ve Terimler",
    guideIntro: "Bu araç TS500/TBDY/ACI varsayımlarıyla coupled 3B PMM kapasite yüzeyi üretir ve girilen yüklerin DCR kontrolünü yapar.",
    guideGlossaryTitle: "Yük Sonuçları Terimleri",
    guidePu: "Pu: Girilen tasarım eksenel kuvveti (kN).",
    guideMux: "Mux: Girilen x ekseni etrafındaki moment (kNm).",
    guideMuy: "Muy: Girilen y ekseni etrafındaki moment (kNm).",
    guidePcap: "Pcap: Aynı yük yönünde kapasite yüzeyindeki eksenel kuvvet bileşeni (kN).",
    guideMxcap: "Mxcap: Aynı yük yönünde kapasite yüzeyindeki Mx bileşeni (kNm).",
    guideMycap: "Mycap: Aynı yük yönünde kapasite yüzeyindeki My bileşeni (kNm).",
    guideScale: "Scale: Talep vektörünü kapasite yüzeyine taşımak için kullanılan ölçek katsayısı.",
    guideDcr: "DCR: Talep/Kapasite oranı = 1/Scale. DCR ≤ 1 ise kesit uygundur.",
    guideStatus: "Durum: UYGUN (DCR ≤ 1), UYGUN DEĞİL (DCR > 1).",
    guideMethodTitle: "Hesap Özeti",
    guideMethod1: "PMM noktaları tüm açı ve nötr eksen derinlikleri için fiber entegrasyonu ile hesaplanır.",
    guideMethod2: "Değerlendirme tek tek 2B değil, coupled 3B (P-Mx-My) etkileşim yüzeyi üzerinden yapılır.",
    guideMethod3: "phiP ve phiM tasarım katsayıları sırasıyla eksenel ve moment kapasitesine uygulanır.",
    guideMethod4: "P cut-off katsayısı üst basınç kapasitesi tavanını sınırlar.",
    guideMethod5: "P işaret konvansiyonu sonuçların işaretini etkiler, fiziksel kapasiteyi değiştirmez.",
    headingGroupDesign: "Tasarım Seçimleri",
    headingGroupSection: "Kesit ve Donatı",
    headingGroupAnalysis: "Malzeme ve Analiz",
    headingGroupLoads: "Yük Tanımı ve Dışa Aktarım",
    headingCloud: "PMM Nokta Bulutu",
    labelProjection: "Görünüm",
    optProjPMx: "P - Mx",
    optProjPMy: "P - My",
    optProjMxMy: "Mx - My",
    heading3dTable: "3B Kesit Tablosu",
    labelSliceAngle: "Tablo açısı (°)",
    labelSliceHideZero: "Sıfıra yakın satırları gizle",
    btnSliceCopy: "Tabloyu Kopyala",
    colSliceNo: "No",
    colSliceP: "P (kN)",
    colSliceMx: "Mx (kNm)",
    colSliceMy: "My (kNm)",
    headingResults: "Yük Sonuçları",
    accordionHint: "Aç / Kapat",
    colLoad: "Yük",
    colPu: "Pu",
    colMux: "Mux",
    colMuy: "Muy",
    colPcap: "Pcap",
    colMxcap: "Mxcap",
    colMycap: "Mycap",
    colScale: "Scale",
    colDcr: "DCR",
    colStatus: "Durum",
    headingCompliance: "Kod Uyumluluk Kontrolü",
    complianceSummaryInit: "Hesap sonrası doldurulur.",
    colCode: "Kod",
    colClause: "Madde",
    colCheck: "Kontrol",
    colValue: "Değer",
    colLimit: "Sınır/Kural",
    colResult: "Sonuç",
    colNote: "Not",
    resultOk: "UYGUN",
    resultFail: "YETERSIZ",
    compliancePass: "UYGUN",
    complianceFail: "UYGUN DEGIL",
    complianceInfo: "VERI GEREKLI",
    plot3dError: "3D plot hatasi",
    statusSliceCopyEmpty: "Kopyalanacak 3B kesit satırı yok.",
    statusSliceCopied: "3B kesit tablosu panoya kopyalandı.",
    statusSurfaceExported: "PMM CSV Mx/My eksenleri + mirror kolonları ile dışa aktarıldı.",
    statusSurfaceExportEmpty: "Dışa aktarım için PMM yüzeyi bulunamadı.",
    statusReportExported: "Word raporu oluşturuldu.",
    statusReportExportEmpty: "Rapor için önce PMM analizi çalıştırın.",
    statusReportPdfExported: "PDF yazdırma önizlemesi açıldı.",
    statusReportMetaMissing: "Rapor için en az Proje adı ve Rapor tarihi alanlarını doldurun.",
    statusReportLogoLoaded: "Kurumsal logo rapora eklenecek şekilde yüklendi.",
    statusReportSectionNone: "Rapor için en az bir bölüm seçin.",
    statusProjectSaved: "PMM proje dosyası dışa aktarıldı.",
    statusProjectOpened: "PMM proje dosyası yüklendi. Sonuçlar temizlendi; yeniden PMM Hesapla ile güncelleyin.",
    statusProjectInvalid: "Geçersiz PMM proje dosyası.",
    statusLoadSheetCopied: "Yük tablosu TSV olarak panoya kopyalandı.",
    statusLoadSheetCopyEmpty: "Kopyalanacak yük satırı bulunamadı.",
    statusLoadSheetImported: "CSV yükleri tabloya eklendi.",
    statusLoadSheetTextApplied: "Metin girdisi yük tablosuna aktarıldı.",
    statusLoadSheetInvalid: "Yük tablosunda hatalı hücreler var. Lütfen işaretli alanları düzeltin.",
    headingMc: "Moment – Eğrilik Analizi",
    mcIntro: "Verilen eksenel yük altında tek eksenli eğilme için M–φ eğrisi hesaplar. Önce PMM analizi çalıştırılmış olmalıdır.",
    labelMcP: "Eksenel yük P (kN)",
    labelMcAngle: "Eğilme açısı (°)",
    labelMcSteps: "Adım sayısı",
    btnMcRun: "M–φ Hesapla",
    mcAngleHint: "0° = Mx eğilmesi (yatay nötr eksen) · 90° = My eğilmesi (düşey nötr eksen)",
    statusMcRunning: "M–φ eğrisi hesaplanıyor...",
    statusMcDone: "M–φ analizi tamamlandı.",
    statusMcNoPmm: "Önce PMM analizi çalıştırın.",
    statusMcNoPoints: "Geçerli M–φ noktası üretilemedi. P değerini ve kesit parametrelerini kontrol edin.",
    mcStatsMu: "Mu",
    mcStatsPhiU: "φu",
    mcStatsPhiY: "φy (bilineer)",
    mcStatsDuctility: "μφ = φu/φy",
    btnMcFullscreen: "Büyüt",
    btnMcCollapse: "Küçült",
    btnMcCopy: "Veriyi Kopyala",
    btnMcExport: "Excel (CSV)",
    statusMcCopied: "M-φ verileri panoya kopyalandı.",
  },
  en: {
    kicker: "TS500 + WebAssembly",
    title: "Concrete Column PMM Studio",
    subtitle: "Browser-based PMM/DCR tool for circular and rectangular sections",
    labelLanguage: "Language",
    optLangTr: "Turkish",
    optLangEn: "English",
    labelTheme: "Theme",
    optThemeDark: "Dark",
    optThemeLight: "Light",
    headingRunLog: "Run Log",
    statusLogEmpty: "No logs yet.",
    labelCodeMode: "Code Mode",
    optCodeTs500Tbdy: "TS500 + TBDY 2018 (Column)",
    optCodeTs500: "TS500",
    optCodeAci318_19: "ACI 318-19 (Column)",
    labelConcreteModel: "Concrete model",
    optConcreteTs500Block: "TS500 equivalent block",
    optConcreteMander: "Mander (confined core + unconfined cover)",
    labelShape: "Section Type",
    optShapeRect: "Rectangular",
    optShapeCircle: "Circular",
    labelWidth: "Width b (m)",
    labelHeight: "Height h (m)",
    labelDiameter: "Diameter D (m)",
    labelBarsX: "Top/bottom bar count",
    labelBarsY: "Left/right bar count",
    labelBars: "Total circular bars",
    labelDoubleLayer: "Use double-layer bars",
    labelBarsX2: "2nd layer top/bottom bars",
    labelBarsY2: "2nd layer left/right bars",
    labelBars2: "2nd ring bar count",
    labelLayerSpacing: "Layer center spacing a_row (mm)",
    labelCover: "Cover (m)",
    labelTieDia: "Tie diameter (mm)",
    labelBarDia: "Longitudinal bar diameter (mm)",
    labelTieSpacingConf: "Confinement tie spacing s_conf (mm)",
    labelTieSpacingMid: "Middle-zone tie spacing s_mid (mm)",
    labelFck: "fck (MPa)",
    labelFyk: "fyk (MPa)",
    labelMaterialPreset: "Concrete preset",
    labelSteelPreset: "Steel preset",
    optMaterialPresetCustom: "Custom",
    optMaterialPresetTs500C25_30: "C25/30",
    optMaterialPresetTs500C30_35: "C30/35",
    optMaterialPresetTs500C35_40: "C35/40",
    optMaterialPresetTs500C40_50: "C40/50",
    optMaterialPresetTs500C45_55: "C45/55",
    optMaterialPresetEuC25_30: "C25/30",
    optMaterialPresetEuC30_37: "C30/37",
    optMaterialPresetEuC35_45: "C35/45",
    optMaterialPresetEuC40_50: "C40/50",
    optMaterialPresetEuC45_55: "C45/55",
    optMaterialPresetEuC50_60: "C50/60",
    optMaterialPresetAciF30: "f'c=30 MPa",
    optMaterialPresetAciF35: "f'c=35 MPa",
    optMaterialPresetAciF40: "f'c=40 MPa",
    optMaterialPresetAciF45: "f'c=45 MPa",
    optSteelPresetCustom: "Custom",
    optSteelPresetTs500S220: "S220",
    optSteelPresetTs500S275: "S275",
    optSteelPresetTs500S320: "S320",
    optSteelPresetTs500S420: "S420",
    optSteelPresetTs500S500: "S500",
    optSteelPresetEuB400: "B400",
    optSteelPresetEuB500A: "B500A",
    optSteelPresetEuB500B: "B500B",
    optSteelPresetEuB550B: "B550B",
    optSteelPresetEuB600B: "B600B",
    optSteelPresetAciGr40: "ASTM A615 Gr.40",
    optSteelPresetAciGr60: "ASTM A615 Gr.60",
    optSteelPresetAciGr75: "ASTM A615 Gr.75",
    labelGammaC: "gc",
    labelGammaS: "gs",
    labelEs: "Es (MPa)",
    labelEpsCu: "ecu",
    labelMesh: "Fiber mesh",
    labelNAngle: "Angle count",
    labelNDepth: "Neutral-axis count",
    labelPhiP: "phiP (axial)",
    labelPhiM: "phiM (bending)",
    labelPCutoff: "P cut-off ratio",
    labelPVisualScale: "3D P-axis visual scale",
    labelSurfaceOpacity: "3D surface opacity",
    labelShowNominalSurface: "Show nominal envelope (no phi reduction)",
    labelPSign: "P sign convention",
    optPSignPositive: "Compression (+)",
    optPSignNegative: "Compression (-) [SAP2000]",
    labelCoverToCenter: "Cover is given to bar center",
    labelExpectedStrength: "Enable TBDY expected-strength increase (recommended: fce=1.30*fck, fye=1.20*fyk)",
    labelExpectedFckFactor: "Expected concrete factor fce/fck",
    labelExpectedFykFactor: "Expected steel factor fye/fyk",
    headingSectionPreview: "Section & Rebar Layout",
    labelLoads: "Loads (per line: ",
    labelLoadsTextarea: "Fallback text input (per line: ",
    labelLoadsFmtA: "name,Pu,Mux,Muy",
    labelLoadsOr: " or ",
    labelLoadsFmtB: "Pu,Mux,Muy",
    labelLoadsEnd: ")",
    labelCsvLoad: "CSV load file (optional; columns: name,Pu,Mux,Muy)",
    colLoadSelect: "Sel",
    colLoadNameEdit: "Load Name",
    colLoadPuEdit: "Pu (kN)",
    colLoadMuxEdit: "Mux (kNm)",
    colLoadMuyEdit: "Muy (kNm)",
    btnLoadAddRow: "Add Row",
    btnLoadDeleteRow: "Delete Selected",
    btnLoadCleanRows: "Clean Empty",
    btnLoadCopy: "Copy TSV",
    btnLoadApplyText: "Apply Text to Grid",
    headingReportMeta: "Report Metadata",
    headingReportSections: "Report Settings",
    labelReportCompany: "Company",
    labelReportDocTitle: "Report title",
    labelReportProject: "Project name",
    labelReportClient: "Client",
    labelReportPrepared: "Prepared by",
    labelReportChecked: "Checked by",
    labelReportRevision: "Revision",
    labelReportDate: "Report date",
    labelReportLogo: "Corporate logo",
    labelReportLogoNoFile: "No logo selected",
    labelReportSecCover: "Cover & Identity",
    labelReportSecSummary: "Analysis Summary",
    labelReportSecVisuals: "Section and PMM Visuals",
    labelReportSecLoadInput: "Input Loads",
    labelReportSecLoadResults: "Load Results",
    labelReportSecCompliance: "Code Compliance",
    labelReportSecMphi: "Moment-Curvature",
    labelReportSecAppendix: "Appendix (Mx/My Envelope)",
    btnSectionAdd: "+ Add Section",
    btnProjectOpen: "Open PMM",
    btnProjectSave: "Save PMM",
    btnRun: "Run PMM",
    btnExportResults: "Results CSV",
    btnExportSurface: "PMM Points CSV",
    btnExportReport: "Word Report",
    btnExportReportPdf: "PDF Report",
    statusWasmLoading: "Loading WASM module...",
    statusWasmReady: "Ready. Enter parameters and run analysis.",
    statusAciPresetApplied: "ACI 318-19 preset applied: gc=1.00, gs=1.00, phiP=0.65, phiM=0.90",
    statusPmmCalculating: "Calculating PMM surface...",
    statusEvaluatingPrefix: "Evaluating loads",
    headingInputs: "Input & Section Setup",
    headingGuide: "PMM Guide & Terms",
    guideIntro: "This tool builds a coupled 3D PMM capacity surface under TS500/TBDY/ACI assumptions and evaluates input load cases via DCR.",
    guideGlossaryTitle: "Load Result Terms",
    guidePu: "Pu: Input design axial force (kN).",
    guideMux: "Mux: Input bending moment about x-axis (kNm).",
    guideMuy: "Muy: Input bending moment about y-axis (kNm).",
    guidePcap: "Pcap: Axial component on the capacity surface along the same load direction (kN).",
    guideMxcap: "Mxcap: Mx component on the capacity surface along the same load direction (kNm).",
    guideMycap: "Mycap: My component on the capacity surface along the same load direction (kNm).",
    guideScale: "Scale: Multiplier that scales the demand vector to the capacity surface.",
    guideDcr: "DCR: Demand/Capacity ratio = 1/Scale. Section is adequate when DCR ≤ 1.",
    guideStatus: "Status: PASS (DCR ≤ 1), FAIL (DCR > 1).",
    guideMethodTitle: "Computation Summary",
    guideMethod1: "PMM points are computed by fiber integration for all angles and neutral-axis depths.",
    guideMethod2: "Evaluation is not separate 2D checks; it is coupled 3D interaction over (P-Mx-My) surface.",
    guideMethod3: "phiP and phiM factors are applied to axial and moment capacities respectively.",
    guideMethod4: "P cut-off ratio limits the upper compression capacity cap.",
    guideMethod5: "P sign convention changes display sign only, not physical capacity.",
    headingGroupDesign: "Design Settings",
    headingGroupSection: "Section & Rebar",
    headingGroupAnalysis: "Material & Analysis",
    headingGroupLoads: "Load Input & Export",
    headingCloud: "PMM Point Cloud",
    labelProjection: "View",
    optProjPMx: "P - Mx",
    optProjPMy: "P - My",
    optProjMxMy: "Mx - My",
    heading3dTable: "3D Slice Table",
    labelSliceAngle: "Slice angle (°)",
    labelSliceHideZero: "Hide near-zero rows",
    btnSliceCopy: "Copy Table",
    colSliceNo: "No",
    colSliceP: "P (kN)",
    colSliceMx: "Mx (kNm)",
    colSliceMy: "My (kNm)",
    headingResults: "Load Results",
    accordionHint: "Expand / Collapse",
    colLoad: "Load",
    colPu: "Pu",
    colMux: "Mux",
    colMuy: "Muy",
    colPcap: "Pcap",
    colMxcap: "Mxcap",
    colMycap: "Mycap",
    colScale: "Scale",
    colDcr: "DCR",
    colStatus: "Status",
    headingCompliance: "Code Compliance Checks",
    complianceSummaryInit: "Will be populated after analysis.",
    colCode: "Code",
    colClause: "Clause",
    colCheck: "Check",
    colValue: "Value",
    colLimit: "Limit/Rule",
    colResult: "Result",
    colNote: "Note",
    resultOk: "OK",
    resultFail: "FAIL",
    compliancePass: "PASS",
    complianceFail: "FAIL",
    complianceInfo: "NEEDS DATA",
    plot3dError: "3D plot error",
    statusSliceCopyEmpty: "No 3D slice rows to copy.",
    statusSliceCopied: "3D slice table copied to clipboard.",
    statusSurfaceExported: "PMM CSV exported with Mx/My axis + mirrored columns.",
    statusSurfaceExportEmpty: "No PMM surface found for export.",
    statusReportExported: "Word report generated.",
    statusReportExportEmpty: "Run PMM analysis before exporting report.",
    statusReportPdfExported: "PDF print preview opened.",
    statusReportMetaMissing: "Fill at least Project name and Report date before export.",
    statusReportLogoLoaded: "Corporate logo loaded and will be included in report.",
    statusReportSectionNone: "Select at least one report section.",
    statusProjectSaved: "PMM project file exported.",
    statusProjectOpened: "PMM project file loaded. Stored results were cleared; run PMM again to refresh outputs.",
    statusProjectInvalid: "Invalid PMM project file.",
    statusLoadSheetCopied: "Load grid copied to clipboard as TSV.",
    statusLoadSheetCopyEmpty: "No load rows available for copy.",
    statusLoadSheetImported: "CSV loads appended to load grid.",
    statusLoadSheetTextApplied: "Text input transferred to load grid.",
    statusLoadSheetInvalid: "Load grid has invalid cells. Please correct highlighted fields.",
    headingMc: "Moment – Curvature Analysis",
    mcIntro: "Computes the M–φ curve for uniaxial bending under a given axial load. Run PMM analysis first.",
    labelMcP: "Axial load P (kN)",
    labelMcAngle: "Bending angle (°)",
    labelMcSteps: "Steps",
    btnMcRun: "Compute M–φ",
    mcAngleHint: "0° = Mx bending (horizontal NA) · 90° = My bending (vertical NA)",
    statusMcRunning: "Computing M–φ curve...",
    statusMcDone: "M–φ analysis complete.",
    statusMcNoPmm: "Run PMM analysis first.",
    statusMcNoPoints: "No valid M–φ points produced. Check P value and section parameters.",
    mcStatsMu: "Mu",
    mcStatsPhiU: "φu",
    mcStatsPhiY: "φy (bilinear)",
    mcStatsDuctility: "μφ = φu/φy",
    btnMcFullscreen: "Expand",
    btnMcCollapse: "Collapse",
    btnMcCopy: "Copy Data",
    btnMcExport: "Excel (CSV)",
    statusMcCopied: "M-φ data copied to clipboard.",
  },
} as const;

type I18nKey = keyof typeof I18N.tr;
const LOAD_SHEET_COLS: LoadSheetCol[] = ["name", "pu", "mux", "muy"];
const NUMERIC_LOAD_COLS: Array<"pu" | "mux" | "muy"> = ["pu", "mux", "muy"];
const DEFAULT_LOAD_SHEET: LoadSheetRow[] = [
  { name: "L1", pu: "1200", mux: "120", muy: "80" },
  { name: "L2", pu: "1800", mux: "200", muy: "140" },
  { name: "L3", pu: "650", mux: "90", muy: "45" },
];

function isNumericLoadCol(col: LoadSheetCol): col is "pu" | "mux" | "muy" {
  return col === "pu" || col === "mux" || col === "muy";
}

function tx(key: I18nKey): string {
  return I18N[state.lang][key];
}

function complianceSummaryText(passCount: number, failCount: number, infoCount: number): string {
  if (state.lang === "en") return `Check summary: ${passCount} pass, ${failCount} fail, ${infoCount} needs data.`;
  return `Kontrol özeti: ${passCount} uygun, ${failCount} uygunsuz, ${infoCount} veri-gerekli.`;
}

function runSummaryText(input: AppInput, maxDcr: number, failCount: number, infoCount: number): string {
  const base = `${input.nAngle * input.nDepth}`;
  const modelText = input.concreteModel === "mander_core_cover" ? "Mander core+cover" : "TS500 block";
  const strengths = resolveDesignStrengths(input);
  const expectedText = strengths.expectedApplied
    ? `, expected x${fmt(strengths.expectedFckFactor, 2)}/x${fmt(strengths.expectedFykFactor, 2)}`
    : "";
  if (state.lang === "en") {
    return `${base} PMM shell points (+2 poles) generated. Max DCR: ${fmt(maxDcr, 3)} | model=${modelText}${expectedText}, phiP=${fmt(input.phiP, 2)}, phiM=${fmt(input.phiM, 2)}, cut-off=${fmt(input.pCutoffRatio, 2)} | Compliance: ${failCount} fail, ${infoCount} needs data`;
  }
  return `${base} PMM shell noktası (+2 kutup) üretildi. En büyük DCR: ${fmt(maxDcr, 3)} | model=${modelText}${expectedText}, phiP=${fmt(input.phiP, 2)}, phiM=${fmt(input.phiM, 2)}, cut-off=${fmt(input.pCutoffRatio, 2)} | Uyumluluk: ${failCount} uygunsuz, ${infoCount} ek kontrol`;
}

function reinforcementRatioText(input: AppInput): string {
  const rhoPct = calcLongitudinalRatioPct(input);
  if (state.lang === "en") return `Provided longitudinal reinforcement ratio (rho_t): %${fmt(rhoPct, 2)}`;
  return `Sağlanan boyuna donatı oranı (rho_t): %${fmt(rhoPct, 2)}`;
}

function renderStatusLog(): void {
  refs.statusLog.innerHTML = "";
  const currentStatus = refs.status.textContent?.trim() ?? "";
  let skippedCurrent = false;
  const visible = state.statusLogEntries.filter((entry) => {
    if (!skippedCurrent && entry.text === currentStatus) {
      skippedCurrent = true;
      return false;
    }
    return true;
  });

  if (visible.length === 0) {
    const li = document.createElement("li");
    li.className = "status-log-empty";
    li.textContent = tx("statusLogEmpty");
    refs.statusLog.appendChild(li);
    return;
  }

  for (const entry of visible) {
    const li = document.createElement("li");
    li.className = entry.level === "danger" ? "danger" : "info";
    li.textContent = entry.text;
    refs.statusLog.appendChild(li);
  }
}

function pushStatusLog(text: string, level: StatusLevel): void {
  const cleaned = text.trim();
  if (cleaned.length === 0) return;

  const first = state.statusLogEntries[0];
  if (first && first.text === cleaned && first.level === level) {
    return;
  }

  state.statusLogEntries.unshift({ text: cleaned, level });
  state.statusLogEntries = state.statusLogEntries.slice(0, 3);
  renderStatusLog();
}

function setStatus(text: string, level: StatusLevel = "info", writeLog = true): void {
  refs.status.textContent = text;
  refs.status.classList.toggle("danger", level === "danger");
  if (writeLog) pushStatusLog(text, level);
}

function syncControlsAccordionLayout(): void {
  const collapsed = !refs.controlsAccordion.open;
  refs.workspace.classList.toggle("workspace-controls-collapsed", collapsed);
  localStorage.setItem("pmm-controls-open", collapsed ? "0" : "1");
  window.setTimeout(() => {
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
    render3dSliceTable(state.surface);
    if (state.mcData) {
      resizeMcPlotsDeferred(120);
      resizeMcPlotsDeferred(260);
    }
  }, 70);
}

function refreshHeroToggles(): void {
  refs.langToggle.textContent = state.lang === "tr" ? "EN" : "TR";
  refs.langToggle.title = state.lang === "tr" ? "English" : "Turkce";
  refs.langToggle.setAttribute(
    "aria-label",
    state.lang === "tr" ? "Dili Ingilizceye cevir" : "Switch language to Turkish"
  );

  const lightTheme = state.theme === "light";
  refs.themeToggle.textContent = lightTheme ? "☾" : "☀";
  refs.themeToggle.title = lightTheme
    ? (state.lang === "tr" ? "Karanlik tema" : "Dark theme")
    : (state.lang === "tr" ? "Aydinlik tema" : "Light theme");
  refs.themeToggle.setAttribute(
    "aria-label",
    lightTheme
      ? (state.lang === "tr" ? "Karanlik temaya gec" : "Switch to dark theme")
      : (state.lang === "tr" ? "Aydinlik temaya gec" : "Switch to light theme")
  );
}

function applyLocale(): void {
  const all = document.querySelectorAll<HTMLElement>("[data-i18n]");
  for (const el of all) {
    const key = el.dataset.i18n as I18nKey | undefined;
    if (!key) continue;
    el.textContent = tx(key);
  }
  if (!state.reportLogoDataUrl) {
    refs.reportLogoName.textContent = tx("labelReportLogoNoFile");
  }
  if (state.results.length === 0) {
    setStatus(tx("statusWasmReady"), "info", false);
  }
  renderStatusLog();
  refs.rhoDisplay.textContent = state.lastInput ? reinforcementRatioText(state.lastInput) : "";
  if (state.compliance.length === 0) {
    refs.complianceSummary.textContent = tx("complianceSummaryInit");
  } else {
    renderCompliance(state.compliance);
  }
  if (state.results.length > 0) {
    renderTable(state.results);
  }
  renderLoadSheetGrid();
  render3dSliceTable(state.surface);
  renderSectionPreview();
  updateMcFullscreenButtonLabel();
  refreshHeroToggles();
}

function applyTheme(theme: ThemeMode): void {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.body.classList.toggle("theme-light", theme === "light");
  document.body.classList.toggle("theme-dark", theme === "dark");
  refreshHeroToggles();
  renderPlot(state.surface, state.results);
  renderPlot3d(state.surface, state.results);
  if (state.mcData) renderMcPlot(state.mcData);
}

init().catch((error) => {
  setStatus(state.lang === "en" ? `Error: ${String(error)}` : `Hata: ${String(error)}`, "danger");
});

async function init(): Promise<void> {
  state.loadSheet = DEFAULT_LOAD_SHEET.map((row) => ({ ...row }));
  state.loadSelectionAnchor = { row: 0, col: "name" };
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, state.loadSelectionAnchor);
  state.activeLoadCell = { row: 0, col: "name" };
  refs.reportDate.value = formatDateInputValue(new Date());
  refs.reportDocTitle.value = "Kolon PMM Teknik Raporu";
  refs.reportLogoName.textContent = tx("labelReportLogoNoFile");

  const savedLang = localStorage.getItem("pmm-lang");
  if (savedLang === "tr" || savedLang === "en") state.lang = savedLang;

  const savedTheme = localStorage.getItem("pmm-theme");
  if (savedTheme === "dark" || savedTheme === "light") state.theme = savedTheme;
  applyTheme(state.theme);

  const savedControlsOpen = localStorage.getItem("pmm-controls-open");
  if (savedControlsOpen === "0") {
    refs.controlsAccordion.open = false;
  }
  syncControlsAccordionLayout();

  const savedPSign = localStorage.getItem("pmm-p-sign");
  if (savedPSign === "compression_positive" || savedPSign === "compression_negative") {
    refs.pSign.value = savedPSign;
  }

  const savedConcreteModel = localStorage.getItem("pmm-concrete-model");
  if (savedConcreteModel === "ts500_block" || savedConcreteModel === "mander_core_cover") {
    refs.concreteModel.value = savedConcreteModel;
  }
  const savedMaterialPreset = localStorage.getItem("pmm-material-preset");
  setSelectValue(refs.materialPreset, savedMaterialPreset ?? "custom", "custom");
  const savedSteelPreset = localStorage.getItem("pmm-steel-preset");
  setSelectValue(refs.steelPreset, savedSteelPreset ?? "custom", "custom");
  const savedCodeMode = localStorage.getItem("pmm-code-mode");
  if (savedCodeMode === "ts500" || savedCodeMode === "ts500_tbdy" || savedCodeMode === "aci318_19") {
    refs.codeMode.value = savedCodeMode;
  }
  const savedExpectedEnabled = localStorage.getItem("pmm-expected-strength");
  if (savedExpectedEnabled === "1") {
    refs.useExpectedStrength.checked = true;
  }
  const savedExpectedFck = Number(localStorage.getItem("pmm-expected-fck-factor"));
  if (Number.isFinite(savedExpectedFck) && savedExpectedFck >= 1.0 && savedExpectedFck <= 2.0) {
    refs.expectedFckFactor.value = savedExpectedFck.toFixed(2);
  }
  const savedExpectedFyk = Number(localStorage.getItem("pmm-expected-fyk-factor"));
  if (Number.isFinite(savedExpectedFyk) && savedExpectedFyk >= 1.0 && savedExpectedFyk <= 2.0) {
    refs.expectedFykFactor.value = savedExpectedFyk.toFixed(2);
  }

  const savedPVisual = Number(localStorage.getItem("pmm-p-visual"));
  if (Number.isFinite(savedPVisual) && savedPVisual >= 0.2 && savedPVisual <= 1.5) {
    refs.pVisualScale.value = savedPVisual.toFixed(2);
  }
  const savedSurfaceOpacity = Number(localStorage.getItem("pmm-surface-opacity"));
  if (Number.isFinite(savedSurfaceOpacity) && savedSurfaceOpacity >= 0.15 && savedSurfaceOpacity <= 1.0) {
    refs.surfaceOpacity.value = savedSurfaceOpacity.toFixed(2);
  }
  state.showNominalSurface = localStorage.getItem("pmm-show-nominal-surface") === "1";
  refs.showNominalSurface.checked = state.showNominalSurface;
  renderSurfaceOpacityValue();

  applyLocale();
  syncLoadsTextareaFromSheet();
  renderLoadSheetGrid();

  // Initialize default section from form defaults
  state.sectionIdCounter = 1;
  state.sections = [defaultSection(1, "S1")];
  state.activeSectionIdx = 0;
  state.sectionFormExpanded = true;
  renderSectionStrip();

  bindShapeVisibility();
  bindExpectedStrengthVisibility();
  applyCodeModePreset(false);
  applyMaterialPresetFromSelection(refs.materialPreset.value);
  applySteelPresetFromSelection(refs.steelPreset.value);
  bindSectionPreviewListeners();
  renderSectionPreview();
  refs.shape.addEventListener("change", bindShapeVisibility);
  refs.doubleLayer.addEventListener("change", bindShapeVisibility);
  refs.sectionAddBtn.addEventListener("click", addSection);
  refs.codeMode.addEventListener("change", () => {
    localStorage.setItem("pmm-code-mode", refs.codeMode.value);
    applyCodeModePreset(true);
    bindExpectedStrengthVisibility();
  });
  refs.materialPreset.addEventListener("change", () => {
    if (refs.materialPreset.value === "custom") {
      markMaterialPresetCustom();
      return;
    }
    applyMaterialPresetFromSelection(refs.materialPreset.value);
  });
  refs.steelPreset.addEventListener("change", () => {
    if (refs.steelPreset.value === "custom") {
      markSteelPresetCustom();
      return;
    }
    applySteelPresetFromSelection(refs.steelPreset.value);
  });
  for (const el of [refs.fck, refs.gammaC, refs.gammaS, refs.es, refs.epsCu]) {
    el.addEventListener("input", markMaterialPresetCustom);
    el.addEventListener("change", markMaterialPresetCustom);
  }
  const onFykInputCustom = (): void => {
    markSteelPresetCustom();
  };
  refs.fyk.addEventListener("input", onFykInputCustom);
  refs.fyk.addEventListener("change", onFykInputCustom);
  refs.controlsAccordion.addEventListener("toggle", syncControlsAccordionLayout);
  refs.langToggle.addEventListener("click", () => {
    state.lang = state.lang === "tr" ? "en" : "tr";
    localStorage.setItem("pmm-lang", state.lang);
    applyLocale();
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
  });
  refs.themeToggle.addEventListener("click", () => {
    const value: ThemeMode = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("pmm-theme", value);
    applyTheme(value);
  });
  refs.projection.addEventListener("change", () => {
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
  });
  refs.showNominalSurface.addEventListener("change", () => {
    state.showNominalSurface = refs.showNominalSurface.checked;
    localStorage.setItem("pmm-show-nominal-surface", state.showNominalSurface ? "1" : "0");
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
  });
  refs.pSign.addEventListener("change", () => {
    localStorage.setItem("pmm-p-sign", refs.pSign.value);
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
    render3dSliceTable(state.surface);
  });
  refs.concreteModel.addEventListener("change", () => {
    localStorage.setItem("pmm-concrete-model", refs.concreteModel.value);
  });
  refs.useExpectedStrength.addEventListener("change", () => {
    localStorage.setItem("pmm-expected-strength", refs.useExpectedStrength.checked ? "1" : "0");
    bindExpectedStrengthVisibility();
  });
  refs.expectedFckFactor.addEventListener("input", () => {
    localStorage.setItem("pmm-expected-fck-factor", refs.expectedFckFactor.value);
  });
  refs.expectedFykFactor.addEventListener("input", () => {
    localStorage.setItem("pmm-expected-fyk-factor", refs.expectedFykFactor.value);
  });
  refs.pVisualScale.addEventListener("input", () => {
    localStorage.setItem("pmm-p-visual", refs.pVisualScale.value);
    renderPlot3d(state.surface, state.results);
    render3dSliceTable(state.surface);
  });
  refs.surfaceOpacity.addEventListener("input", () => {
    localStorage.setItem("pmm-surface-opacity", refs.surfaceOpacity.value);
    renderSurfaceOpacityValue();
    renderPlot3d(state.surface, state.results);
  });
  refs.sliceAngle.addEventListener("input", () => {
    const parsed = Number(refs.sliceAngle.value.replace(",", "."));
    state.sliceAngleDeg = Number.isFinite(parsed) ? normalizeDeg(parsed) : 0;
    render3dSliceTable(state.surface);
  });
  refs.loadAddRowBtn.addEventListener("click", () => {
    addLoadSheetRows(1);
    renderLoadSheetGrid();
  });
  refs.loadDeleteRowBtn.addEventListener("click", () => {
    deleteSelectedLoadRows();
    renderLoadSheetGrid();
    syncLoadsTextareaFromSheet();
  });
  refs.loadCleanEmptyBtn.addEventListener("click", () => {
    cleanupEmptyLoadRows();
    renderLoadSheetGrid();
    syncLoadsTextareaFromSheet();
  });
  refs.loadCopyBtn.addEventListener("click", () => copyLoadSheetSelection().catch(showError));
  refs.loadsApplyTextBtn.addEventListener("click", () => {
    try {
      applyTextareaToLoadSheet();
    } catch (error) {
      showError(error);
    }
  });
  refs.loadsFile.addEventListener("change", () => importCsvToLoadSheet().catch(showError));
  refs.loadSheetBody.addEventListener("input", onLoadGridInput);
  refs.loadSheetBody.addEventListener("keydown", onLoadGridKeydown);
  refs.loadSheetBody.addEventListener("paste", onLoadGridPaste);
  refs.loadSheetBody.addEventListener("focusin", onLoadGridFocusIn);
  refs.loadSheetBody.addEventListener("change", onLoadGridChange);
  refs.loadSheetBody.addEventListener("mousedown", onLoadGridMouseDown);
  refs.loadSheetBody.addEventListener("mouseover", onLoadGridMouseOver);
  window.addEventListener("mouseup", onLoadGridMouseUp);
  refs.projectOpen.addEventListener("click", () => {
    refs.projectFile.value = "";
    refs.projectFile.click();
  });
  refs.projectFile.addEventListener("change", () => openProjectFile().catch(showError));
  refs.projectSave.addEventListener("click", saveProjectFile);
  refs.reportLogo.addEventListener("change", () => handleReportLogoSelection().catch(showError));
  refs.sliceHideZero.addEventListener("change", () => {
    render3dSliceTable(state.surface);
  });
  refs.sliceCopy.addEventListener("click", () => copySliceTableToClipboard().catch(showError));
  refs.runBtn.addEventListener("click", () => runAnalysis().catch(showError));
  refs.exportResults.addEventListener("click", exportResultsCsv);
  refs.exportSurface.addEventListener("click", exportSurfaceCsv);
  refs.exportReport.addEventListener("click", () => exportWordReport().catch(showError));
  refs.exportReportPdf.addEventListener("click", () => exportPdfReport().catch(showError));
  refs.mcRunBtn.addEventListener("click", () => runMomentCurvature().catch(showError));
  refs.mcFullscreenBtn.addEventListener("click", toggleMcFullscreen);
  refs.mcCloseBtn.addEventListener("click", closeMcFullscreen);
  refs.mcCopyBtn.addEventListener("click", () => copyMcData().catch(showError));
  refs.mcExportBtn.addEventListener("click", exportMcDataToCsv);
  window.addEventListener("resize", () => {
    resizeMcPlotsDeferred(140);
    resizeMcPlotsDeferred(320);
  });

  setStatus(tx("statusWasmLoading"), "info");
  state.wasm = await loadWasm();
  setStatus(tx("statusWasmReady"), "info");
}

function defaultSection(id: number, name: string): SectionDef {
  return {
    id, name,
    shape: "rect",
    width: "0.40", height: "0.60", diameter: "0.60",
    barsX: "4", barsY: "4", bars: "12",
    useDoubleLayer: false,
    barsX2: "2", barsY2: "2", bars2: "6", layerSpacing: "60",
    cover: "0.04", tieDia: "10", barDia: "16",
    tieSpacingConf: "100", tieSpacingMid: "150",
    coverToCenter: false,
  };
}

function countRectPerimeterBars(barsX: number, barsY: number): number {
  return Math.max(0, 2 * barsX + 2 * Math.max(0, barsY - 2));
}

function countSectionBars(sec: Pick<SectionDef, "shape" | "barsX" | "barsY" | "bars" | "useDoubleLayer" | "barsX2" | "barsY2" | "bars2">): number {
  if (sec.shape === "rect") {
    let total = countRectPerimeterBars(ni(sec.barsX), ni(sec.barsY));
    if (sec.useDoubleLayer) total += countRectPerimeterBars(ni(sec.barsX2), ni(sec.barsY2));
    return total;
  }

  let total = Math.max(0, ni(sec.bars));
  if (sec.useDoubleLayer) total += Math.max(0, ni(sec.bars2));
  return total;
}

function sectionSummaryText(sec: SectionDef): string {
  if (sec.shape === "rect") {
    const w = (parseFloat(sec.width) * 100).toFixed(0);
    const h = (parseFloat(sec.height) * 100).toFixed(0);
    return `${w}×${h} cm`;
  }
  const d = (parseFloat(sec.diameter) * 100).toFixed(0);
  return `D${d} cm`;
}

function sectionRebarSummary(sec: SectionDef): string {
  const nBars = countSectionBars(sec);
  const layerTag = sec.useDoubleLayer ? (state.lang === "en" ? " / 2 layers" : " / 2 sıra") : "";
  return `${isNaN(nBars) ? "?" : nBars}\u03C6${sec.barDia}${layerTag}`;
}

function syncSectionFormToState(): void {
  const sec = state.sections[state.activeSectionIdx];
  if (!sec) return;
  sec.shape = refs.shape.value as Shape;
  sec.width = refs.width.value;
  sec.height = refs.height.value;
  sec.diameter = refs.diameter.value;
  sec.barsX = refs.barsX.value;
  sec.barsY = refs.barsY.value;
  sec.bars = refs.bars.value;
  sec.useDoubleLayer = refs.doubleLayer.checked;
  sec.barsX2 = refs.barsX2.value;
  sec.barsY2 = refs.barsY2.value;
  sec.bars2 = refs.bars2.value;
  sec.layerSpacing = refs.layerSpacing.value;
  sec.cover = refs.cover.value;
  sec.tieDia = refs.tieDia.value;
  sec.barDia = refs.barDia.value;
  sec.tieSpacingConf = refs.tieSpacingConf.value;
  sec.tieSpacingMid = refs.tieSpacingMid.value;
  sec.coverToCenter = refs.coverToCenter.checked;
}

function loadSectionToForm(idx: number): void {
  const sec = state.sections[idx];
  if (!sec) return;
  refs.shape.value = sec.shape;
  refs.width.value = sec.width;
  refs.height.value = sec.height;
  refs.diameter.value = sec.diameter;
  refs.barsX.value = sec.barsX;
  refs.barsY.value = sec.barsY;
  refs.bars.value = sec.bars;
  refs.doubleLayer.checked = sec.useDoubleLayer;
  refs.barsX2.value = sec.barsX2;
  refs.barsY2.value = sec.barsY2;
  refs.bars2.value = sec.bars2;
  refs.layerSpacing.value = sec.layerSpacing;
  refs.cover.value = sec.cover;
  refs.tieDia.value = sec.tieDia;
  refs.barDia.value = sec.barDia;
  refs.tieSpacingConf.value = sec.tieSpacingConf;
  refs.tieSpacingMid.value = sec.tieSpacingMid;
  refs.coverToCenter.checked = sec.coverToCenter;
  bindShapeVisibility();
  renderSectionPreview();
}

function switchSection(idx: number): void {
  if (idx === state.activeSectionIdx) {
    state.sectionFormExpanded = !state.sectionFormExpanded;
    refs.sectionFormBody.classList.toggle("hidden", !state.sectionFormExpanded);
    renderSectionStrip();
    return;
  }
  syncSectionFormToState();
  state.activeSectionIdx = idx;
  state.sectionFormExpanded = true;
  refs.sectionFormBody.classList.remove("hidden");
  loadSectionToForm(idx);
  renderSectionStrip();
}

function addSection(): void {
  syncSectionFormToState();
  state.sectionIdCounter++;
  const name = `S${state.sections.length + 1}`;
  state.sections.push(defaultSection(state.sectionIdCounter, name));
  state.activeSectionIdx = state.sections.length - 1;
  state.sectionFormExpanded = true;
  refs.sectionFormBody.classList.remove("hidden");
  loadSectionToForm(state.activeSectionIdx);
  renderSectionStrip();
}

function removeSection(idx: number): void {
  if (state.sections.length <= 1) return;
  state.sections.splice(idx, 1);
  state.sections.forEach((sec, i) => { sec.name = `S${i + 1}`; });
  if (state.activeSectionIdx >= state.sections.length) {
    state.activeSectionIdx = state.sections.length - 1;
  }
  loadSectionToForm(state.activeSectionIdx);
  renderSectionStrip();
}

function renderSectionStrip(): void {
  const container = refs.sectionStrip;
  container.innerHTML = "";

  for (let i = 0; i < state.sections.length; i++) {
    const sec = state.sections[i];
    const isActive = i === state.activeSectionIdx;

    const card = document.createElement("div");
    card.className = `section-strip-card${isActive ? " active" : ""}`;
    card.dataset.idx = String(i);

    const nameSpan = document.createElement("span");
    nameSpan.className = "section-strip-name";
    nameSpan.textContent = sec.name;

    const shapeLabel = sec.shape === "rect" ? tx("optShapeRect") : tx("optShapeCircle");
    const summarySpan = document.createElement("span");
    summarySpan.className = "section-strip-summary";
    summarySpan.textContent = `${shapeLabel} ${sectionSummaryText(sec)} · ${sectionRebarSummary(sec)}`;

    const chevron = document.createElement("span");
    chevron.className = "section-strip-chevron";
    chevron.textContent = isActive && state.sectionFormExpanded ? "\u25B4" : "\u25BE";

    card.appendChild(nameSpan);
    card.appendChild(summarySpan);

    if (state.sections.length > 1) {
      const delBtn = document.createElement("button");
      delBtn.className = "section-strip-del";
      delBtn.type = "button";
      delBtn.textContent = "\u00D7";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeSection(i);
      });
      card.appendChild(delBtn);
    }

    card.appendChild(chevron);
    card.addEventListener("click", () => switchSection(i));
    container.appendChild(card);
  }
}

function updateActiveSectionStripSummary(): void {
  const card = refs.sectionStrip.querySelector(`.section-strip-card[data-idx="${state.activeSectionIdx}"]`);
  if (!card) return;
  const summaryEl = card.querySelector(".section-strip-summary");
  if (!summaryEl) return;
  const sec = state.sections[state.activeSectionIdx];
  const shapeLabel = sec.shape === "rect" ? tx("optShapeRect") : tx("optShapeCircle");
  summaryEl.textContent = `${shapeLabel} ${sectionSummaryText(sec)} · ${sectionRebarSummary(sec)}`;
}

function bindShapeVisibility(): void {
  const shape = refs.shape.value as Shape;
  const rect = shape === "rect";
  const doubleLayer = refs.doubleLayer.checked;
  refs.fieldWidth.classList.toggle("hidden", !rect);
  refs.fieldHeight.classList.toggle("hidden", !rect);
  refs.fieldDoubleLayer.classList.remove("hidden");
  refs.fieldBarsX.classList.toggle("hidden", !rect);
  refs.fieldBarsY.classList.toggle("hidden", !rect);
  refs.fieldDiameter.classList.toggle("hidden", rect);
  refs.fieldBars.classList.toggle("hidden", rect);
  refs.fieldBarsX2.classList.toggle("hidden", !rect || !doubleLayer);
  refs.fieldBarsY2.classList.toggle("hidden", !rect || !doubleLayer);
  refs.fieldBars2.classList.toggle("hidden", rect || !doubleLayer);
  refs.fieldLayerSpacing.classList.toggle("hidden", !doubleLayer);
  renderSectionPreview();
}

function bindExpectedStrengthVisibility(): void {
  const codeMode = refs.codeMode.value as CodeMode;
  const isTbdyMode = codeMode === "ts500_tbdy";
  refs.expectedStrengthPanel.classList.toggle("hidden", !isTbdyMode);
  const showFactors = isTbdyMode && refs.useExpectedStrength.checked;
  refs.fieldExpectedFckFactor.classList.toggle("hidden", !showFactors);
  refs.fieldExpectedFykFactor.classList.toggle("hidden", !showFactors);
}

function allowedPresetFamiliesForCodeMode(codeMode: CodeMode): string[] {
  return codeMode === "aci318_19" ? ["aci"] : ["ts500", "eu"];
}

function syncPresetGroupVisibility(select: HTMLSelectElement, allowedFamilies: string[]): void {
  const groups = Array.from(select.querySelectorAll("optgroup"));
  for (const group of groups) {
    const family = group.dataset.presetFamily ?? "";
    const visible = family === "" || allowedFamilies.includes(family);
    group.hidden = !visible;
    group.disabled = !visible;
  }
}

function isPresetValueAllowed(select: HTMLSelectElement, value: string, allowedFamilies: string[]): boolean {
  if (value === "custom") return true;
  const option = Array.from(select.options).find((item) => item.value === value);
  if (!option || option.disabled || option.hidden) return false;
  const parent = option.parentElement;
  if (parent instanceof HTMLOptGroupElement) {
    const family = parent.dataset.presetFamily ?? "";
    return family === "" || allowedFamilies.includes(family);
  }
  return true;
}

function syncPresetVisibilityForCodeMode(): void {
  const allowedFamilies = allowedPresetFamiliesForCodeMode(refs.codeMode.value as CodeMode);
  syncPresetGroupVisibility(refs.materialPreset, allowedFamilies);
  syncPresetGroupVisibility(refs.steelPreset, allowedFamilies);

  if (!isPresetValueAllowed(refs.materialPreset, refs.materialPreset.value, allowedFamilies)) {
    markMaterialPresetCustom();
  }
  if (!isPresetValueAllowed(refs.steelPreset, refs.steelPreset.value, allowedFamilies)) {
    markSteelPresetCustom();
  }
}

function applyCodeModePreset(notify: boolean): void {
  const codeMode = refs.codeMode.value as CodeMode;
  syncPresetVisibilityForCodeMode();
  if (codeMode !== "aci318_19") return;

  refs.gammaC.value = "1.00";
  refs.gammaS.value = "1.00";
  refs.phiP.value = "0.65";
  refs.phiM.value = "0.90";

  if (refs.useExpectedStrength.checked) {
    refs.useExpectedStrength.checked = false;
    localStorage.setItem("pmm-expected-strength", "0");
  }

  if (notify) {
    setStatus(tx("statusAciPresetApplied"), "info");
  }
}

function applyMaterialPresetFromSelection(value: string): void {
  if (value === "custom") {
    return;
  }
  const preset = getMaterialPreset(value);
  if (!preset) {
    setSelectValue(refs.materialPreset, "custom", "custom");
    localStorage.setItem("pmm-material-preset", "custom");
    return;
  }

  refs.fck.value = String(preset.fck);
  refs.fyk.value = String(preset.fyk);
  refs.gammaC.value = String(preset.gammaC);
  refs.gammaS.value = String(preset.gammaS);
  refs.es.value = String(preset.es);
  refs.epsCu.value = String(preset.epsCu);
  const preferredSteelPreset = getPreferredSteelPresetForMaterial(value, preset.fyk);
  if (preferredSteelPreset) {
    setSelectValue(refs.steelPreset, preferredSteelPreset, "custom");
    localStorage.setItem("pmm-steel-preset", preferredSteelPreset);
  } else {
    syncSteelPresetFromFyk();
  }
  setSelectValue(refs.materialPreset, value, "custom");
  localStorage.setItem("pmm-material-preset", value);
}

function markMaterialPresetCustom(): void {
  setSelectValue(refs.materialPreset, "custom", "custom");
  localStorage.setItem("pmm-material-preset", "custom");
}

function getPreferredSteelPresetForMaterial(materialPresetId: string, fyk: number): SteelPresetId | null {
  if (materialPresetId.startsWith("ts500-")) {
    if (approxEq(fyk, 220, 1e-9)) return "steel-ts500-s220";
    if (approxEq(fyk, 275, 1e-9)) return "steel-ts500-s275";
    if (approxEq(fyk, 320, 1e-9)) return "steel-ts500-s320";
    if (approxEq(fyk, 420, 1e-9)) return "steel-ts500-s420";
    if (approxEq(fyk, 500, 1e-9)) return "steel-ts500-s500";
  }

  if (materialPresetId.startsWith("eu-")) {
    if (approxEq(fyk, 400, 1e-9)) return "steel-eu-b400";
    if (approxEq(fyk, 500, 1e-9)) return "steel-eu-b500b";
    if (approxEq(fyk, 550, 1e-9)) return "steel-eu-b550b";
    if (approxEq(fyk, 600, 1e-9)) return "steel-eu-b600b";
  }

  if (materialPresetId.startsWith("aci-")) {
    if (approxEq(fyk, 276, 1e-9)) return "steel-aci-gr40";
    if (approxEq(fyk, 414, 1e-9)) return "steel-aci-gr60";
    if (approxEq(fyk, 517, 1e-9)) return "steel-aci-gr75";
    if (approxEq(fyk, 420, 6.5)) return "steel-aci-gr60";
  }

  return null;
}

function syncSteelPresetFromFyk(): void {
  const fyk = Number(refs.fyk.value);
  if (!Number.isFinite(fyk)) {
    markSteelPresetCustom();
    return;
  }

  const matches = (Object.keys(STEEL_PRESETS) as SteelPresetId[]).filter((key) =>
    approxEq(STEEL_PRESETS[key].fyk, fyk, 1e-9),
  );

  if (matches.length === 1) {
    setSelectValue(refs.steelPreset, matches[0], "custom");
    localStorage.setItem("pmm-steel-preset", matches[0]);
    return;
  }

  if (matches.length > 1 && isSteelPresetId(refs.steelPreset.value)) {
    if (matches.includes(refs.steelPreset.value as SteelPresetId)) {
      setSelectValue(refs.steelPreset, refs.steelPreset.value, "custom");
      localStorage.setItem("pmm-steel-preset", refs.steelPreset.value);
      return;
    }
  }

  if (matches.length > 1) {
    setSelectValue(refs.steelPreset, "custom", "custom");
    localStorage.setItem("pmm-steel-preset", "custom");
    return;
  }

  markSteelPresetCustom();
}

function applySteelPresetFromSelection(value: string): void {
  if (value === "custom") {
    return;
  }
  const preset = getSteelPreset(value);
  if (!preset) {
    setSelectValue(refs.steelPreset, "custom", "custom");
    localStorage.setItem("pmm-steel-preset", "custom");
    return;
  }

  refs.fyk.value = String(preset.fyk);
  setSelectValue(refs.steelPreset, value, "custom");
  localStorage.setItem("pmm-steel-preset", value);
}

function markSteelPresetCustom(): void {
  setSelectValue(refs.steelPreset, "custom", "custom");
  localStorage.setItem("pmm-steel-preset", "custom");
}

function bindSectionPreviewListeners(): void {
  const ids: HTMLElement[] = [
    refs.shape,
    refs.width,
    refs.height,
    refs.diameter,
    refs.barsX,
    refs.barsY,
    refs.bars,
    refs.doubleLayer,
    refs.barsX2,
    refs.barsY2,
    refs.bars2,
    refs.layerSpacing,
    refs.cover,
    refs.tieDia,
    refs.barDia,
    refs.tieSpacingConf,
    refs.tieSpacingMid,
    refs.coverToCenter,
  ];

  for (const el of ids) {
    el.addEventListener("input", () => {
      syncSectionFormToState();
      updateActiveSectionStripSummary();
      renderSectionPreview();
    });
    el.addEventListener("change", () => {
      syncSectionFormToState();
      updateActiveSectionStripSummary();
      renderSectionPreview();
    });
  }
}

interface XY {
  x: number;
  y: number;
}

interface SectionPreviewInput {
  shape: Shape;
  widthM: number;
  heightM: number;
  diameterM: number;
  barsX: number;
  barsY: number;
  bars: number;
  useDoubleLayer: boolean;
  barsX2: number;
  barsY2: number;
  bars2: number;
  layerSpacingM: number;
  coverM: number;
  tieDiaM: number;
  barDiaM: number;
  tieSpacingConfMm: number;
  tieSpacingMidMm: number;
  coverToCenter: boolean;
}

interface RectBarLayerLayout {
  layerIndex: number;
  edgeM: number;
  barsX: number;
  barsY: number;
  xLeft: number;
  xRight: number;
  yBot: number;
  yTop: number;
  sxM: number;
  syM: number;
  bars: XY[];
}

interface CircleBarLayerLayout {
  layerIndex: number;
  edgeM: number;
  barCount: number;
  radiusM: number;
  sArcM: number;
  bars: XY[];
}

interface SectionRebarLayout {
  bars: XY[];
  rectLayers: RectBarLayerLayout[];
  circleLayers: CircleBarLayerLayout[];
  spacingCenterMm: number[];
  minPairCenterMm: number;
}

function parsePreviewNumber(v: string, fallback: number): number {
  const value = Number(v.trim().replace(",", "."));
  return Number.isFinite(value) ? value : fallback;
}

function collectSectionPreviewInput(): SectionPreviewInput | null {
  const shape = refs.shape.value as Shape;
  const input: SectionPreviewInput = {
    shape,
    widthM: parsePreviewNumber(refs.width.value, 0),
    heightM: parsePreviewNumber(refs.height.value, 0),
    diameterM: parsePreviewNumber(refs.diameter.value, 0),
    barsX: Math.max(2, Math.round(parsePreviewNumber(refs.barsX.value, 2))),
    barsY: Math.max(2, Math.round(parsePreviewNumber(refs.barsY.value, 2))),
    bars: Math.max(3, Math.round(parsePreviewNumber(refs.bars.value, 3))),
    useDoubleLayer: refs.doubleLayer.checked,
    barsX2: Math.max(2, Math.round(parsePreviewNumber(refs.barsX2.value, 2))),
    barsY2: Math.max(2, Math.round(parsePreviewNumber(refs.barsY2.value, 2))),
    bars2: Math.max(3, Math.round(parsePreviewNumber(refs.bars2.value, 3))),
    layerSpacingM: parsePreviewNumber(refs.layerSpacing.value, 0) / 1000.0,
    coverM: parsePreviewNumber(refs.cover.value, 0),
    tieDiaM: parsePreviewNumber(refs.tieDia.value, 0) / 1000.0,
    barDiaM: parsePreviewNumber(refs.barDia.value, 0) / 1000.0,
    tieSpacingConfMm: parsePreviewNumber(refs.tieSpacingConf.value, 0),
    tieSpacingMidMm: parsePreviewNumber(refs.tieSpacingMid.value, 0),
    coverToCenter: refs.coverToCenter.checked,
  };

  if (input.barDiaM <= 0 || input.tieDiaM <= 0 || input.coverM <= 0) return null;
  if (input.useDoubleLayer && input.layerSpacingM <= 0) return null;
  if (shape === "rect") {
    if (input.widthM <= 0 || input.heightM <= 0) return null;
  } else if (input.diameterM <= 0) {
    return null;
  }

  return input;
}

function barCenterEdgeM(input: Pick<SectionPreviewInput, "coverM" | "tieDiaM" | "barDiaM" | "coverToCenter">): number {
  return input.coverToCenter ? input.coverM : input.coverM + input.tieDiaM + 0.5 * input.barDiaM;
}

function buildRectBarLayer(widthM: number, heightM: number, edgeM: number, barsX: number, barsY: number, layerIndex: number): RectBarLayerLayout | null {
  if (barsX < 2 || barsY < 2) return null;
  const hw = 0.5 * widthM;
  const hh = 0.5 * heightM;
  const xLeft = -hw + edgeM;
  const xRight = hw - edgeM;
  const yBot = -hh + edgeM;
  const yTop = hh - edgeM;
  if (xLeft >= xRight || yBot >= yTop) return null;

  const sxM = barsX > 1 ? (xRight - xLeft) / (barsX - 1) : 0;
  const syM = barsY > 1 ? (yTop - yBot) / (barsY - 1) : 0;
  const bars: XY[] = [];

  for (let i = 0; i < barsX; i++) {
    const x = xLeft + i * sxM;
    bars.push({ x, y: yTop });
    bars.push({ x, y: yBot });
  }
  for (let j = 1; j < barsY - 1; j++) {
    const y = yBot + j * syM;
    bars.push({ x: xLeft, y });
    bars.push({ x: xRight, y });
  }

  return { layerIndex, edgeM, barsX, barsY, xLeft, xRight, yBot, yTop, sxM, syM, bars };
}

function buildCircleBarLayer(diameterM: number, edgeM: number, barCount: number, layerIndex: number): CircleBarLayerLayout | null {
  if (barCount < 3) return null;
  const radiusM = 0.5 * diameterM - edgeM;
  if (radiusM <= 0) return null;
  const sArcM = (2 * Math.PI * radiusM) / barCount;
  const bars: XY[] = [];
  for (let i = 0; i < barCount; i++) {
    const angle = (2 * Math.PI * i) / barCount;
    bars.push({ x: radiusM * Math.cos(angle), y: radiusM * Math.sin(angle) });
  }
  return { layerIndex, edgeM, barCount, radiusM, sArcM, bars };
}

function calcMinPairCenterMm(bars: XY[]): number {
  if (bars.length < 2) return Number.POSITIVE_INFINITY;
  let minDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < bars.length; i++) {
    for (let j = i + 1; j < bars.length; j++) {
      const dx = bars[i].x - bars[j].x;
      const dy = bars[i].y - bars[j].y;
      const distMm = Math.sqrt(dx * dx + dy * dy) * 1000.0;
      if (distMm < minDist) minDist = distMm;
    }
  }
  return minDist;
}

function buildSectionRebarLayout(input: SectionPreviewInput): SectionRebarLayout | null {
  const outerEdgeM = barCenterEdgeM(input);
  const spacingCenterMm: number[] = [];
  const rectLayers: RectBarLayerLayout[] = [];
  const circleLayers: CircleBarLayerLayout[] = [];

  if (input.shape === "rect") {
    const outer = buildRectBarLayer(input.widthM, input.heightM, outerEdgeM, input.barsX, input.barsY, 1);
    if (!outer) return null;
    rectLayers.push(outer);
    if (Number.isFinite(outer.sxM) && outer.sxM > 0) spacingCenterMm.push(outer.sxM * 1000.0);
    if (Number.isFinite(outer.syM) && outer.syM > 0) spacingCenterMm.push(outer.syM * 1000.0);

    if (input.useDoubleLayer) {
      const inner = buildRectBarLayer(input.widthM, input.heightM, outerEdgeM + input.layerSpacingM, input.barsX2, input.barsY2, 2);
      if (!inner) return null;
      rectLayers.push(inner);
      if (Number.isFinite(inner.sxM) && inner.sxM > 0) spacingCenterMm.push(inner.sxM * 1000.0);
      if (Number.isFinite(inner.syM) && inner.syM > 0) spacingCenterMm.push(inner.syM * 1000.0);
      spacingCenterMm.push(input.layerSpacingM * 1000.0);
    }
  } else {
    const outer = buildCircleBarLayer(input.diameterM, outerEdgeM, input.bars, 1);
    if (!outer) return null;
    circleLayers.push(outer);
    if (Number.isFinite(outer.sArcM) && outer.sArcM > 0) spacingCenterMm.push(outer.sArcM * 1000.0);

    if (input.useDoubleLayer) {
      const inner = buildCircleBarLayer(input.diameterM, outerEdgeM + input.layerSpacingM, input.bars2, 2);
      if (!inner) return null;
      circleLayers.push(inner);
      if (Number.isFinite(inner.sArcM) && inner.sArcM > 0) spacingCenterMm.push(inner.sArcM * 1000.0);
      spacingCenterMm.push(input.layerSpacingM * 1000.0);
    }
  }

  const bars = rectLayers.flatMap((layer) => layer.bars).concat(circleLayers.flatMap((layer) => layer.bars));
  return {
    bars,
    rectLayers,
    circleLayers,
    spacingCenterMm,
    minPairCenterMm: calcMinPairCenterMm(bars),
  };
}

function sectionPreviewInputFromAppInput(input: AppInput): SectionPreviewInput {
  return {
    shape: input.shape,
    widthM: input.widthM,
    heightM: input.heightM,
    diameterM: input.diameterM,
    barsX: input.barsX,
    barsY: input.barsY,
    bars: input.bars,
    useDoubleLayer: input.useDoubleLayer,
    barsX2: input.barsX2,
    barsY2: input.barsY2,
    bars2: input.bars2,
    layerSpacingM: input.layerSpacingMm / 1000.0,
    coverM: input.coverM,
    tieDiaM: input.tieDiaMm / 1000.0,
    barDiaM: input.barDiaMm / 1000.0,
    tieSpacingConfMm: input.tieSpacingConfMm,
    tieSpacingMidMm: input.tieSpacingMidMm,
    coverToCenter: input.coverToCenter,
  };
}

function previewMmText(valueMm: number, decimals = 0): string {
  return `${fmt(valueMm, decimals)} mm`;
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ux: number,
  uy: number,
  size = 6
): void {
  const px = -uy;
  const py = ux;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - ux * size + px * size * 0.45, y - uy * size + py * size * 0.45);
  ctx.lineTo(x - ux * size - px * size * 0.45, y - uy * size - py * size * 0.45);
  ctx.closePath();
  ctx.fill();
}

function drawDimHorizontal(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  yRef: number,
  yDim: number,
  text: string,
  color: string
): void {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(left, yRef);
  ctx.lineTo(left, yDim);
  ctx.moveTo(right, yRef);
  ctx.lineTo(right, yDim);
  ctx.moveTo(left, yDim);
  ctx.lineTo(right, yDim);
  ctx.stroke();
  drawArrowHead(ctx, left + 0.5, yDim, 1, 0, 6);
  drawArrowHead(ctx, right - 0.5, yDim, -1, 0, 6);
  ctx.font = "11px 'IBM Plex Mono'";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, (left + right) * 0.5, yDim - 4);
}

function drawDimVertical(
  ctx: CanvasRenderingContext2D,
  y1: number,
  y2: number,
  xRef: number,
  xDim: number,
  text: string,
  color: string
): void {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(xRef, top);
  ctx.lineTo(xDim, top);
  ctx.moveTo(xRef, bottom);
  ctx.lineTo(xDim, bottom);
  ctx.moveTo(xDim, top);
  ctx.lineTo(xDim, bottom);
  ctx.stroke();
  drawArrowHead(ctx, xDim, top + 0.5, 0, 1, 6);
  drawArrowHead(ctx, xDim, bottom - 0.5, 0, -1, 6);
  ctx.save();
  ctx.translate(xDim - 6, (top + bottom) * 0.5);
  ctx.rotate(-Math.PI * 0.5);
  ctx.font = "11px 'IBM Plex Mono'";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawLeader(
  ctx: CanvasRenderingContext2D,
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  text: string,
  color: string
): void {
  const xMid = xStart + (xEnd > xStart ? 18 : -18);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(xStart, yStart);
  ctx.lineTo(xMid, yStart);
  ctx.lineTo(xEnd, yEnd);
  ctx.stroke();
  drawArrowHead(ctx, xStart, yStart, xStart < xMid ? -1 : 1, 0, 5);
  ctx.font = "11px 'IBM Plex Mono'";
  ctx.textAlign = xEnd >= xMid ? "left" : "right";
  ctx.textBaseline = "middle";
  ctx.fillText(text, xEnd + (xEnd >= xMid ? 6 : -6), yEnd);
}

function drawHatchRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7;
  for (let t = -h; t <= w + h; t += 10) {
    ctx.beginPath();
    ctx.moveTo(x + t, y + h);
    ctx.lineTo(x + t + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHatchCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7;
  for (let t = -r * 2; t <= r * 2; t += 10) {
    ctx.beginPath();
    ctx.moveTo(cx - r + t, cy + r);
    ctx.lineTo(cx - r + t + r * 2, cy - r);
    ctx.stroke();
  }
  ctx.restore();
}

function renderSectionPreview(): void {
  const prepared = prepareCanvasContext(refs.sectionPreview);
  if (!prepared) return;
  const { ctx, w, h } = prepared;
  const pal = getPlotPalette();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  const input = collectSectionPreviewInput();
  if (!input) {
    refs.sectionPreviewMeta.textContent = state.lang === "en" ? "Invalid section parameters." : "Geçersiz kesit parametreleri.";
    return;
  }

  const tieCenterEdge = input.coverToCenter ? input.coverM - 0.5 * input.barDiaM : input.coverM + 0.5 * input.tieDiaM;
  const rebarLayout = buildSectionRebarLayout(input);
  if (!rebarLayout) {
    refs.sectionPreviewMeta.textContent = state.lang === "en" ? "Double-layer bar geometry is invalid." : "Çift sıra donatı geometrisi geçersiz.";
    return;
  }
  const bars = rebarLayout.bars;
  const noteLeft = w - 188;
  const plotLeft = 34;
  const plotRight = noteLeft - 18;
  const plotTop = 20;
  const plotBottom = h - 18;
  const maxX = input.shape === "rect" ? 0.5 * input.widthM : 0.5 * input.diameterM;
  const maxY = input.shape === "rect" ? 0.5 * input.heightM : 0.5 * input.diameterM;
  const scale = 0.72 * Math.min((plotRight - plotLeft) / (2 * maxX || 1), (plotBottom - plotTop) / (2 * maxY || 1));
  const cx = (plotLeft + plotRight) * 0.5;
  const cy = (plotTop + plotBottom) * 0.52;
  const sx = (x: number): number => cx + x * scale;
  const sy = (y: number): number => cy - y * scale;
  const techLine = state.theme === "light" ? "#2f4755" : "#a8c8d6";
  const techFine = state.theme === "light" ? "rgba(47,71,85,0.34)" : "rgba(168,200,214,0.34)";
  const hatchColor = state.theme === "light" ? "rgba(49,78,92,0.18)" : "rgba(164,198,212,0.17)";
  const noteFill = state.theme === "light" ? "rgba(248, 252, 255, 0.85)" : "rgba(7, 18, 27, 0.70)";

  ctx.strokeStyle = techFine;
  ctx.lineWidth = 0.9;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(plotLeft, cy);
  ctx.lineTo(plotRight, cy);
  ctx.moveTo(cx, plotTop);
  ctx.lineTo(cx, plotBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  if (input.shape === "rect") {
    const hw = 0.5 * input.widthM;
    const hh = 0.5 * input.heightM;
    const xL = sx(-hw);
    const yT = sy(hh);
    const widthPx = 2 * hw * scale;
    const heightPx = 2 * hh * scale;
    ctx.fillStyle = state.theme === "light" ? "rgba(232, 241, 246, 0.92)" : "rgba(10, 25, 36, 0.92)";
    ctx.strokeStyle = techLine;
    ctx.lineWidth = 1.4;
    ctx.fillRect(xL, yT, widthPx, heightPx);
    drawHatchRect(ctx, xL, yT, widthPx, heightPx, hatchColor);
    ctx.strokeRect(xL, yT, widthPx, heightPx);

    const chw = hw - tieCenterEdge;
    const chh = hh - tieCenterEdge;
    if (chw > 0 && chh > 0) {
      ctx.strokeStyle = techLine;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sx(-chw), sy(chh), 2 * chw * scale, 2 * chh * scale);
    }

    drawDimHorizontal(ctx, sx(-hw), sx(hw), sy(-hh), sy(-hh) + 26, `b=${previewMmText(input.widthM * 1000, 0)}`, techLine);
    drawDimVertical(ctx, sy(hh), sy(-hh), sx(-hw), sx(-hw) - 24, `h=${previewMmText(input.heightM * 1000, 0)}`, techLine);

    const outerLayer = rebarLayout.rectLayers[0];

    if (chw > 0 && chh > 0) {
      drawLeader(
        ctx,
        sx(-chw),
        sy(chh),
        xL - 74,
        Math.max(plotTop + 14, yT - 22),
        `c=${previewMmText(input.coverM * 1000, 0)}`,
        techLine
      );
    }

    if (outerLayer && outerLayer.barsX > 1) {
      const topBars = outerLayer.bars
        .filter((b) => Math.abs(b.y - outerLayer.yTop) < 1e-9)
        .sort((a, b) => a.x - b.x);
      if (topBars.length > 1) {
        const sVal = (topBars[1].x - topBars[0].x) * 1000;
        const midX = sx((topBars[0].x + topBars[1].x) * 0.5);
        const barY = sy(topBars[0].y);
        drawLeader(
          ctx,
          midX,
          barY - 1,
          xL + widthPx + 48,
          Math.max(plotTop + 8, yT - 36),
          `sx=${previewMmText(sVal, 1)}`,
          techLine
        );
      }
    }
    if (outerLayer && outerLayer.barsY > 2) {
      const rightBars = outerLayer.bars
        .filter((b) => Math.abs(b.x - outerLayer.xRight) < 1e-9)
        .sort((a, b) => a.y - b.y);
      if (rightBars.length > 1) {
        const sVal = (rightBars[1].y - rightBars[0].y) * 1000;
        const midY = sy((rightBars[0].y + rightBars[1].y) * 0.5);
        drawLeader(
          ctx,
          sx(rightBars[0].x) + 1,
          midY,
          xL + widthPx + 64,
          midY + 26,
          `sy=${previewMmText(sVal, 1)}`,
          techLine
        );
      }
    }
    if (rebarLayout.rectLayers.length > 1) {
      const innerLayer = rebarLayout.rectLayers[1];
      drawLeader(
        ctx,
        sx((outerLayer.xLeft + innerLayer.xLeft) * 0.5),
        sy((outerLayer.yTop + innerLayer.yTop) * 0.5),
        xL + widthPx + 52,
        Math.min(plotBottom - 14, yT + heightPx * 0.28),
        `a_row=${previewMmText(input.layerSpacingM * 1000.0, 0)}`,
        techLine
      );
    }
  } else {
    const r = 0.5 * input.diameterM;
    ctx.fillStyle = state.theme === "light" ? "rgba(232, 241, 246, 0.92)" : "rgba(10, 25, 36, 0.92)";
    ctx.strokeStyle = techLine;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
    ctx.fill();
    drawHatchCircle(ctx, cx, cy, r * scale, hatchColor);
    ctx.stroke();

    const outerRing = rebarLayout.circleLayers[0];
    const rc = r - tieCenterEdge;
    if (rc > 0) {
      ctx.strokeStyle = techLine;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rc * scale, 0, Math.PI * 2);
      ctx.stroke();
      drawLeader(ctx, cx - rc * scale, cy, cx - rc * scale - 36, cy - 28, `c=${previewMmText(input.coverM * 1000, 0)}`, techLine);
    }

    drawDimHorizontal(ctx, cx - r * scale, cx + r * scale, cy + r * scale, cy + r * scale + 24, `D=${previewMmText(input.diameterM * 1000, 0)}`, techLine);
    if (rebarLayout.circleLayers.length > 1 && outerRing) {
      const innerRing = rebarLayout.circleLayers[1];
      drawLeader(
        ctx,
        cx - (outerRing.radiusM + innerRing.radiusM) * 0.5 * scale,
        cy,
        cx - r * scale - 52,
        cy + 24,
        `a_row=${previewMmText(input.layerSpacingM * 1000.0, 0)}`,
        techLine
      );
    }
  }

  const barR = Math.max(2.2, 0.5 * input.barDiaM * scale);
  for (const b of bars) {
    ctx.fillStyle = state.theme === "light" ? "#1f2f3b" : "#0e1620";
    ctx.strokeStyle = state.theme === "light" ? "#0d1922" : "#d8e7ef";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(sx(b.x), sy(b.y), barR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  const noteTop = plotTop + 8;
  const noteWidth = w - noteLeft - 10;
  const noteLines = [
    `n = ${bars.length}`,
    `Øboy = ${previewMmText(input.barDiaM * 1000, 0)}`,
    `Øetr = ${previewMmText(input.tieDiaM * 1000, 0)}`,
    input.shape === "rect"
      ? `L1: ${input.barsX}/${input.barsY}${input.useDoubleLayer ? `, L2: ${input.barsX2}/${input.barsY2}` : ""}`
      : `L1: ${input.bars}${input.useDoubleLayer ? `, L2: ${input.bars2}` : ""}`,
    `s_conf = ${previewMmText(input.tieSpacingConfMm, 0)}`,
    `s_mid = ${previewMmText(input.tieSpacingMidMm, 0)}`,
  ];
  if (input.useDoubleLayer) noteLines.splice(4, 0, `a_row = ${previewMmText(input.layerSpacingM * 1000, 0)}`);
  ctx.fillStyle = noteFill;
  ctx.strokeStyle = techFine;
  ctx.lineWidth = 1;
  const noteHeight = 18 + noteLines.length * 18;
  ctx.fillRect(noteLeft, noteTop, noteWidth, noteHeight);
  ctx.strokeRect(noteLeft, noteTop, noteWidth, noteHeight);
  ctx.fillStyle = techLine;
  ctx.font = "11px 'IBM Plex Mono'";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let i = 0; i < noteLines.length; i++) {
    ctx.fillText(noteLines[i], noteLeft + 10, noteTop + 16 + i * 18);
  }

  const area = input.shape === "rect"
    ? input.widthM * input.heightM
    : Math.PI * Math.pow(0.5 * input.diameterM, 2);
  const barArea = Math.PI * input.barDiaM * input.barDiaM / 4;
  const rhoPct = area > 0 ? (bars.length * barArea / area) * 100 : 0;
  refs.sectionPreviewMeta.textContent = state.lang === "en"
    ? `${bars.length} bars | rho_t = ${fmt(rhoPct, 2)}%`
    : `${bars.length} adet bar | rho_t = %${fmt(rhoPct, 2)}`;
}

function formatDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function emptyLoadSheetRow(name = ""): LoadSheetRow {
  return { name, pu: "", mux: "", muy: "" };
}

function normalizeNumberToken(raw: string): string {
  const compact = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (compact.length === 0) return "";
  const num = Number(compact);
  if (!Number.isFinite(num)) return compact;
  return toCsvNumber(num);
}

function splitLoadLine(line: string): string[] {
  if (line.includes("\t")) return line.split("\t");
  if (line.includes(";")) return line.split(";");
  return line.split(",");
}

function isLoadRowBlank(row: LoadSheetRow): boolean {
  return row.name.trim() === "" && row.pu.trim() === "" && row.mux.trim() === "" && row.muy.trim() === "";
}

function addLoadSheetRows(count: number): void {
  const safeCount = Math.max(1, Math.round(count));
  for (let i = 0; i < safeCount; i++) {
    state.loadSheet.push(emptyLoadSheetRow(`L${state.loadSheet.length + 1}`));
  }
}

function cleanupEmptyLoadRows(): void {
  state.loadSheet = state.loadSheet.filter((row) => !isLoadRowBlank(row));
  if (state.loadSheet.length === 0) state.loadSheet = [emptyLoadSheetRow("L1")];
  state.selectedLoadRows.clear();
  state.loadSelectionAnchor = { row: 0, col: "name" };
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, state.loadSelectionAnchor);
  state.activeLoadCell = { row: 0, col: "name" };
  refreshLoadSheetValidation(false);
}

function deleteSelectedLoadRows(): void {
  if (state.selectedLoadRows.size === 0 && state.selectedLoadRange) {
    for (let r = state.selectedLoadRange.rowStart; r <= state.selectedLoadRange.rowEnd; r++) {
      state.selectedLoadRows.add(r);
    }
  }
  if (state.selectedLoadRows.size === 0 && state.activeLoadCell) {
    state.selectedLoadRows.add(state.activeLoadCell.row);
  }
  if (state.selectedLoadRows.size === 0) return;
  state.loadSheet = state.loadSheet.filter((_, idx) => !state.selectedLoadRows.has(idx));
  if (state.loadSheet.length === 0) state.loadSheet = [emptyLoadSheetRow("L1")];
  state.selectedLoadRows.clear();
  state.selectedLoadRange = null;
  state.loadSelectionAnchor = null;
  state.activeLoadCell = { row: 0, col: "name" };
  refreshLoadSheetValidation(false);
}

function syncLoadsTextareaFromSheet(): void {
  const lines = state.loadSheet
    .filter((row) => !isLoadRowBlank(row))
    .map((row, idx) => {
      const name = row.name.trim() || `L${idx + 1}`;
      return `${name},${normalizeNumberToken(row.pu)},${normalizeNumberToken(row.mux)},${normalizeNumberToken(row.muy)}`;
    });
  refs.loadsText.value = lines.join("\n");
}

function parseLoadSheetFromTextarea(raw: string): LoadSheetRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return [emptyLoadSheetRow("L1")];
  const parsed: LoadSheetRow[] = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = splitLoadLine(lines[i]).map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) {
      throw new Error(state.lang === "en"
        ? `Invalid load row ${i + 1}: ${lines[i]}`
        : `Geçersiz yük satırı ${i + 1}: ${lines[i]}`);
    }
    const hasName = parts.length === 4;
    parsed.push({
      name: hasName ? (parts[0] || `L${i + 1}`) : `L${i + 1}`,
      pu: normalizeNumberToken(parts[hasName ? 1 : 0]),
      mux: normalizeNumberToken(parts[hasName ? 2 : 1]),
      muy: normalizeNumberToken(parts[hasName ? 3 : 2]),
    });
  }
  return parsed;
}

function getLoadCellIssueKey(row: number, col: LoadSheetCol): string {
  return `${row}:${col}`;
}

function loadColIndex(col: LoadSheetCol): number {
  return LOAD_SHEET_COLS.indexOf(col);
}

function loadColByIndex(index: number): LoadSheetCol {
  const safe = Math.max(0, Math.min(LOAD_SHEET_COLS.length - 1, index));
  return LOAD_SHEET_COLS[safe];
}

function normalizeLoadCellRange(range: LoadCellRange): LoadCellRange {
  return {
    rowStart: Math.min(range.rowStart, range.rowEnd),
    rowEnd: Math.max(range.rowStart, range.rowEnd),
    colStart: Math.min(range.colStart, range.colEnd),
    colEnd: Math.max(range.colStart, range.colEnd),
  };
}

function makeLoadCellRange(
  from: { row: number; col: LoadSheetCol },
  to: { row: number; col: LoadSheetCol }
): LoadCellRange {
  return normalizeLoadCellRange({
    rowStart: from.row,
    rowEnd: to.row,
    colStart: loadColIndex(from.col),
    colEnd: loadColIndex(to.col),
  });
}

function isCellInLoadRange(row: number, col: LoadSheetCol, range: LoadCellRange | null): boolean {
  if (!range) return false;
  const c = loadColIndex(col);
  return row >= range.rowStart && row <= range.rowEnd && c >= range.colStart && c <= range.colEnd;
}

function updateLoadRangeSelectionClasses(): void {
  const inputs = refs.loadSheetBody.querySelectorAll<HTMLInputElement>(".load-cell");
  for (const input of inputs) {
    const row = Number(input.dataset.row);
    const col = input.dataset.col as LoadSheetCol;
    input.classList.toggle("selected-cell", isCellInLoadRange(row, col, state.selectedLoadRange));
  }
}

function setLoadActiveCell(
  row: number,
  col: LoadSheetCol,
  mode: "reset" | "extend" = "reset"
): void {
  const safeRow = Math.max(0, Math.min(state.loadSheet.length - 1, row));
  state.activeLoadCell = { row: safeRow, col };
  if (mode === "reset" || !state.loadSelectionAnchor) {
    state.loadSelectionAnchor = { row: safeRow, col };
    state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, state.loadSelectionAnchor);
  } else {
    state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, { row: safeRow, col });
  }
  updateLoadRangeSelectionClasses();
}

function refreshLoadSheetValidation(writeStatus: boolean): number {
  const { issues } = validateLoadSheetRows(state.loadSheet);
  state.loadIssues = issues;
  const issueSet = new Set(issues.map((issue) => getLoadCellIssueKey(issue.row, issue.col)));
  const cells = refs.loadSheetBody.querySelectorAll<HTMLInputElement>(".load-cell");
  for (const cell of cells) {
    const row = Number(cell.dataset.row);
    const col = cell.dataset.col as LoadSheetCol;
    cell.classList.toggle("invalid", issueSet.has(getLoadCellIssueKey(row, col)));
  }
  if (writeStatus && issues.length > 0) {
    const issueText = issues
      .slice(0, 3)
      .map((issue) => `R${issue.row + 1}/${issue.col.toUpperCase()}`)
      .join(", ");
    setStatus(`${tx("statusLoadSheetInvalid")} [${issueText}]`, "danger");
  }
  return issues.length;
}

function renderLoadSheetGrid(): void {
  const issueSet = new Set(state.loadIssues.map((issue) => getLoadCellIssueKey(issue.row, issue.col)));
  const bodyHtml = state.loadSheet
    .map((row, index) => {
      const checked = state.selectedLoadRows.has(index) ? "checked" : "";
      const makeCell = (col: LoadSheetCol): string => {
        const value = row[col] ?? "";
        const invalidClass = issueSet.has(getLoadCellIssueKey(index, col)) ? " invalid" : "";
        const selectedClass = isCellInLoadRange(index, col, state.selectedLoadRange) ? " selected-cell" : "";
        const inputMode = col === "name" ? "text" : "decimal";
        return `<td>
          <input class="load-cell${invalidClass}${selectedClass}"
            data-row="${index}"
            data-col="${col}"
            inputmode="${inputMode}"
            value="${escapeHtml(value)}" />
        </td>`;
      };
      return `<tr data-row="${index}">
        <td class="load-select-cell">
          <input type="checkbox" class="load-row-select" data-row="${index}" ${checked} />
          <span class="load-row-id">${index + 1}</span>
        </td>
        ${makeCell("name")}
        ${makeCell("pu")}
        ${makeCell("mux")}
        ${makeCell("muy")}
      </tr>`;
    })
    .join("");
  refs.loadSheetBody.innerHTML = bodyHtml;
  refreshLoadSheetValidation(false);
  updateLoadRangeSelectionClasses();
}

function updateLoadSheetCell(rowIdx: number, col: LoadSheetCol, value: string): void {
  if (rowIdx < 0 || rowIdx >= state.loadSheet.length) return;
  state.loadSheet[rowIdx][col] = value;
}

function focusLoadCell(rowIdx: number, col: LoadSheetCol): void {
  while (rowIdx >= state.loadSheet.length) addLoadSheetRows(1);
  const target = refs.loadSheetBody.querySelector<HTMLInputElement>(`.load-cell[data-row="${rowIdx}"][data-col="${col}"]`);
  if (!target) {
    renderLoadSheetGrid();
    const retried = refs.loadSheetBody.querySelector<HTMLInputElement>(`.load-cell[data-row="${rowIdx}"][data-col="${col}"]`);
    if (retried) {
      retried.focus();
      retried.select();
    }
    return;
  }
  target.focus();
  target.select();
}

function onLoadGridInput(event: Event): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col)) return;
  updateLoadSheetCell(row, col, target.value);
  state.activeLoadCell = { row, col };
  syncLoadsTextareaFromSheet();
  refreshLoadSheetValidation(false);
}

function onLoadGridFocusIn(event: FocusEvent): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col)) return;
  if (state.loadMouseSelecting) return;
  setLoadActiveCell(row, col, "reset");
}

function onLoadGridChange(event: Event): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.classList.contains("load-row-select")) {
    const row = Number(target.dataset.row);
    if (!Number.isFinite(row)) return;
    if (target.checked) state.selectedLoadRows.add(row);
    else state.selectedLoadRows.delete(row);
    state.selectedLoadRange = null;
    updateLoadRangeSelectionClasses();
    return;
  }
  if (!target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col)) return;
  const normalized = isNumericLoadCol(col) ? normalizeNumberToken(target.value) : target.value.trim();
  target.value = normalized;
  updateLoadSheetCell(row, col, normalized);
  setLoadActiveCell(row, col, "reset");
  syncLoadsTextareaFromSheet();
  refreshLoadSheetValidation(false);
}

function onLoadGridKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col)) return;

  const colIdx = LOAD_SHEET_COLS.indexOf(col);
  let nextRow = row;
  let nextCol = colIdx;
  let handled = true;
  let selectMode: "reset" | "extend" = "reset";

  switch (event.key) {
    case "Tab":
      nextCol += event.shiftKey ? -1 : 1;
      if (nextCol > LOAD_SHEET_COLS.length - 1) {
        nextCol = 0;
        nextRow += 1;
      } else if (nextCol < 0) {
        nextCol = LOAD_SHEET_COLS.length - 1;
        nextRow = Math.max(0, nextRow - 1);
      }
      break;
    case "Enter":
      nextRow += 1;
      break;
    case "ArrowRight":
      nextCol = Math.min(LOAD_SHEET_COLS.length - 1, colIdx + 1);
      if (event.shiftKey) selectMode = "extend";
      break;
    case "ArrowLeft":
      nextCol = Math.max(0, colIdx - 1);
      if (event.shiftKey) selectMode = "extend";
      break;
    case "ArrowDown":
      nextRow = row + 1;
      if (event.shiftKey) selectMode = "extend";
      break;
    case "ArrowUp":
      nextRow = Math.max(0, row - 1);
      if (event.shiftKey) selectMode = "extend";
      break;
    default:
      handled = false;
  }

  if (!handled) return;
  event.preventDefault();
  if (nextRow >= state.loadSheet.length) {
    addLoadSheetRows(nextRow - state.loadSheet.length + 1);
    renderLoadSheetGrid();
  }
  const nextColKey = LOAD_SHEET_COLS[nextCol];
  setLoadActiveCell(nextRow, nextColKey, selectMode);
  focusLoadCell(nextRow, nextColKey);
}

function onLoadGridPaste(event: ClipboardEvent): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const text = event.clipboardData?.getData("text/plain");
  if (!text) return;
  if (!text.includes("\n") && !text.includes("\t")) return;

  const startRow = Number(target.dataset.row);
  const startCol = target.dataset.col as LoadSheetCol;
  const startColIdx = LOAD_SHEET_COLS.indexOf(startCol);
  if (!Number.isFinite(startRow) || startColIdx < 0) return;

  event.preventDefault();
  const rows = text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.length > 0);
  let maxColsPasted = 1;

  for (let r = 0; r < rows.length; r++) {
    const rowIdx = startRow + r;
    while (rowIdx >= state.loadSheet.length) addLoadSheetRows(1);
    const cells = rows[r].includes("\t") ? rows[r].split("\t") : splitLoadLine(rows[r]);
    maxColsPasted = Math.max(maxColsPasted, cells.length);
    for (let c = 0; c < cells.length; c++) {
      const colIdx = startColIdx + c;
      if (colIdx > LOAD_SHEET_COLS.length - 1) break;
      const col = LOAD_SHEET_COLS[colIdx];
      const raw = cells[c].trim();
      const normalized = isNumericLoadCol(col) ? normalizeNumberToken(raw) : raw;
      updateLoadSheetCell(rowIdx, col, normalized);
    }
  }

  const endRow = Math.min(state.loadSheet.length - 1, startRow + rows.length - 1);
  const endCol = loadColByIndex(startColIdx + maxColsPasted - 1);
  state.loadSelectionAnchor = { row: startRow, col: startCol };
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, { row: endRow, col: endCol });
  state.activeLoadCell = { row: endRow, col: endCol };
  renderLoadSheetGrid();
  syncLoadsTextareaFromSheet();
}

function onLoadGridMouseDown(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col)) return;
  event.preventDefault();
  state.loadMouseSelecting = true;
  if (event.shiftKey && state.loadSelectionAnchor) {
    state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, { row, col });
    state.activeLoadCell = { row, col };
    updateLoadRangeSelectionClasses();
  } else {
    setLoadActiveCell(row, col, "reset");
  }
  target.focus();
}

function onLoadGridMouseOver(event: MouseEvent): void {
  if (!state.loadMouseSelecting) return;
  const target = event.target as HTMLElement | null;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("load-cell")) return;
  const row = Number(target.dataset.row);
  const col = target.dataset.col as LoadSheetCol;
  if (!Number.isFinite(row) || !LOAD_SHEET_COLS.includes(col) || !state.loadSelectionAnchor) return;
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, { row, col });
  state.activeLoadCell = { row, col };
  updateLoadRangeSelectionClasses();
}

function onLoadGridMouseUp(): void {
  state.loadMouseSelecting = false;
}

function applyTextareaToLoadSheet(): void {
  const rows = parseLoadSheetFromTextarea(refs.loadsText.value);
  state.loadSheet = rows;
  state.selectedLoadRows.clear();
  state.loadSelectionAnchor = { row: 0, col: "name" };
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, state.loadSelectionAnchor);
  state.activeLoadCell = { row: 0, col: "name" };
  renderLoadSheetGrid();
  syncLoadsTextareaFromSheet();
  setStatus(tx("statusLoadSheetTextApplied"), "info");
}

async function importCsvToLoadSheet(): Promise<void> {
  const file = refs.loadsFile.files?.[0];
  if (!file) return;
  const parsed = await parseLoadsCsvFile(file);
  if (parsed.length === 0) return;
  for (const row of parsed) {
    state.loadSheet.push({
      name: row.name,
      pu: toCsvNumber(row.pu),
      mux: toCsvNumber(row.mux),
      muy: toCsvNumber(row.muy),
    });
  }
  refs.loadsFile.value = "";
  if (!state.loadSelectionAnchor) {
    state.loadSelectionAnchor = { row: 0, col: "name" };
  }
  renderLoadSheetGrid();
  syncLoadsTextareaFromSheet();
  setStatus(`${tx("statusLoadSheetImported")} (+${parsed.length})`, "info");
}

async function copyLoadSheetSelection(): Promise<void> {
  const range = state.selectedLoadRange ? normalizeLoadCellRange(state.selectedLoadRange) : null;
  if (range) {
    const lines: string[] = [];
    for (let r = range.rowStart; r <= range.rowEnd; r++) {
      const row = state.loadSheet[r];
      const rowValues: string[] = [];
      for (let c = range.colStart; c <= range.colEnd; c++) {
        const col = loadColByIndex(c);
        const raw = row?.[col] ?? "";
        rowValues.push(isNumericLoadCol(col) ? normalizeNumberToken(raw) : raw.trim());
      }
      lines.push(rowValues.join("\t"));
    }
    const notAllEmpty = lines.some((line) => line.replace(/\t/g, "").trim().length > 0);
    if (notAllEmpty) {
      await writeClipboardText(lines.join("\n"));
      setStatus(tx("statusLoadSheetCopied"), "info");
      return;
    }
  }

  const selected = Array.from(state.selectedLoadRows.values()).sort((a, b) => a - b);
  const rowsToCopy: LoadSheetRow[] = [];
  if (selected.length > 0) {
    for (const idx of selected) {
      if (idx >= 0 && idx < state.loadSheet.length && !isLoadRowBlank(state.loadSheet[idx])) {
        rowsToCopy.push(state.loadSheet[idx]);
      }
    }
  } else if (state.activeLoadCell && state.activeLoadCell.row < state.loadSheet.length) {
    const row = state.loadSheet[state.activeLoadCell.row];
    if (!isLoadRowBlank(row)) rowsToCopy.push(row);
  } else {
    rowsToCopy.push(...state.loadSheet.filter((row) => !isLoadRowBlank(row)));
  }

  if (rowsToCopy.length === 0) {
    setStatus(tx("statusLoadSheetCopyEmpty"), "danger");
    return;
  }

  const text = rowsToCopy
    .map((row) => [row.name.trim(), normalizeNumberToken(row.pu), normalizeNumberToken(row.mux), normalizeNumberToken(row.muy)].join("\t"))
    .join("\n");
  await writeClipboardText(text);
  setStatus(tx("statusLoadSheetCopied"), "info");
}

function validateLoadSheetRows(rows: LoadSheetRow[]): { loads: LoadCase[]; issues: LoadSheetValidationIssue[] } {
  const issues: LoadSheetValidationIssue[] = [];
  const loads: LoadCase[] = [];
  let nextAuto = 1;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (isLoadRowBlank(row)) continue;

    const name = row.name.trim() || `L${nextAuto++}`;
    const numValues: Record<"pu" | "mux" | "muy", number> = { pu: 0, mux: 0, muy: 0 };
    for (const col of NUMERIC_LOAD_COLS) {
      const raw = row[col].trim();
      if (raw.length === 0) {
        issues.push({
          row: i,
          col,
          message: state.lang === "en"
            ? `Row ${i + 1} ${col} is empty`
            : `Satır ${i + 1} ${col} boş`,
        });
        continue;
      }
      const parsed = Number(raw.replace(/\s+/g, "").replace(",", "."));
      if (!Number.isFinite(parsed)) {
        issues.push({
          row: i,
          col,
          message: state.lang === "en"
            ? `Row ${i + 1} ${col} is not a valid number`
            : `Satır ${i + 1} ${col} sayısal değil`,
        });
      } else {
        numValues[col] = parsed;
      }
    }

    if (!issues.some((issue) => issue.row === i)) {
      loads.push({
        name,
        pu: numValues.pu,
        mux: numValues.mux,
        muy: numValues.muy,
      });
    }
  }
  return { loads, issues };
}

function collectLoadsFromSheet(): LoadCase[] {
  const { loads, issues } = validateLoadSheetRows(state.loadSheet);
  state.loadIssues = issues;
  renderLoadSheetGrid();
  if (issues.length > 0) {
    refreshLoadSheetValidation(true);
    throw new Error(tx("statusLoadSheetInvalid"));
  }
  if (loads.length === 0) {
    throw new Error(state.lang === "en" ? "Enter at least one load case." : "En az bir yük girin.");
  }
  return loads;
}

async function runAnalysis(): Promise<void> {
  const wasm = state.wasm;
  if (!wasm) throw new Error(state.lang === "en" ? "WASM is not ready yet." : "WASM henuz hazir degil.");

  syncSectionFormToState();
  setStatus(tx("statusPmmCalculating"), "info");

  const loads = collectLoadsFromSheet();
  const sec = state.sections[state.activeSectionIdx];
  const input = collectInputForSection(sec, loads);
  state.lastInput = input;
  refs.rhoDisplay.textContent = reinforcementRatioText(input);

  const ok = configureWasm(wasm, input);
  if (ok !== 1) throw new Error(state.lang === "en" ? "Invalid section or material parameters." : "Kesit veya malzeme parametreleri gecersiz.");

  setStatus(`${tx("statusEvaluatingPrefix")} (${loads.length})...`, "info");
  const results: ResultRow[] = [];
  for (const load of loads) {
    wasm.evaluateLoad(load.pu, load.mux, load.muy);
    const dcr = wasm.getLastDcr();
    results.push({
      ...load,
      pcap: wasm.getLastPcap(),
      mxcap: wasm.getLastMxcap(),
      mycap: wasm.getLastMycap(),
      scale: wasm.getLastScale(),
      dcr,
      ok: wasm.getLastOk() === 1,
    });
  }

  const surface = readSurfacePointsFromWasm(wasm);
  const nominalSurface = buildNominalSurface(wasm, input);

  const compliance = evaluateCompliance(input);

  state.results = results;
  state.surface = surface;
  state.nominalSurface = nominalSurface;
  state.compliance = compliance;
  state.angleCount = input.nAngle;
  state.depthCount = input.nDepth;

  renderTable(results);
  renderPlot(surface, results);
  renderPlot3d(surface, results);
  render3dSliceTable(surface);
  renderCompliance(compliance);

  refs.exportResults.disabled = false;
  refs.exportSurface.disabled = false;
  refs.exportReport.disabled = false;
  refs.exportReportPdf.disabled = false;

  const maxDcr = Math.max(...results.map((r) => r.dcr));
  const failCount = compliance.filter((c) => c.status === "fail").length;
  const infoCount = compliance.filter((c) => c.status === "info").length;
  const sectionLabel = sec.name;
  const summaryBase = runSummaryText(input, maxDcr, failCount, infoCount);
  setStatus(`[${sectionLabel}] ${summaryBase}`, "info");
}

function collectInputForSection(sec: SectionDef, loads: LoadCase[]): AppInput {
  return {
    codeMode: refs.codeMode.value as CodeMode,
    concreteModel: refs.concreteModel.value as ConcreteModel,
    useExpectedStrength: refs.useExpectedStrength.checked,
    expectedFckFactor: n(refs.expectedFckFactor.value),
    expectedFykFactor: n(refs.expectedFykFactor.value),
    shape: sec.shape,
    widthM: n(sec.width),
    heightM: n(sec.height),
    diameterM: n(sec.diameter),
    barsX: ni(sec.barsX),
    barsY: ni(sec.barsY),
    bars: ni(sec.bars),
    useDoubleLayer: sec.useDoubleLayer,
    barsX2: ni(sec.barsX2),
    barsY2: ni(sec.barsY2),
    bars2: ni(sec.bars2),
    layerSpacingMm: n(sec.layerSpacing),
    coverM: n(sec.cover),
    tieDiaMm: n(sec.tieDia),
    barDiaMm: n(sec.barDia),
    tieSpacingConfMm: n(sec.tieSpacingConf),
    tieSpacingMidMm: n(sec.tieSpacingMid),
    coverToCenter: sec.coverToCenter,
    fck: n(refs.fck.value),
    fyk: n(refs.fyk.value),
    gammaC: n(refs.gammaC.value),
    gammaS: n(refs.gammaS.value),
    es: n(refs.es.value),
    epsCu: n(refs.epsCu.value),
    mesh: ni(refs.mesh.value),
    nAngle: ni(refs.nAngle.value),
    nDepth: ni(refs.nDepth.value),
    phiP: n(refs.phiP.value),
    phiM: n(refs.phiM.value),
    pCutoffRatio: n(refs.pCutoffRatio.value),
    pVisualScale: n(refs.pVisualScale.value),
    pSignMode: refs.pSign.value as PSignMode,
    loads,
  };
}

function calcLongitudinalRatioPct(input: AppInput): number {
  const barDiaM = input.barDiaMm / 1000.0;
  const layout = buildSectionRebarLayout(sectionPreviewInputFromAppInput(input));
  const nBars = layout ? layout.bars.length : 0;
  const areaM2 = input.shape === "rect"
    ? input.widthM * input.heightM
    : Math.PI * (input.diameterM * 0.5) * (input.diameterM * 0.5);
  if (areaM2 <= 0) return 0;
  const barAreaM2 = Math.PI * barDiaM * barDiaM / 4.0;
  return (nBars * barAreaM2 / areaM2) * 100.0;
}

interface DesignFactorOverride {
  phiP: number;
  phiM: number;
  pCutoffRatio: number;
}

function configureWasm(wasm: WasmExports, input: AppInput, designOverride?: DesignFactorOverride): number {
  const tieDiaM = input.tieDiaMm / 1000.0;
  const barDiaM = input.barDiaMm / 1000.0;
  const tieSpacingConfM = input.tieSpacingConfMm / 1000.0;
  const layerSpacingM = input.layerSpacingMm / 1000.0;
  const strengths = resolveDesignStrengths(input);
  const concreteModelId = input.concreteModel === "mander_core_cover" ? 1 : 0;
  const phiP = designOverride?.phiP ?? input.phiP;
  const phiM = designOverride?.phiM ?? input.phiM;
  const pCutoffRatio = designOverride?.pCutoffRatio ?? input.pCutoffRatio;
  wasm.setConcreteModel(concreteModelId, tieSpacingConfM);
  wasm.setDesignFactors(phiP, phiM, pCutoffRatio);

  if (input.shape === "rect") {
    return wasm.configureRect(
      input.widthM,
      input.heightM,
      input.coverM,
      tieDiaM,
      barDiaM,
      input.barsX,
      input.barsY,
      input.useDoubleLayer ? 1 : 0,
      input.barsX2,
      input.barsY2,
      layerSpacingM,
      input.coverToCenter ? 1 : 0,
      strengths.fckPmm,
      strengths.fykPmm,
      input.gammaC,
      input.gammaS,
      input.es,
      input.epsCu,
      input.mesh,
      input.nAngle,
      input.nDepth
    );
  }

  return wasm.configureCircle(
    input.diameterM,
    input.coverM,
    tieDiaM,
    barDiaM,
    input.bars,
    input.useDoubleLayer ? 1 : 0,
    input.bars2,
    layerSpacingM,
    input.coverToCenter ? 1 : 0,
    strengths.fckPmm,
    strengths.fykPmm,
    input.gammaC,
    input.gammaS,
    input.es,
    input.epsCu,
    input.mesh,
    input.nAngle,
    input.nDepth
  );
}
function evaluateCompliance(input: AppInput): ComplianceCheck[] {
  const out: ComplianceCheck[] = [];
  const strengths = resolveDesignStrengths(input);
  const rebarLayout = buildSectionRebarLayout(sectionPreviewInputFromAppInput(input));

  const barDiaM = input.barDiaMm / 1000.0;
  const coverNetMm = (
    input.coverToCenter
      ? input.coverM - input.tieDiaMm / 1000.0 - input.barDiaMm / 2000.0
      : input.coverM
  ) * 1000.0;
  const nBars = rebarLayout ? rebarLayout.bars.length : (
    input.shape === "rect"
      ? countRectPerimeterBars(input.barsX, input.barsY) + (input.useDoubleLayer ? countRectPerimeterBars(input.barsX2, input.barsY2) : 0)
      : input.bars + (input.useDoubleLayer ? input.bars2 : 0)
  );
  const areaM2 = input.shape === "rect"
    ? input.widthM * input.heightM
    : Math.PI * (input.diameterM * 0.5) * (input.diameterM * 0.5);

  const barAreaM2 = Math.PI * barDiaM * barDiaM / 4.0;
  const asTotalM2 = nBars * barAreaM2;
  const rho = asTotalM2 / areaM2;

  const minDimMm = input.shape === "rect"
    ? Math.min(input.widthM, input.heightM) * 1000.0
    : input.diameterM * 1000.0;

  const maxPu = Math.max(0, ...input.loads.map((l) => l.pu));
  const fcd = input.fck / input.gammaC;
  const fcdPmm = strengths.fckPmm / input.gammaC;
  const fydPmm = strengths.fykPmm / input.gammaS;

  const ndLimitTs500 = 0.9 * fcd * areaM2 * 1000.0;
  const ndLimitTBDY = 0.40 * input.fck * areaM2 * 1000.0;
  const topPoleNominal = (0.85 * fcdPmm * areaM2 + asTotalM2 * (fydPmm - 0.85 * fcdPmm)) * 1000.0;
  const pCutoffValue = input.phiP * input.pCutoffRatio * topPoleNominal;

  addCheck(
    out,
    "Design",
    "phi",
    "phiP araligi",
    input.phiP > 0 && input.phiP <= 1,
    `${fmt(input.phiP, 2)}`,
    "0 < phiP <= 1.00",
    "phi eksenel dayanima uygulanir"
  );

  addCheck(
    out,
    "Design",
    "phi",
    "phiM araligi",
    input.phiM > 0 && input.phiM <= 1,
    `${fmt(input.phiM, 2)}`,
    "0 < phiM <= 1.00",
    "phi egilme dayanimina uygulanir"
  );

  addCheck(
    out,
    "Design",
    "P-cutoff",
    "P cut-off katsayisi",
    input.pCutoffRatio > 0 && input.pCutoffRatio <= 1,
    `${fmt(input.pCutoffRatio, 2)}`,
    "0 < ratio <= 1.00",
    "Sikisma bolgesinde P tavanini belirler"
  );

  addInfo(
    out,
    "Design",
    "P-cutoff",
    "Uygulanan tasarim tavan eksenel kuvveti",
    `phiP*cutoff*P0 = ${fmt(input.phiP, 2)}*${fmt(input.pCutoffRatio, 2)}*${fmt(topPoleNominal, 1)} = ${fmt(pCutoffValue, 1)} kN`,
    "WASM tasarim yuzeyine uygulanir"
  );

  if (input.codeMode === "ts500_tbdy") {
    addCheck(
      out,
      "Design",
      "TBDY 2018 Tablo 5.1",
      "Beklenen dayanim katsayi araligi",
      input.expectedFckFactor >= 1.0 && input.expectedFckFactor <= 2.0 && input.expectedFykFactor >= 1.0 && input.expectedFykFactor <= 2.0,
      `fce/fck=${fmt(input.expectedFckFactor, 2)}, fye/fyk=${fmt(input.expectedFykFactor, 2)}`,
      "1.00 - 2.00 (onerilen 1.30 / 1.20)",
      "Sadece beklenen dayanim secenegi aktifken PMM kapasitesine uygulanir."
    );

    addInfo(
      out,
      "Design",
      "TBDY 2018 Tablo 5.1",
      "Beklenen dayanim uygulamasi",
      strengths.expectedApplied
        ? `AKTIF: fck_eff=${fmt(strengths.fckPmm, 1)} MPa, fyk_eff=${fmt(strengths.fykPmm, 1)} MPa`
        : "PASIF: PMM hesabinda karakteristik fck/fyk kullanildi.",
      "Beklenen dayanim secimi PMM kapasitesini etkiler"
    );
  }

  addInfo(
    out,
    "Design",
    "Malzeme modeli",
    "PMM beton modeli",
    input.concreteModel === "mander_core_cover"
      ? "Mander confined core + unconfined cover aktif. Bu, TS500/TBDY tasarim blok modeli degil; SAP2000 fiber modele daha yakindir."
      : "TS500 esdeger basinc blogu modeli aktif.",
    "Model secimi PMM kapasitesini etkiler"
  );

  if (input.codeMode === "aci318_19") {
    const tieDiaMin = input.barDiaMm > 32 ? 13.0 : 10.0;
    const tieSpacingLimitMm = Math.min(16.0 * input.barDiaMm, 48.0 * input.tieDiaMm, minDimMm);
    const agMinusAs = Math.max(0.0, areaM2 - asTotalM2);
    const poNom = (0.85 * input.fck * agMinusAs + input.fyk * asTotalM2) * 1000.0;
    const phiPoTiedCap = 0.80 * input.phiP * poNom;

    addCheck(
      out,
      "ACI 318-19",
      "22.4.2.1",
      "Boyuna donati orani",
      rho >= 0.01 && rho <= 0.08,
      `%${fmt(rho * 100, 2)}`,
      "1% - 8%",
      "Tied column icin tipik aralik"
    );

    addCheck(
      out,
      "ACI 318-19",
      "10.6.1.1",
      "Min boyuna donati adedi",
      input.shape === "rect" ? nBars >= 4 : nBars >= 6,
      `${nBars}`,
      input.shape === "rect" ? ">= 4" : ">= 6",
      "Dikdortgen >=4, dairesel >=6"
    );

    addCheck(
      out,
      "ACI 318-19",
      "25.7.2.2",
      "Enine donati min cap",
      input.tieDiaMm >= tieDiaMin,
      `${fmt(input.tieDiaMm, 1)} mm`,
      `>= ${fmt(tieDiaMin, 1)} mm`,
      "bar > 32 mm ise #4 (~13 mm), diger durumda #3 (~10 mm)"
    );

    addCheck(
      out,
      "ACI 318-19",
      "25.7.2.3",
      "Etriye araligi (s_conf)",
      input.tieSpacingConfMm <= tieSpacingLimitMm,
      `${fmt(input.tieSpacingConfMm, 1)} mm`,
      `<= ${fmt(tieSpacingLimitMm, 1)} mm`,
      "s <= min(16db, 48dtie, min kesit boyutu)"
    );

    addCheck(
      out,
      "ACI 318-19",
      "25.7.2.3",
      "Etriye araligi (s_mid)",
      input.tieSpacingMidMm <= tieSpacingLimitMm,
      `${fmt(input.tieSpacingMidMm, 1)} mm`,
      `<= ${fmt(tieSpacingLimitMm, 1)} mm`,
      "s <= min(16db, 48dtie, min kesit boyutu)"
    );

    addCheck(
      out,
      "ACI 318-19",
      "22.4.2.2",
      "Maks eksenel basinç (tied kolon)",
      maxPu <= phiPoTiedCap,
      `${fmt(maxPu, 1)} kN`,
      `<= ${fmt(phiPoTiedCap, 1)} kN`,
      "phi*Pn,max ~= 0.80*phi*Po"
    );

    addCheck(
      out,
      "ACI 318-19",
      "Design setup",
      "Guvenlik katsayisi ayari",
      approxEq(input.gammaC, 1.0, 0.02) && approxEq(input.gammaS, 1.0, 0.02),
      `gc=${fmt(input.gammaC, 2)}, gs=${fmt(input.gammaS, 2)}`,
      "gc=1.00, gs=1.00",
      "ACI guc tasarimi icin malzeme dayanimi girisleri dogrudan kullanilir"
    );

    addCheck(
      out,
      "ACI 318-19",
      "21.2.2",
      "phiP onerilen aralik",
      input.phiP >= 0.65 && input.phiP <= 0.75,
      `${fmt(input.phiP, 2)}`,
      "0.65 - 0.75",
      "Tied/spiral kolon ve gerinim durumuna gore degisir"
    );

    addCheck(
      out,
      "ACI 318-19",
      "21.2.2",
      "phiM onerilen aralik",
      input.phiM >= 0.65 && input.phiM <= 0.90,
      `${fmt(input.phiM, 2)}`,
      "0.65 - 0.90",
      "Gerinim kontrollu durumlarda artar"
    );

    addInfo(
      out,
      "ACI 318-19",
      "22.4 + 25.7",
      "Model kapsam notu",
      "Bu mod tied-column PMM kontrolune odaklanir; kesme, birlesim, minimum excentricity ve slenderness kontrolleri ayrica yapilmalidir.",
      "ACI tum bolumleri kapsamaz"
    );

    return out;
  }

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Kolon minimum boyut",
    input.shape === "rect" ? minDimMm >= 250 : minDimMm >= 300,
    `${fmt(minDimMm, 1)} mm`,
    input.shape === "rect" ? ">= 250 mm" : ">= 300 mm",
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Net beton ortusu (ic eleman varsayimi)",
    coverNetMm >= 20,
    `${fmt(coverNetMm, 1)} mm`,
    ">= 20 mm",
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1 (Eq.7.8-7.9)",
    "Boyuna donati orani",
    rho >= 0.01 && rho <= 0.04,
    `%${fmt(rho * 100, 2)}`,
    "1% - 4%",
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1 (Eq.7.10)",
    "Bindirme bolgesinde boyuna donati orani",
    rho <= 0.06,
    `%${fmt(rho * 100, 2)}`,
    "<= 6% (bindirme varsa)",
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Boyuna donati min cap",
    input.barDiaMm >= 14,
    `${fmt(input.barDiaMm, 0)} mm`,
    ">= 14 mm",
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Enine donati cap / boyuna cap",
    input.tieDiaMm >= input.barDiaMm / 3.0,
    `${fmt(input.tieDiaMm, 1)} mm`,
    `>= ${fmt(input.barDiaMm / 3.0, 1)} mm`,
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Enine donati araligi (s_mid)",
    input.tieSpacingMidMm <= Math.min(12.0 * input.barDiaMm, 200.0),
    `${fmt(input.tieSpacingMidMm, 1)} mm`,
    `<= ${fmt(Math.min(12.0 * input.barDiaMm, 200.0), 1)} mm`,
    "TS500 s.25"
  );

  addCheck(
    out,
    "TS500",
    "7.4.1 (Eq.7.7)",
    "Maks eksenel basinç",
    maxPu <= ndLimitTs500,
    `${fmt(maxPu, 1)} kN`,
    `<= ${fmt(ndLimitTs500, 1)} kN`,
    "TS500 s.25"
  );

  if (input.shape === "circle") {
    addCheck(
      out,
      "TS500",
      "7.4.1",
      "Dairesel kesitte boyuna donati adedi",
      nBars >= 6,
      `${nBars}`,
      ">= 6",
      "TS500 s.25"
    );
  }

  let sCenterMax = Number.POSITIVE_INFINITY;
  let sCenterMin = Number.POSITIVE_INFINITY;
  let spacingValueText = "";

  if (rebarLayout) {
    const spacingCandidates = rebarLayout.spacingCenterMm.filter((value) => Number.isFinite(value) && value > 0);
    if (spacingCandidates.length > 0) {
      sCenterMax = Math.max(...spacingCandidates);
    }
    sCenterMin = rebarLayout.minPairCenterMm;

    if (input.shape === "rect" && rebarLayout.rectLayers.length > 0) {
      spacingValueText = rebarLayout.rectLayers
        .map((layer) => `L${layer.layerIndex}[sx=${fmt(layer.sxM * 1000.0, 1)}, sy=${fmt(layer.syM * 1000.0, 1)}]`)
        .join(", ");
    } else if (input.shape === "circle" && rebarLayout.circleLayers.length > 0) {
      spacingValueText = rebarLayout.circleLayers
        .map((layer) => `L${layer.layerIndex}[s_arc=${fmt(layer.sArcM * 1000.0, 1)} mm]`)
        .join(", ");
    }
    if (input.useDoubleLayer) {
      spacingValueText = spacingValueText.length > 0
        ? `${spacingValueText}, a_row=${fmt(input.layerSpacingMm, 1)}`
        : `a_row=${fmt(input.layerSpacingMm, 1)}`;
    }
  }

  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Boyuna donati araligi ust sinir (komsu barlar)",
    sCenterMax <= 300,
    `smax=${fmt(sCenterMax, 1)} mm ${spacingValueText}`,
    "<= 300 mm",
    "TS500 s.25"
  );

  const sClearMin = Number.isFinite(sCenterMin) ? sCenterMin - input.barDiaMm : Number.NEGATIVE_INFINITY;
  const sClearLimit = Math.max(1.5 * input.barDiaMm, 40.0);
  addCheck(
    out,
    "TS500",
    "7.4.1",
    "Boyuna donati net araligi alt sinir",
    sClearMin >= sClearLimit,
    `s_net,min=${fmt(sClearMin, 1)} mm`,
    `>= ${fmt(sClearLimit, 1)} mm`,
    "TS500 s.25 (agrega dane capi kontrolu ayri degerlendirilmelidir)"
  );

  if (input.codeMode === "ts500_tbdy") {
    addCheck(
      out,
      "TBDY 2018",
      "7.2.5.3",
      "Beton dayanimi araligi",
      input.fck >= 25 && input.fck <= 80,
      `${fmt(input.fck, 1)} MPa`,
      "C25 - C80",
      "TBDY s.112"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.2.5.3",
      "Donati celigi sinifi",
      approxEq(input.fyk, 420, 1.5) || approxEq(input.fyk, 500, 1.5),
      `${fmt(input.fyk, 1)} MPa`,
      "B420C veya B500C",
      "TBDY s.112-113"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.1.1",
      "Yuksek suneklikte min kolon boyutu",
      input.shape === "rect" ? minDimMm >= 300 : minDimMm >= 350,
      `${fmt(minDimMm, 1)} mm`,
      input.shape === "rect" ? ">= 300 mm" : ">= 350 mm",
      "TBDY s.114"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.2.1",
      "Boyuna donati orani",
      rho >= 0.01 && rho <= 0.04,
      `%${fmt(rho * 100, 2)}`,
      "1% - 4%",
      "TBDY s.114"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.2.1",
      "Boyuna donati min cap",
      input.barDiaMm >= 14,
      `${fmt(input.barDiaMm, 0)} mm`,
      ">= 14 mm",
      "TBDY s.114"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.2.2",
      "Bindirmeli ek kesitinde boyuna donati orani",
      rho <= 0.06,
      `%${fmt(rho * 100, 2)}`,
      "<= 6% (bindirme varsa)",
      "TBDY s.114"
    );

    if (input.shape === "circle") {
      addCheck(
        out,
        "TBDY 2018",
        "7.3.2.1",
        "Dairesel kesitte boyuna donati adedi",
        nBars >= 6,
        `${nBars}`,
        ">= 6",
        "TBDY s.114"
      );
    }

    addCheck(
      out,
      "TBDY 2018",
      "7.3.4.1(a)",
      "Sarilma bolgesinde etriye min cap",
      input.tieDiaMm >= Math.max(8, input.barDiaMm / 3.0),
      `${fmt(input.tieDiaMm, 1)} mm`,
      `>= ${fmt(Math.max(8, input.barDiaMm / 3.0), 1)} mm`,
      "TBDY s.115"
    );

    let sConfMax = Math.min(minDimMm / 3.0, 150.0, 6.0 * input.barDiaMm);
    if (input.shape === "circle") {
      const coreDiaMm = Math.max(0, minDimMm - 2.0 * (coverNetMm + input.tieDiaMm * 0.5));
      sConfMax = Math.min(sConfMax, coreDiaMm / 5.0, 80.0);
    }
    addCheck(
      out,
      "TBDY 2018",
      "7.3.4.1(a)",
      "Sarilma bolgesi etriye araligi ust sinir",
      input.tieSpacingConfMm <= sConfMax,
      `${fmt(input.tieSpacingConfMm, 1)} mm`,
      `<= ${fmt(sConfMax, 1)} mm`,
      "TBDY s.115"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.4.1(a)",
      "Sarilma bolgesi etriye araligi alt sinir",
      input.tieSpacingConfMm >= 50,
      `${fmt(input.tieSpacingConfMm, 1)} mm`,
      ">= 50 mm",
      "TBDY s.115"
    );

    const sMidMax = Math.min(minDimMm / 2.0, 200.0);
    addCheck(
      out,
      "TBDY 2018",
      "7.3.4.2",
      "Orta bolgede etriye min cap",
      input.tieDiaMm >= 8,
      `${fmt(input.tieDiaMm, 1)} mm`,
      ">= 8 mm",
      "TBDY s.116"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.4.2",
      "Orta bolge etriye araligi ust sinir",
      input.tieSpacingMidMm <= sMidMax,
      `${fmt(input.tieSpacingMidMm, 1)} mm`,
      `<= ${fmt(sMidMax, 1)} mm`,
      "TBDY s.116"
    );

    addCheck(
      out,
      "TBDY 2018",
      "7.3.1.2",
      "Maks eksenel basinç",
      maxPu <= ndLimitTBDY,
      `${fmt(maxPu, 1)} kN`,
      `<= ${fmt(ndLimitTBDY, 1)} kN`,
      "TBDY s.114"
    );

    addInfo(
      out,
      "TBDY 2018",
      "7.3.5.1 Eq(7.3)",
      "Kolon-kiris guclu kolon kontrolu",
      "Bu arac tek kolon PMM kontrolu yapar. Cerceve moment bilgisi girilmeden bu madde dogrulanamaz.",
      "TBDY s.116"
    );

    addInfo(
      out,
      "TBDY 2018",
      "7.3.4.1(b)-(c) Eq(7.1)-(7.2)",
      "Sarilma bolgesi enine donati miktari",
      "Ash/spiral hacimsel oran hesaplari icin etriye kol duzeni ve cekirdek boyutlari gerekli.",
      "TBDY s.115"
    );

    addInfo(
      out,
      "TS500 + TBDY",
      "Sistem duzeyi kontroller",
      "Tam uyumluluk kapsam notu",
      "Birlesim bolgesi, kesme, performans ve detay cizim kontrolleri ayrica yapilmalidir.",
      "TBDY Bolum 7"
    );
  }

  return out;
}

function addCheck(
  list: ComplianceCheck[],
  code: string,
  clause: string,
  description: string,
  ok: boolean,
  value: string,
  limit: string,
  note: string
): void {
  list.push({
    code,
    clause,
    description,
    value,
    limit,
    status: ok ? "pass" : "fail",
    note,
  });
}

function addInfo(
  list: ComplianceCheck[],
  code: string,
  clause: string,
  description: string,
  text: string,
  note: string
): void {
  list.push({
    code,
    clause,
    description,
    value: "-",
    limit: "-",
    status: "info",
    note: `${text} (${note})`,
  });
}

function approxEq(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol;
}

interface PlotPalette {
  bg: string;
  cloud: string;
  mesh: string;
  nominalCloud: string;
  nominalMesh: string;
  loadOk: string;
  loadNg: string;
  border: string;
  label: string;
  grid: string;
  axis: string;
  tickFill: string;
  tickStroke: string;
}

function getPlotPalette(): PlotPalette {
  if (state.theme === "light") {
    return {
      bg: "#f7fbff",
      cloud: "rgba(26, 133, 142, 0.45)",
      mesh: "rgba(42, 102, 120, 0.28)",
      nominalCloud: "rgba(73, 116, 220, 0.34)",
      nominalMesh: "rgba(62, 104, 198, 0.38)",
      loadOk: "#1f9d55",
      loadNg: "#d84b4b",
      border: "rgba(19, 50, 64, 0.45)",
      label: "#17323d",
      grid: "rgba(51, 86, 96, 0.14)",
      axis: "rgba(183, 112, 56, 0.45)",
      tickFill: "rgba(18, 44, 57, 0.95)",
      tickStroke: "rgba(248, 252, 255, 0.95)",
    };
  }
  return {
    bg: "#071018",
    cloud: "rgba(89, 195, 195, 0.45)",
    mesh: "rgba(134, 202, 210, 0.24)",
    nominalCloud: "rgba(113, 149, 255, 0.30)",
    nominalMesh: "rgba(144, 170, 255, 0.36)",
    loadOk: "#8ff7a7",
    loadNg: "#ff7f7f",
    border: "rgba(240, 255, 255, 0.75)",
    label: "#d4ecef",
    grid: "rgba(171, 206, 211, 0.16)",
    axis: "rgba(249, 177, 112, 0.45)",
    tickFill: "rgba(232, 247, 249, 0.95)",
    tickStroke: "rgba(4, 11, 18, 0.95)",
  };
}

function renderTable(results: ResultRow[]): void {
  refs.tableBody.innerHTML = "";
  for (const row of results) {
    const tr = document.createElement("tr");
    tr.className = row.ok ? "ok" : "ng";
    tr.innerHTML = `
      <td>${escapeHtml(row.name)}</td>
      <td>${fmt(row.pu)}</td>
      <td>${fmt(row.mux)}</td>
      <td>${fmt(row.muy)}</td>
      <td>${fmt(row.pcap)}</td>
      <td>${fmt(row.mxcap)}</td>
      <td>${fmt(row.mycap)}</td>
      <td>${Number.isFinite(row.scale) ? fmt(row.scale, 4) : "-"}</td>
      <td>${Number.isFinite(row.dcr) ? fmt(row.dcr, 4) : "-"}</td>
      <td>${row.ok ? tx("resultOk") : tx("resultFail")}</td>
    `;
    refs.tableBody.appendChild(tr);
  }
}

function renderCompliance(checks: ComplianceCheck[]): void {
  refs.complianceBody.innerHTML = "";
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const infoCount = checks.filter((c) => c.status === "info").length;

  refs.complianceSummary.className = "compliance-summary";
  if (failCount > 0) {
    refs.complianceSummary.classList.add("fail");
  } else if (infoCount > 0) {
    refs.complianceSummary.classList.add("info");
  } else {
    refs.complianceSummary.classList.add("pass");
  }

  refs.complianceSummary.textContent = complianceSummaryText(passCount, failCount, infoCount);

  for (const c of checks) {
    const tr = document.createElement("tr");
    tr.className = c.status;
    tr.innerHTML = `
      <td>${escapeHtml(c.code)}</td>
      <td>${escapeHtml(c.clause)}</td>
      <td>${escapeHtml(c.description)}</td>
      <td>${escapeHtml(c.value)}</td>
      <td>${escapeHtml(c.limit)}</td>
      <td>${c.status === "pass" ? tx("compliancePass") : c.status === "fail" ? tx("complianceFail") : tx("complianceInfo")}</td>
      <td>${escapeHtml(c.note)}</td>
    `;
    refs.complianceBody.appendChild(tr);
  }
}

function readCurrentPSignMode(): PSignMode {
  const mode = refs.pSign.value as PSignMode;
  return mode === "compression_negative" ? "compression_negative" : "compression_positive";
}

function readCurrentPSignFactor(): number {
  return readCurrentPSignMode() === "compression_negative" ? -1 : 1;
}

function pSignFactorForMode(mode: PSignMode): number {
  return mode === "compression_negative" ? -1 : 1;
}

function readCurrentPVisualScale(): number {
  const v = Number(refs.pVisualScale.value);
  if (!Number.isFinite(v)) return 0.55;
  return Math.min(1.5, Math.max(0.2, v));
}

function readCurrentSurfaceOpacity(): number {
  const v = Number(refs.surfaceOpacity.value);
  if (!Number.isFinite(v)) return 0.88;
  return Math.min(1.0, Math.max(0.15, v));
}

function renderSurfaceOpacityValue(): void {
  refs.surfaceOpacityValue.textContent = readCurrentSurfaceOpacity().toFixed(2);
}

function readSurfacePointsFromWasm(wasm: WasmExports): PmmPoint[] {
  const count = wasm.getPointCount();
  const surface: PmmPoint[] = [];
  for (let i = 0; i < count; i++) {
    surface.push({
      p: wasm.getPointP(i),
      mx: wasm.getPointMx(i),
      my: wasm.getPointMy(i),
    });
  }
  return surface;
}

function buildNominalSurface(wasm: WasmExports, input: AppInput): PmmPoint[] {
  const ok = configureWasm(wasm, input, { phiP: 1, phiM: 1, pCutoffRatio: input.pCutoffRatio });
  if (ok !== 1) return [];
  const nominalSurface = readSurfacePointsFromWasm(wasm);
  const restoreOk = configureWasm(wasm, input);
  if (restoreOk !== 1) {
    throw new Error(state.lang === "en" ? "Failed to restore design PMM configuration." : "Tasarım PMM konfigürasyonu geri yüklenemedi.");
  }
  return nominalSurface;
}

function prepareCanvasContext(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const w = Math.max(320, Math.round(canvas.clientWidth || 1100));
  const h = Math.max(220, Math.round(canvas.clientHeight || 500));
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  return { ctx, w, h };
}

function renderPlot(surface: PmmPoint[], results: ResultRow[]): void {
  const prepared = prepareCanvasContext(refs.plot);
  if (!prepared) return;
  const { ctx, w, h } = prepared;
  const pal = getPlotPalette();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  if (surface.length === 0) return;

  const projection = refs.projection.value;
  const pSignFactor = readCurrentPSignFactor();
  const showNominalSurface = state.showNominalSurface && state.nominalSurface.length > 0;
  const series = surface.map((p) => pickProjection(p, projection, pSignFactor));
  const nominalSeries = showNominalSurface
    ? state.nominalSurface.map((p) => pickProjection(p, projection, pSignFactor))
    : [];
  const loads = results.map((r) => pickProjection({ p: r.pu, mx: r.mux, my: r.muy }, projection, pSignFactor));

  const xs = [...series.map((v) => v.x), ...nominalSeries.map((v) => v.x), ...loads.map((v) => v.x)];
  const ys = [...series.map((v) => v.y), ...nominalSeries.map((v) => v.y), ...loads.map((v) => v.y)];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const padX = (xMax - xMin || 1) * 0.08;
  const padY = (yMax - yMin || 1) * 0.08;
  const xTicks = buildNiceTicks(xMin - padX, xMax + padX, 9);
  const yTicks = buildNiceTicks(yMin - padY, yMax + padY, 7);

  const bx0 = xTicks[0];
  const bx1 = xTicks[xTicks.length - 1];
  const by0 = yTicks[0];
  const by1 = yTicks[yTicks.length - 1];

  const plotLeft = 76;
  const plotRight = w - 36;
  const plotTop = 36;
  const plotBottom = h - 58;
  const plotWidth = Math.max(10, plotRight - plotLeft);
  const plotHeight = Math.max(10, plotBottom - plotTop);

  const sx = (v: number): number => ((v - bx0) / (bx1 - bx0)) * plotWidth + plotLeft;
  const sy = (v: number): number => plotBottom - (((v - by0) / (by1 - by0)) * plotHeight);

  drawGrid(ctx, xTicks, yTicks, sx, sy, plotLeft, plotTop, plotRight, plotBottom, pal);

  const shellPointCount = state.angleCount * state.depthCount;
  const drawSurfaceSeries = (
    sourceSeries: Array<{ x: number; y: number }>,
    meshColor: string,
    cloudColor: string,
    pointRadius: number,
    dash: number[] = []
  ): void => {
    if (!(shellPointCount > 0 && shellPointCount <= sourceSeries.length && state.angleCount >= 3 && state.depthCount >= 2)) return;
    const shellSeries = sourceSeries.slice(0, shellPointCount);
    ctx.save();
    ctx.strokeStyle = meshColor;
    ctx.lineWidth = 0.9;
    ctx.setLineDash(dash);

    for (let ai = 0; ai < state.angleCount; ai++) {
      ctx.beginPath();
      for (let di = 0; di < state.depthCount; di++) {
        const p = shellSeries[ai * state.depthCount + di];
        if (di === 0) ctx.moveTo(sx(p.x), sy(p.y));
        else ctx.lineTo(sx(p.x), sy(p.y));
      }
      ctx.stroke();
    }

    for (let di = 0; di < state.depthCount; di++) {
      ctx.beginPath();
      for (let ai = 0; ai <= state.angleCount; ai++) {
        const wrapped = ai % state.angleCount;
        const p = shellSeries[wrapped * state.depthCount + di];
        if (ai === 0) ctx.moveTo(sx(p.x), sy(p.y));
        else ctx.lineTo(sx(p.x), sy(p.y));
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = cloudColor;
    for (const p of sourceSeries) {
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), pointRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (showNominalSurface) {
    drawSurfaceSeries(nominalSeries, pal.nominalMesh, pal.nominalCloud, 1.2, [5, 4]);
  }
  drawSurfaceSeries(series, pal.mesh, pal.cloud, 1.4);

  for (let i = 0; i < loads.length; i++) {
    const p = loads[i];
    const ok = results[i]?.ok ?? false;
    ctx.fillStyle = ok ? pal.loadOk : pal.loadNg;
    ctx.beginPath();
    ctx.arc(sx(p.x), sy(p.y), 4.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = pal.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(plotLeft, plotTop, plotWidth, plotHeight);

  ctx.fillStyle = pal.label;
  ctx.font = "14px 'IBM Plex Sans'";
  const [xLabel, yLabel] = labelsForProjection(projection);
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(xLabel, plotRight, h - 12);
  ctx.save();
  ctx.translate(18, (plotTop + plotBottom) * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}
function renderPlot3d(surface: PmmPoint[], results: ResultRow[]): void {
  const host = refs.plot3d;
  const angleCount = state.angleCount;
  const depthCount = state.depthCount;
  const shellPointCount = angleCount * depthCount;

  if (shellPointCount <= 0 || surface.length < shellPointCount) {
    host.innerHTML = "";
    return;
  }

  const pSignFactor = readCurrentPSignFactor();
  const pVisualScale = readCurrentPVisualScale();
  const surfaceOpacity = readCurrentSurfaceOpacity();
  const showNominalSurface = state.showNominalSurface && state.nominalSurface.length >= shellPointCount;
  const buildSurfaceGrid = (source: PmmPoint[]): { x: number[][]; y: number[][]; z: number[][] } | null => {
    if (source.length < shellPointCount) return null;
    const x: number[][] = [];
    const y: number[][] = [];
    const z: number[][] = [];
    for (let ai = 0; ai < angleCount; ai++) {
      const rowX: number[] = [];
      const rowY: number[] = [];
      const rowZ: number[] = [];
      for (let di = 0; di < depthCount; di++) {
        const idx = ai * depthCount + di;
        const p = source[idx];
        rowX.push(p.mx);
        rowY.push(p.my);
        rowZ.push(p.p * pSignFactor);
      }
      x.push(rowX);
      y.push(rowY);
      z.push(rowZ);
    }
    if (x.length > 0) {
      x.push([...x[0]]);
      y.push([...y[0]]);
      z.push([...z[0]]);
    }
    return { x, y, z };
  };

  const designGrid = buildSurfaceGrid(surface);
  if (!designGrid) {
    host.innerHTML = "";
    return;
  }

  const traces: any[] = [];
  if (showNominalSurface) {
    const nominalGrid = buildSurfaceGrid(state.nominalSurface);
    if (nominalGrid) {
      traces.push({
        type: "surface",
        x: nominalGrid.x,
        y: nominalGrid.y,
        z: nominalGrid.z,
        showscale: false,
        opacity: Math.max(0.18, Math.min(0.42, surfaceOpacity * 0.5)),
        colorscale: [
          [0, "#4d79ff"],
          [0.55, "#6c9bff"],
          [1, "#a9c2ff"],
        ],
        contours: {
          z: {
            show: true,
            usecolormap: false,
            color: "rgba(220, 232, 255, 0.34)",
            width: 1,
          },
        },
        hovertemplate:
          state.lang === "en"
            ? "Nominal PMM<br>P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>"
            : "Nominal PMM<br>P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>",
      });
    }
  }

  traces.push({
    type: "surface",
    x: designGrid.x,
    y: designGrid.y,
    z: designGrid.z,
    showscale: false,
    opacity: surfaceOpacity,
    colorscale: [
      [0, "#d1ae62"],
      [0.55, "#e2bf72"],
      [1, "#f0d98d"],
    ],
    contours: {
      z: {
        show: true,
        usecolormap: false,
        color: "rgba(240, 248, 255, 0.38)",
        width: 1,
      },
    },
    hovertemplate:
      state.lang === "en"
        ? "Design PMM<br>P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>"
        : "Tasarım PMM<br>P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>",
  });

  traces.push({
    type: "scatter3d",
    mode: "markers+text",
    x: results.map((r) => r.mux),
    y: results.map((r) => r.muy),
    z: results.map((r) => r.pu * pSignFactor),
    text: results.map((r) => r.name),
    textposition: "top center",
    textfont: { color: state.theme === "light" ? "#1c3d4b" : "#cde6eb", size: 10 },
    marker: {
      size: 4,
      color: results.map((r) => (r.ok ? "#8ff7a7" : "#ff7f7f")),
      line: { color: "#052130", width: 1 },
    },
    hovertemplate:
      state.lang === "en"
        ? "%{text}<br>Pu: %{z:.1f} kN<br>Mux: %{x:.1f} kNm<br>Muy: %{y:.1f} kNm<extra></extra>"
        : "%{text}<br>Pu: %{z:.1f} kN<br>Mux: %{x:.1f} kNm<br>Muy: %{y:.1f} kNm<extra></extra>",
  });

  const sceneBg = state.theme === "light" ? "#f7fbff" : "#06111a";
  const sceneColor = state.theme === "light" ? "#17323d" : "#cde6eb";
  const sceneGrid = state.theme === "light" ? "rgba(41, 74, 88, 0.18)" : "rgba(159, 197, 202, 0.20)";
  const sceneZero = state.theme === "light" ? "rgba(183, 112, 56, 0.45)" : "rgba(249, 177, 112, 0.45)";
  const zTitle = state.lang === "en"
    ? (pSignFactor < 0 ? "P (kN) [compression -]" : "P (kN) [compression +]")
    : (pSignFactor < 0 ? "P (kN) [basınç -]" : "P (kN) [basınç +]");

  const layout = {
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    scene: {
      bgcolor: sceneBg,
      aspectmode: "manual",
      aspectratio: { x: 1, y: 1, z: pVisualScale },
      camera: {
        eye: { x: 1.45, y: -1.35, z: 0.9 },
      },
      xaxis: {
        title: "Mx (kNm)",
        color: sceneColor,
        gridcolor: sceneGrid,
        zerolinecolor: sceneZero,
      },
      yaxis: {
        title: "My (kNm)",
        color: sceneColor,
        gridcolor: sceneGrid,
        zerolinecolor: sceneZero,
      },
      zaxis: {
        title: zTitle,
        color: sceneColor,
        gridcolor: sceneGrid,
        zerolinecolor: sceneZero,
      },
    },
  };

  const config = {
    responsive: true,
    displaylogo: false,
    scrollZoom: true,
  };

  try {
    (Plotly as any).react(host, traces, layout, config);
  } catch (error) {
    host.textContent = `${tx("plot3dError")}: ${String(error)}`;
  }
}
function normalizeDeg(v: number): number {
  if (!Number.isFinite(v)) return 0;
  let a = v % 360;
  if (a < 0) a += 360;
  return a;
}

function roundDisplayValue(v: number, digits: number): number {
  const threshold = 0.5 * Math.pow(10, -digits);
  return Math.abs(v) < threshold ? 0 : v;
}

function quantize(v: number, step: number): number {
  if (!Number.isFinite(v)) return 0;
  if (!(step > 0)) return v;
  return Math.round(v / step) * step;
}

function isNearZeroMomentRow(row: PmmPoint): boolean {
  return Math.abs(row.mx) < 0.05 && Math.abs(row.my) < 0.05;
}

function dedupeSliceRows(rows: PmmPoint[]): PmmPoint[] {
  const seen = new Set<string>();
  const out: PmmPoint[] = [];

  for (const row of rows) {
    const p = roundDisplayValue(row.p, 1);
    const mx = roundDisplayValue(row.mx, 1);
    const my = roundDisplayValue(row.my, 1);
    const key = `${quantize(p, 0.1).toFixed(1)}|${quantize(mx, 0.1).toFixed(1)}|${quantize(my, 0.1).toFixed(1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ p, mx, my });
  }

  return out;
}

function compressNearZeroMomentRows(rows: PmmPoint[]): PmmPoint[] {
  const nonZero = rows.filter((row) => !isNearZeroMomentRow(row));
  const zeroRows = rows.filter((row) => isNearZeroMomentRow(row));
  if (zeroRows.length === 0) return rows;

  const keep: PmmPoint[] = [zeroRows[0]];
  const last = zeroRows[zeroRows.length - 1];
  if (!approxEq(keep[0].p, last.p, 1e-6) || !approxEq(keep[0].mx, last.mx, 1e-6) || !approxEq(keep[0].my, last.my, 1e-6)) {
    keep.push(last);
  }

  return [...nonZero, ...keep].sort((a, b) => a.p - b.p);
}

function findAngleIndex(requestedDeg: number, angleCount: number): number {
  return ((Math.round((requestedDeg / 360) * angleCount) % angleCount) + angleCount) % angleCount;
}

function collectAngleSliceRows(
  surface: PmmPoint[],
  angleIndex: number,
  depthCount: number,
  pSignFactor: number
): PmmPoint[] {
  const rawRows: PmmPoint[] = [];
  for (let di = 0; di < depthCount; di++) {
    const idx = angleIndex * depthCount + di;
    const p = surface[idx];
    rawRows.push({
      p: p.p * pSignFactor,
      mx: p.mx,
      my: p.my,
    });
  }
  rawRows.sort((a, b) => a.p - b.p);
  return dedupeSliceRows(rawRows);
}

function sliceMetaText(requestedDeg: number, actualDeg: number, shownCount: number, rawCount: number): string {
  if (state.lang === "en") {
    return `Requested: ${fmt(requestedDeg, 1)}° | Nearest mesh angle: ${fmt(actualDeg, 1)}° | Shown: ${shownCount} / Raw: ${rawCount}`;
  }
  return `İstenen: ${fmt(requestedDeg, 1)}° | En yakın örgü açısı: ${fmt(actualDeg, 1)}° | Gösterilen: ${shownCount} / Ham: ${rawCount}`;
}

function render3dSliceTable(surface: PmmPoint[]): void {
  refs.sliceBody.innerHTML = "";

  const angleCount = state.angleCount;
  const depthCount = state.depthCount;
  const shellPointCount = angleCount * depthCount;
  if (shellPointCount <= 0 || surface.length < shellPointCount || angleCount <= 0 || depthCount <= 0) {
    state.sliceShownRows = [];
    refs.sliceMeta.textContent = state.lang === "en" ? "Run analysis to populate the slice table." : "Kesit tablosu için analiz çalıştırın.";
    return;
  }

  const parsed = Number(refs.sliceAngle.value.replace(",", "."));
  const requestedDeg = normalizeDeg(Number.isFinite(parsed) ? parsed : state.sliceAngleDeg);
  state.sliceAngleDeg = requestedDeg;
  refs.sliceAngle.value = fmtSlice(requestedDeg, 1);

  const targetIndex = findAngleIndex(requestedDeg, angleCount);
  const actualDeg = (targetIndex / angleCount) * 360;
  const pSignFactor = readCurrentPSignFactor();
  const dedupedRows = collectAngleSliceRows(surface, targetIndex, depthCount, pSignFactor);
  const shownRows = refs.sliceHideZero.checked ? compressNearZeroMomentRows(dedupedRows) : dedupedRows;
  state.sliceActualAngleDeg = actualDeg;
  state.sliceShownRows = shownRows;
  refs.sliceMeta.textContent = sliceMetaText(requestedDeg, actualDeg, shownRows.length, depthCount);

  for (let i = 0; i < shownRows.length; i++) {
    const r = shownRows[i];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${fmtSlice(roundDisplayValue(r.p, 1), 1)}</td>
      <td>${fmtSlice(roundDisplayValue(r.mx, 1), 1)}</td>
      <td>${fmtSlice(roundDisplayValue(r.my, 1), 1)}</td>
    `;
    refs.sliceBody.appendChild(tr);
  }
}

function sliceRowsClipboardText(rows: PmmPoint[]): string {
  const lines = ["No\tP_kN\tMx_kNm\tMy_kNm"];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    lines.push(
      [
        String(i + 1),
        toFixedPlain(roundDisplayValue(row.p, 1), 1),
        toFixedPlain(roundDisplayValue(row.mx, 1), 1),
        toFixedPlain(roundDisplayValue(row.my, 1), 1),
      ].join("\t")
    );
  }
  return lines.join("\n");
}

async function copySliceTableToClipboard(): Promise<void> {
  if (state.sliceShownRows.length === 0) {
    setStatus(tx("statusSliceCopyEmpty"), "danger");
    return;
  }
  await writeClipboardText(sliceRowsClipboardText(state.sliceShownRows));
  setStatus(`${tx("statusSliceCopied")} (${fmtSlice(state.sliceActualAngleDeg, 1)}°)`, "info");
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  xTicks: number[],
  yTicks: number[],
  sx: (v: number) => number,
  sy: (v: number) => number,
  plotLeft: number,
  plotTop: number,
  plotRight: number,
  plotBottom: number,
  pal: PlotPalette
): void {
  const bx0 = xTicks[0];
  const bx1 = xTicks[xTicks.length - 1];
  const by0 = yTicks[0];
  const by1 = yTicks[yTicks.length - 1];

  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;

  for (const xv of xTicks) {
    const x = sx(xv);
    ctx.beginPath();
    ctx.moveTo(x, plotTop);
    ctx.lineTo(x, plotBottom);
    ctx.stroke();
  }

  for (const yv of yTicks) {
    const y = sy(yv);
    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotRight, y);
    ctx.stroke();
  }

  if (bx0 < 0 && bx1 > 0) {
    const zx = sx(0);
    ctx.strokeStyle = pal.axis;
    ctx.beginPath();
    ctx.moveTo(zx, plotTop);
    ctx.lineTo(zx, plotBottom);
    ctx.stroke();
  }
  if (by0 < 0 && by1 > 0) {
    const zy = sy(0);
    ctx.strokeStyle = pal.axis;
    ctx.beginPath();
    ctx.moveTo(plotLeft, zy);
    ctx.lineTo(plotRight, zy);
    ctx.stroke();
  }

  ctx.fillStyle = pal.tickFill;
  ctx.strokeStyle = pal.tickStroke;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.font = "12px 'IBM Plex Sans'";

  const xStep = xTicks.length > 1 ? Math.abs(xTicks[1] - xTicks[0]) : 1;
  const yStep = yTicks.length > 1 ? Math.abs(yTicks[1] - yTicks[0]) : 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const xv of xTicks) {
    const x = sx(xv);
    const label = fmtAxis(xv, xStep);
    ctx.strokeText(label, x, plotBottom + 6);
    ctx.fillText(label, x, plotBottom + 6);
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const yv of yTicks) {
    const y = sy(yv);
    const label = fmtAxis(yv, yStep);
    ctx.strokeText(label, plotLeft - 8, y);
    ctx.fillText(label, plotLeft - 8, y);
  }
}

function buildNiceTicks(min: number, max: number, targetCount = 8): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  let lo = min;
  let hi = max;
  if (approxEq(lo, hi, 1e-12)) {
    const d = Math.abs(lo) * 0.1 || 1;
    lo -= d;
    hi += d;
  }
  const step = niceStep((hi - lo) / Math.max(1, targetCount - 1));
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  const eps = step * 1e-6;
  for (let v = start; v <= end + eps; v += step) {
    const cleaned = Math.abs(v) < eps ? 0 : v;
    ticks.push(Number(cleaned.toPrecision(12)));
    if (ticks.length > 200) break;
  }
  if (ticks.length < 2) return [start, start + step];
  return ticks;
}

function niceStep(rawStep: number): number {
  const value = Math.abs(rawStep);
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction = 1;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 2.5) niceFraction = 2.5;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * Math.pow(10, exponent);
}

function fmtAxis(v: number, step: number): string {
  let digits = 0;
  const s = Math.abs(step);
  if (s < 1) digits = 1;
  if (s < 0.1) digits = 2;
  if (s < 0.01) digits = 3;
  const value = Math.abs(v) < s * 1e-6 ? 0 : v;
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function pickProjection(point: PmmPoint, projection: string, pSignFactor: number): { x: number; y: number } {
  const p = point.p * pSignFactor;
  if (projection === "p-my") return { x: point.my, y: p };
  if (projection === "mx-my") return { x: point.mx, y: point.my };
  return { x: point.mx, y: p };
}

function labelsForProjection(projection: string): [string, string] {
  const pLabel = readCurrentPSignMode() === "compression_negative"
    ? (state.lang === "en" ? "P (kN, C-)" : "P (kN, B-)")
    : (state.lang === "en" ? "P (kN, C+)" : "P (kN, B+)");
  if (projection === "p-my") return ["My (kNm)", pLabel];
  if (projection === "mx-my") return ["Mx (kNm)", "My (kNm)"];
  return ["Mx (kNm)", pLabel];
}

async function parseLoadsCsvFile(file: File): Promise<LoadCase[]> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) return [];

  const sep = detectSep(lines[0]);
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const idxName = headers.indexOf("name");
  const idxPu = headers.findIndex((h) => h === "pu" || h === "p");
  const idxMx = headers.findIndex((h) => h === "mux" || h === "mx");
  const idxMy = headers.findIndex((h) => h === "muy" || h === "my");
  if (idxPu < 0 || idxMx < 0 || idxMy < 0) {
    throw new Error("CSV kolonlari name,Pu,Mux,Muy (veya P,Mx,My) olmali.");
  }

  const out: LoadCase[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(sep).map((p) => p.trim());
    if (parts.length <= Math.max(idxPu, idxMx, idxMy)) continue;
    out.push({
      name: idxName >= 0 ? parts[idxName] || `F${i}` : `F${i}`,
      pu: n(parts[idxPu]),
      mux: n(parts[idxMx]),
      muy: n(parts[idxMy]),
    });
  }
  return out;
}

function detectSep(line: string): string {
  if (line.includes(";")) return ";";
  if (line.includes("\t")) return "\t";
  return ",";
}

function exportResultsCsv(): void {
  if (state.results.length === 0) return;
  const rows = [
    "name,Pu_kN,Mux_kNm,Muy_kNm,Pcap_kN,Mxcap_kNm,Mycap_kNm,scale,dcr,ok",
    ...state.results.map((r) =>
      [
        r.name,
        r.pu,
        r.mux,
        r.muy,
        r.pcap,
        r.mxcap,
        r.mycap,
        r.scale,
        r.dcr,
        r.ok ? "1" : "0",
      ].join(",")
    ),
  ];
  downloadText("ts500_results.csv", rows.join("\n"));
}

function exportSurfaceCsv(): void {
  const axis = buildAxisExportData();
  if (!axis) {
    setStatus(tx("statusSurfaceExportEmpty"), "danger");
    return;
  }
  const maxLen = Math.max(axis.mx.length, axis.my.length);
  const rows = [
    "No,P_Mx_kN,Mx_pos_kNm,Mx_mirror_kNm,P_My_kN,My_pos_kNm,My_mirror_kNm",
  ];
  for (let i = 0; i < maxLen; i++) {
    const mx = axis.mx[i];
    const my = axis.my[i];
    rows.push(
      [
        String(i + 1),
        mx ? toCsvNumber(mx.p) : "",
        mx ? toCsvNumber(mx.mPos) : "",
        mx ? toCsvNumber(mx.mNeg) : "",
        my ? toCsvNumber(my.p) : "",
        my ? toCsvNumber(my.mPos) : "",
        my ? toCsvNumber(my.mNeg) : "",
      ].join(",")
    );
  }
  rows.push("");
  rows.push(`Meta,Mx angle=${toCsvNumber(axis.mxAngleDeg)} deg,My angle=${toCsvNumber(axis.myAngleDeg)} deg,,,,`);
  downloadText("ts500_surface.csv", rows.join("\n"));
  setStatus(tx("statusSurfaceExported"), "info");
}

interface AxisSeriesRow {
  p: number;
  mPos: number;
  mNeg: number;
}

interface AxisExportData {
  mx: AxisSeriesRow[];
  my: AxisSeriesRow[];
  mxAngleDeg: number;
  myAngleDeg: number;
}

function toAxisSeriesRows(rows: PmmPoint[], moment: "mx" | "my"): AxisSeriesRow[] {
  const out = rows.map((row) => {
    const m = moment === "mx" ? row.mx : row.my;
    const mAbs = Math.abs(roundDisplayValue(m, 6));
    return {
      p: roundDisplayValue(row.p, 6),
      mPos: mAbs,
      mNeg: -mAbs,
    };
  });
  out.sort((a, b) => b.p - a.p);
  return out;
}

function buildAxisExportData(): AxisExportData | null {
  if (state.surface.length === 0) return null;
  const angleCount = state.angleCount;
  const depthCount = state.depthCount;
  const shellPointCount = angleCount * depthCount;
  if (shellPointCount <= 0 || state.surface.length < shellPointCount || angleCount <= 0 || depthCount <= 0) return null;
  const pSignFactor = readCurrentPSignFactor();

  const myAngleIndex = findAngleIndex(0, angleCount);
  const mxAngleIndex = findAngleIndex(90, angleCount);
  const myAngleDeg = (myAngleIndex / angleCount) * 360;
  const mxAngleDeg = (mxAngleIndex / angleCount) * 360;

  const myRows = collectAngleSliceRows(state.surface, myAngleIndex, depthCount, pSignFactor);
  const mxRows = collectAngleSliceRows(state.surface, mxAngleIndex, depthCount, pSignFactor);

  return {
    mx: toAxisSeriesRows(mxRows, "mx"),
    my: toAxisSeriesRows(myRows, "my"),
    mxAngleDeg,
    myAngleDeg,
  };
}

function downloadText(name: string, text: string, mime = "text/csv;charset=utf-8"): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadDoc(name: string, html: string): void {
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function writeClipboardText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // fall back below
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.left = "-10000px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  if (!ok) throw new Error(state.lang === "en" ? "Copy failed." : "Kopyalama başarısız.");
}

// ---------------------------------------------------------------------------
// Moment–Curvature Analysis
// ---------------------------------------------------------------------------

function computeMcDataAtAngle(
  wasm: WasmExports,
  input: AppInput,
  pKnRaw: number,
  angleDeg: number,
  nSteps: number,
  pSignFactor: number
): McData {
  const pKn = pKnRaw * pSignFactor;
  const angleRad = (angleDeg * Math.PI) / 180;
  const nx = Math.sin(angleRad);
  const ny = Math.cos(angleRad);
  const strengths = resolveDesignStrengths(input);
  const barDiaM = input.barDiaMm / 1000.0;
  const count = wasm.buildMomentCurvature(
    pKn,
    nx,
    ny,
    nSteps,
    strengths.fckPmm,
    strengths.fykPmm,
    input.gammaC,
    input.gammaS,
    input.es,
    barDiaM
  );
  if (count === 0) {
    throw new Error(tx("statusMcNoPoints"));
  }

  const tempPhi: number[] = [];
  const tempMom: number[] = [];
  const tempNA: number[] = [];
  const tempEpsC: number[] = [];
  const tempEpsS: number[] = [];
  let peakMoment = 0;
  for (let i = 0; i < count; i++) {
    const m = wasm.getMcMoment(i);
    tempPhi.push(wasm.getMcPhi(i));
    tempMom.push(m);
    tempNA.push(wasm.getMcNeutralAxis(i));
    tempEpsC.push(wasm.getMcEpsC(i));
    tempEpsS.push(wasm.getMcEpsS(i));
    if (m > peakMoment) peakMoment = m;
  }

  const epsCuLimit = input.epsCu > 0 ? input.epsCu : 0.003;
  const epsCuCutoff = epsCuLimit * 2.5;
  let lastConcreteIdx = count - 1;
  for (let i = 0; i < count; i++) {
    if (tempEpsC[i] > epsCuCutoff) {
      lastConcreteIdx = Math.min(count - 1, i + 10);
      break;
    }
  }

  const minAllowedMoment = peakMoment > 0 ? peakMoment * 0.5 : 0;
  let peakFound = false;

  const phi: number[] = [];
  const moment: number[] = [];
  const neutralAxis: number[] = [];
  const epsC: number[] = [];
  const epsS: number[] = [];
  const endIdx = Math.min(count, lastConcreteIdx + 1);
  for (let i = 0; i < endIdx; i++) {
    const m = tempMom[i];
    phi.push(tempPhi[i]);
    moment.push(m);
    neutralAxis.push(tempNA[i]);
    epsC.push(tempEpsC[i]);
    epsS.push(tempEpsS[i]);
    if (m >= peakMoment * 0.99) peakFound = true;
    if (peakFound && m < minAllowedMoment) break;
  }

  if (phi.length > 0 && (phi[0] > 1e-12 || moment[0] > 1e-9)) {
    phi.unshift(0);
    moment.unshift(0);
    neutralAxis.unshift(neutralAxis[0]);
    epsC.unshift(0);
    epsS.unshift(0);
  }

  return { phi, moment, neutralAxis, epsC, epsS };
}

async function runMomentCurvature(): Promise<void> {
  const wasm = state.wasm;
  if (!wasm) throw new Error(tx("statusMcNoPmm"));
  if (state.surface.length === 0) throw new Error(tx("statusMcNoPmm"));
  if (!state.lastInput) throw new Error(tx("statusMcNoPmm"));

  setStatus(tx("statusMcRunning"), "info");

  const input = state.lastInput;
  const pSignFactor = readCurrentPSignFactor();
  const pKnRaw = Number(refs.mcP.value.trim().replace(",", "."));
  if (!Number.isFinite(pKnRaw)) throw new Error(tx("statusMcNoPmm"));
  const angleDeg = Number(refs.mcAngle.value.trim().replace(",", ".")) || 0;
  const nSteps = Math.max(20, Math.min(400, Math.round(Number(refs.mcSteps.value) || 80)));
  state.mcData = computeMcDataAtAngle(wasm, input, pKnRaw, angleDeg, nSteps, pSignFactor);
  renderMcPlot(state.mcData);
  setStatus(tx("statusMcDone"), "info");
}

interface McKeyPoints {
  mu: number;
  phiPeak: number;
  phiU: number;
  phiY: number;
  ductility: number;
}

/**
 * Bilinear idealisation (equal-area / Park method):
 * φy is the yield curvature such that the area under the bilinear curve
 * (0→φy at slope Mu/φy, then horizontal to φu) equals the area under
 * the actual M–φ curve from 0 to φu.
 *
 * Bilinear area = Mu*(φu - 0.5*φy)
 * Solve: φy = 2*(φu - actual_area/Mu)
 */
function computeMcKeyPoints(phi: number[], moment: number[]): McKeyPoints {
  const n = phi.length;
  // Peak moment
  let mu = 0;
  let muIdx = 0;
  for (let i = 0; i < n; i++) {
    if (moment[i] > mu) { mu = moment[i]; muIdx = i; }
  }
  const phiPeak = phi[muIdx];
  const phiU = phi[n - 1];

  // Trapezoidal area from 0 to φu
  let area = 0;
  for (let i = 1; i < n; i++) {
    area += 0.5 * (moment[i - 1] + moment[i]) * (phi[i] - phi[i - 1]);
  }

  // Bilinear yield curvature
  let phiY = mu > 0 ? 2 * (phiU - area / mu) : phiU;
  if (phiY <= 0 || phiY > phiU) phiY = phiU * 0.2; // fallback
  const ductility = phiU / phiY;

  return { mu, phiPeak, phiU, phiY, ductility };
}

function renderMcPlot(data: McData): void {
  const host = refs.plotMc;
  const statsDiv = refs.mcStats;
  const { phi, moment } = data;
  if (phi.length === 0) { host.innerHTML = ""; return; }

  const pSignFactor = readCurrentPSignFactor();
  // Format phi in units of 1/m (no conversion needed — already rad/m)
  const keyPts = computeMcKeyPoints(phi, moment);

  const sceneBg = state.theme === "light" ? "#f7fbff" : "#06111a";
  const lineColor = state.theme === "light" ? "#1a858e" : "#5be7ff";
  const peakColor = state.theme === "light" ? "#d84b4b" : "#ff7f7f";
  const yieldColor = state.theme === "light" ? "#1f9d55" : "#8ff7a7";
  const gridColor = state.theme === "light" ? "rgba(41,74,88,0.18)" : "rgba(159,197,202,0.18)";
  const textColor = state.theme === "light" ? "#17323d" : "#cde6eb";

  const phiLabel = state.lang === "en" ? "φ (1/m)" : "φ (1/m)";
  const mLabel = state.lang === "en" ? "M (kNm)" : "M (kNm)";

  const curveTrace = {
    type: "scatter",
    mode: "lines",
    x: phi,
    y: moment,
    name: state.lang === "en" ? "M–φ curve" : "M–φ eğrisi",
    line: { color: lineColor, width: 2.5 },
    hovertemplate: `φ: %{x:.5f} 1/m<br>M: %{y:.1f} kNm<extra></extra>`,
  };

  const peakTrace = {
    type: "scatter",
    mode: "markers+text",
    x: [keyPts.phiPeak],
    y: [keyPts.mu],
    name: state.lang === "en" ? "Peak (Mu)" : "Tepe (Mu)",
    text: [`Mu=${fmt(keyPts.mu, 1)} kNm`],
    textposition: "top right",
    textfont: { color: peakColor, size: 11 },
    marker: { color: peakColor, size: 10, symbol: "diamond" },
    hovertemplate: `Mu: %{y:.1f} kNm<br>φ_peak: %{x:.5f}<extra></extra>`,
  };

  // Draw idealised bilinear as two dashed segments
  const bilinearTrace = {
    type: "scatter",
    mode: "lines",
    x: [0, keyPts.phiY, keyPts.phiU],
    y: [0, keyPts.mu, keyPts.mu],
    name: state.lang === "en" ? "Bilinear idealisation" : "Bilineer idealleştirme",
    line: { color: yieldColor, width: 1.4, dash: "dash" },
    hoverinfo: "skip",
  };

  const yieldTrace = {
    type: "scatter",
    mode: "markers+text",
    x: [keyPts.phiY],
    y: [keyPts.mu],
    name: state.lang === "en" ? "Yield (φy)" : "Akma (φy)",
    text: [`φy=${keyPts.phiY.toExponential(3)}`],
    textposition: "bottom right",
    textfont: { color: yieldColor, size: 11 },
    marker: { color: yieldColor, size: 9, symbol: "circle" },
    hovertemplate: `φy: %{x:.5f}<br>M(İdealize): %{y:.1f} kNm<extra></extra>`,
  };

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: sceneBg,
    height: mcPlotHeightPx(),
    margin: { l: 72, r: 28, t: 32, b: 64 },
    xaxis: {
      title: { text: phiLabel, font: { color: textColor } },
      color: textColor,
      gridcolor: gridColor,
      zerolinecolor: gridColor,
    },
    yaxis: {
      title: { text: mLabel, font: { color: textColor } },
      color: textColor,
      gridcolor: gridColor,
      zerolinecolor: gridColor,
    },
    legend: {
      font: { color: textColor, size: 11 },
      bgcolor: "rgba(0,0,0,0)",
    },
    font: { color: textColor },
  };

  const config = { responsive: true, displaylogo: false, scrollZoom: false };

  try {
    (Plotly as any).react(host, [curveTrace, bilinearTrace, peakTrace, yieldTrace], layout, config);

    // Hover sync: update strain diagram on hover
    // Hover sync: update strain diagram on hover
    (host as any).on("plotly_hover", (ev: any) => {
      if (!ev || !ev.points || ev.points.length === 0) return;
      const pt = ev.points[0];
      if (pt.curveNumber !== 0) return; // only on main curve
      const idx = pt.pointIndex as number;
      if (state.mcData) {
        updateMcHoverInfo(state.mcData, idx);
        renderStrainDiagram(state.mcData, idx);
      }
    });

    // Render strain diagram for last point by default
    if (data.phi.length > 0) {
      const lastIdx = data.phi.length - 1;
      updateMcHoverInfo(data, lastIdx);
      renderStrainDiagram(data, lastIdx);
    }
  } catch (e) {
    host.textContent = String(e);
    return;
  }

  // Stats box
  const pUser = Number(refs.mcP.value) * pSignFactor;
  const angleDeg = Number(refs.mcAngle.value) || 0;
  const pLabel = state.lang === "en"
    ? `P = ${fmt(pUser, 1)} kN (WASM convention), angle = ${fmt(angleDeg, 1)}°`
    : `P = ${fmt(pUser, 1)} kN (WASM yönü), açı = ${fmt(angleDeg, 1)}°`;

  statsDiv.innerHTML = `
    <p class="mc-stats-meta">${escapeHtml(pLabel)}</p>
    <div class="mc-stats-grid">
      <span class="mc-stat-label">${tx("mcStatsMu")}</span><span class="mc-stat-value">${fmt(keyPts.mu, 1)} kNm</span>
      <span class="mc-stat-label">${tx("mcStatsPhiU")}</span><span class="mc-stat-value">${keyPts.phiU.toExponential(4)} 1/m</span>
      <span class="mc-stat-label">${tx("mcStatsPhiY")}</span><span class="mc-stat-value">${keyPts.phiY.toExponential(4)} 1/m</span>
      <span class="mc-stat-label">${tx("mcStatsDuctility")}</span><span class="mc-stat-value">${fmt(keyPts.ductility, 2)}</span>
    </div>
  `;
  statsDiv.classList.remove("hidden");

  // Render data table
  renderMcDataTable(data);
}

function renderMcDataTable(data: McData): void {
  const container = refs.mcDataTable;
  if (!container) return;
  const rows = data.phi.map((phi, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${phi.toExponential(3)}</td>
      <td>${data.moment[i].toFixed(1)}</td>
      <td>${(data.neutralAxis[i] * 1000).toFixed(1)}</td>
      <td>${data.epsC[i].toExponential(3)}</td>
      <td>${data.epsS[i].toExponential(3)}</td>
    </tr>`
  ).join("");
  container.innerHTML = `
    <table class="mc-tbl">
      <thead>
        <tr>
          <th>#</th>
          <th>φ (1/m)</th>
          <th>M (kNm)</th>
          <th>NA (mm)</th>
          <th>ε<sub>c</sub></th>
          <th>ε<sub>s</sub></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function collectReportMeta(): ReportMeta {
  const sections = collectReportSectionOptions();
  return {
    company: refs.reportCompany.value.trim(),
    documentTitle: refs.reportDocTitle.value.trim(),
    project: refs.reportProject.value.trim(),
    client: refs.reportClient.value.trim(),
    preparedBy: refs.reportPreparedBy.value.trim(),
    checkedBy: refs.reportCheckedBy.value.trim(),
    revision: refs.reportRevision.value.trim() || "R00",
    reportDate: refs.reportDate.value.trim(),
    logoDataUrl: state.reportLogoDataUrl,
    sections,
  };
}

function collectReportSectionOptions(): ReportSectionOptions {
  return {
    cover: refs.reportSecCover.checked,
    summary: refs.reportSecSummary.checked,
    visuals: refs.reportSecVisuals.checked,
    loadInput: refs.reportSecLoadInput.checked,
    loadResults: refs.reportSecLoadResults.checked,
    compliance: refs.reportSecCompliance.checked,
    mphi: refs.reportSecMphi.checked,
    appendix: refs.reportSecAppendix.checked,
  };
}

function hasAnyReportSection(sections: ReportSectionOptions): boolean {
  return sections.cover || sections.summary || sections.visuals || sections.loadInput || sections.loadResults || sections.compliance || sections.mphi || sections.appendix;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Logo dosyası okunamadı."));
    reader.readAsDataURL(file);
  });
}

async function handleReportLogoSelection(): Promise<void> {
  const file = refs.reportLogo.files?.[0];
  if (!file) {
    state.reportLogoDataUrl = "";
    refs.reportLogoName.textContent = tx("labelReportLogoNoFile");
    return;
  }
  if (!file.type.startsWith("image/")) {
    throw new Error(state.lang === "en" ? "Logo must be an image file." : "Logo dosyası bir görsel olmalıdır.");
  }
  state.reportLogoDataUrl = await fileToDataUrl(file);
  refs.reportLogoName.textContent = file.name;
  setStatus(tx("statusReportLogoLoaded"), "info");
}

function setSelectValue(select: HTMLSelectElement, value: string, fallback: string): void {
  const safe = Array.from(select.options).some((option) => option.value === value && !option.disabled && !option.hidden)
    ? value
    : fallback;
  select.value = safe;
}

function setTextValue(
  input: HTMLInputElement | HTMLTextAreaElement,
  value: string | undefined,
  fallback = ""
): void {
  input.value = typeof value === "string" ? value : fallback;
}

function sanitizeProjectFilename(raw: string): string {
  const trimmed = raw.trim();
  const base = trimmed.length > 0 ? trimmed : "pmmstudio-project";
  return base
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "pmmstudio-project";
}

function collectProjectFile(): ProjectFileV1 {
  syncSectionFormToState();
  const activeSec = state.sections[state.activeSectionIdx];
  return {
    schema: "pmmstudio-project",
    version: 1,
    savedAt: new Date().toISOString(),
    sections: state.sections.map((s) => ({ ...s })),
      input: {
        codeMode: refs.codeMode.value as CodeMode,
        concreteModel: refs.concreteModel.value as ConcreteModel,
        materialPreset: refs.materialPreset.value,
        steelPreset: refs.steelPreset.value,
        shape: activeSec.shape,
      width: activeSec.width,
      height: activeSec.height,
      diameter: activeSec.diameter,
      barsX: activeSec.barsX,
      barsY: activeSec.barsY,
      bars: activeSec.bars,
      useDoubleLayer: activeSec.useDoubleLayer,
      barsX2: activeSec.barsX2,
      barsY2: activeSec.barsY2,
      bars2: activeSec.bars2,
      layerSpacing: activeSec.layerSpacing,
      cover: activeSec.cover,
      tieDia: activeSec.tieDia,
      barDia: activeSec.barDia,
      tieSpacingConf: activeSec.tieSpacingConf,
      tieSpacingMid: activeSec.tieSpacingMid,
      coverToCenter: activeSec.coverToCenter,
      useExpectedStrength: refs.useExpectedStrength.checked,
      expectedFckFactor: refs.expectedFckFactor.value,
      expectedFykFactor: refs.expectedFykFactor.value,
      fck: refs.fck.value,
      fyk: refs.fyk.value,
      gammaC: refs.gammaC.value,
      gammaS: refs.gammaS.value,
      es: refs.es.value,
      epsCu: refs.epsCu.value,
      mesh: refs.mesh.value,
      nAngle: refs.nAngle.value,
      nDepth: refs.nDepth.value,
      phiP: refs.phiP.value,
      phiM: refs.phiM.value,
      pCutoffRatio: refs.pCutoffRatio.value,
      pVisualScale: refs.pVisualScale.value,
      surfaceOpacity: refs.surfaceOpacity.value,
      pSign: refs.pSign.value as PSignMode,
      projection: refs.projection.value,
      showNominalSurface: refs.showNominalSurface.checked,
      sliceAngle: refs.sliceAngle.value,
      sliceHideZero: refs.sliceHideZero.checked,
      mcP: refs.mcP.value,
      mcAngle: refs.mcAngle.value,
      mcSteps: refs.mcSteps.value,
      controlsOpen: refs.controlsAccordion.open,
    },
    loadSheet: state.loadSheet.map((row) => ({ ...row })),
    report: {
      company: refs.reportCompany.value.trim(),
      documentTitle: refs.reportDocTitle.value.trim(),
      project: refs.reportProject.value.trim(),
      client: refs.reportClient.value.trim(),
      preparedBy: refs.reportPreparedBy.value.trim(),
      checkedBy: refs.reportCheckedBy.value.trim(),
      revision: refs.reportRevision.value.trim(),
      reportDate: refs.reportDate.value.trim(),
      logoDataUrl: state.reportLogoDataUrl,
      logoName: refs.reportLogoName.textContent?.trim() ?? "",
      sections: collectReportSectionOptions(),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRecordString(record: Record<string, unknown>, key: string, fallback = ""): string {
  const value = record[key];
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function readRecordBoolean(record: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = record[key];
  return typeof value === "boolean" ? value : fallback;
}

function parseProjectFile(text: string): ProjectFileV1 {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(tx("statusProjectInvalid"));
  }

  if (!isRecord(raw) || raw.schema !== "pmmstudio-project") {
    throw new Error(tx("statusProjectInvalid"));
  }

  const inputRaw = isRecord(raw.input) ? raw.input : {};
  const reportRaw = isRecord(raw.report) ? raw.report : {};
  const sectionsRaw = isRecord(reportRaw.sections) ? reportRaw.sections : {};
  const loadSheetRaw = Array.isArray(raw.loadSheet) ? raw.loadSheet : [];

  const codeModeRaw = readRecordString(inputRaw, "codeMode", "ts500_tbdy");
  const concreteModelRaw = readRecordString(inputRaw, "concreteModel", "mander_core_cover");
  const materialPresetRaw = readRecordString(inputRaw, "materialPreset", "custom");
  const steelPresetRaw = readRecordString(inputRaw, "steelPreset", "custom");
  const shapeRaw = readRecordString(inputRaw, "shape", "rect");
  const pSignRaw = readRecordString(inputRaw, "pSign", "compression_positive");

  const loadSheet = loadSheetRaw
    .filter((row): row is Record<string, unknown> => isRecord(row))
    .map((row) => ({
      name: readRecordString(row, "name"),
      pu: readRecordString(row, "pu"),
      mux: readRecordString(row, "mux"),
      muy: readRecordString(row, "muy"),
    }));

  const sectionsArray = Array.isArray(raw.sections) ? raw.sections : [];
  const parsedSections: SectionDef[] = sectionsArray
    .filter((s): s is Record<string, unknown> => isRecord(s))
    .map((s, i) => {
      const rawShape = readRecordString(s, "shape", "rect");
      return {
        id: typeof s.id === "number" ? s.id : i + 1,
        name: readRecordString(s, "name", `S${i + 1}`),
        shape: (rawShape === "rect" || rawShape === "circle" ? rawShape : "rect") as Shape,
        width: readRecordString(s, "width", "0.40"),
        height: readRecordString(s, "height", "0.60"),
        diameter: readRecordString(s, "diameter", "0.60"),
        barsX: readRecordString(s, "barsX", "4"),
        barsY: readRecordString(s, "barsY", "4"),
        bars: readRecordString(s, "bars", "12"),
        useDoubleLayer: readRecordBoolean(s, "useDoubleLayer", false),
        barsX2: readRecordString(s, "barsX2", "2"),
        barsY2: readRecordString(s, "barsY2", "2"),
        bars2: readRecordString(s, "bars2", "6"),
        layerSpacing: readRecordString(s, "layerSpacing", "60"),
        cover: readRecordString(s, "cover", "0.04"),
        tieDia: readRecordString(s, "tieDia", "10"),
        barDia: readRecordString(s, "barDia", "16"),
        tieSpacingConf: readRecordString(s, "tieSpacingConf", "100"),
        tieSpacingMid: readRecordString(s, "tieSpacingMid", "150"),
        coverToCenter: readRecordBoolean(s, "coverToCenter", false),
      };
    });

  return {
    schema: "pmmstudio-project",
    version: 1,
    savedAt: typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString(),
    sections: parsedSections.length > 0 ? parsedSections : undefined,
      input: {
        codeMode: codeModeRaw === "ts500" || codeModeRaw === "ts500_tbdy" || codeModeRaw === "aci318_19" ? codeModeRaw : "ts500_tbdy",
        concreteModel: concreteModelRaw === "ts500_block" || concreteModelRaw === "mander_core_cover" ? concreteModelRaw : "mander_core_cover",
        materialPreset: isMaterialPresetId(materialPresetRaw) ? materialPresetRaw : "custom",
        steelPreset: isSteelPresetId(steelPresetRaw) ? steelPresetRaw : "custom",
        shape: shapeRaw === "rect" || shapeRaw === "circle" ? shapeRaw : "rect",
      width: readRecordString(inputRaw, "width", refs.width.value),
      height: readRecordString(inputRaw, "height", refs.height.value),
      diameter: readRecordString(inputRaw, "diameter", refs.diameter.value),
      barsX: readRecordString(inputRaw, "barsX", refs.barsX.value),
      barsY: readRecordString(inputRaw, "barsY", refs.barsY.value),
      bars: readRecordString(inputRaw, "bars", refs.bars.value),
      useDoubleLayer: readRecordBoolean(inputRaw, "useDoubleLayer", refs.doubleLayer.checked),
      barsX2: readRecordString(inputRaw, "barsX2", refs.barsX2.value),
      barsY2: readRecordString(inputRaw, "barsY2", refs.barsY2.value),
      bars2: readRecordString(inputRaw, "bars2", refs.bars2.value),
      layerSpacing: readRecordString(inputRaw, "layerSpacing", refs.layerSpacing.value),
      cover: readRecordString(inputRaw, "cover", refs.cover.value),
      tieDia: readRecordString(inputRaw, "tieDia", refs.tieDia.value),
      barDia: readRecordString(inputRaw, "barDia", refs.barDia.value),
      tieSpacingConf: readRecordString(inputRaw, "tieSpacingConf", refs.tieSpacingConf.value),
      tieSpacingMid: readRecordString(inputRaw, "tieSpacingMid", refs.tieSpacingMid.value),
      coverToCenter: readRecordBoolean(inputRaw, "coverToCenter", refs.coverToCenter.checked),
      useExpectedStrength: readRecordBoolean(inputRaw, "useExpectedStrength", refs.useExpectedStrength.checked),
      expectedFckFactor: readRecordString(inputRaw, "expectedFckFactor", refs.expectedFckFactor.value),
      expectedFykFactor: readRecordString(inputRaw, "expectedFykFactor", refs.expectedFykFactor.value),
      fck: readRecordString(inputRaw, "fck", refs.fck.value),
      fyk: readRecordString(inputRaw, "fyk", refs.fyk.value),
      gammaC: readRecordString(inputRaw, "gammaC", refs.gammaC.value),
      gammaS: readRecordString(inputRaw, "gammaS", refs.gammaS.value),
      es: readRecordString(inputRaw, "es", refs.es.value),
      epsCu: readRecordString(inputRaw, "epsCu", refs.epsCu.value),
      mesh: readRecordString(inputRaw, "mesh", refs.mesh.value),
      nAngle: readRecordString(inputRaw, "nAngle", refs.nAngle.value),
      nDepth: readRecordString(inputRaw, "nDepth", refs.nDepth.value),
      phiP: readRecordString(inputRaw, "phiP", refs.phiP.value),
      phiM: readRecordString(inputRaw, "phiM", refs.phiM.value),
      pCutoffRatio: readRecordString(inputRaw, "pCutoffRatio", refs.pCutoffRatio.value),
      pVisualScale: readRecordString(inputRaw, "pVisualScale", refs.pVisualScale.value),
      surfaceOpacity: readRecordString(inputRaw, "surfaceOpacity", refs.surfaceOpacity.value),
      pSign: pSignRaw === "compression_negative" ? "compression_negative" : "compression_positive",
      projection: readRecordString(inputRaw, "projection", refs.projection.value),
      showNominalSurface: readRecordBoolean(inputRaw, "showNominalSurface", refs.showNominalSurface.checked),
      sliceAngle: readRecordString(inputRaw, "sliceAngle", refs.sliceAngle.value),
      sliceHideZero: readRecordBoolean(inputRaw, "sliceHideZero", refs.sliceHideZero.checked),
      mcP: readRecordString(inputRaw, "mcP", refs.mcP.value),
      mcAngle: readRecordString(inputRaw, "mcAngle", refs.mcAngle.value),
      mcSteps: readRecordString(inputRaw, "mcSteps", refs.mcSteps.value),
      controlsOpen: readRecordBoolean(inputRaw, "controlsOpen", refs.controlsAccordion.open),
    },
    loadSheet: loadSheet.length > 0 ? loadSheet : [emptyLoadSheetRow("L1")],
    report: {
      company: readRecordString(reportRaw, "company"),
      documentTitle: readRecordString(reportRaw, "documentTitle"),
      project: readRecordString(reportRaw, "project"),
      client: readRecordString(reportRaw, "client"),
      preparedBy: readRecordString(reportRaw, "preparedBy"),
      checkedBy: readRecordString(reportRaw, "checkedBy"),
      revision: readRecordString(reportRaw, "revision", "R00"),
      reportDate: readRecordString(reportRaw, "reportDate"),
      logoDataUrl: readRecordString(reportRaw, "logoDataUrl"),
      logoName: readRecordString(reportRaw, "logoName"),
      sections: {
        cover: readRecordBoolean(sectionsRaw, "cover", true),
        summary: readRecordBoolean(sectionsRaw, "summary", true),
        visuals: readRecordBoolean(sectionsRaw, "visuals", true),
        loadInput: readRecordBoolean(sectionsRaw, "loadInput", true),
        loadResults: readRecordBoolean(sectionsRaw, "loadResults", true),
        compliance: readRecordBoolean(sectionsRaw, "compliance", true),
        mphi: readRecordBoolean(sectionsRaw, "mphi", true),
        appendix: readRecordBoolean(sectionsRaw, "appendix", true),
      },
    },
  };
}

function clearMomentCurvatureOutputs(): void {
  state.mcData = null;
  refs.plotMc.innerHTML = "";
  refs.plotMcStrain.innerHTML = "";
  refs.mcDataTable.innerHTML = "";
  refs.mcStats.innerHTML = "";
  refs.mcStats.classList.add("hidden");
  refs.mcHoverInfo.classList.add("hidden");
  refs.mcHiEpsC.textContent = "—";
  refs.mcHiEpsS.textContent = "—";
  refs.mcHiNA.textContent = "—";
}

function clearAnalysisOutputs(): void {
  state.results = [];
  state.surface = [];
  state.nominalSurface = [];
  state.compliance = [];
  state.angleCount = 0;
  state.depthCount = 0;
  state.sliceActualAngleDeg = 0;
  state.sliceShownRows = [];
  state.lastInput = null;
  refs.tableBody.innerHTML = "";
  refs.complianceBody.innerHTML = "";
  refs.complianceSummary.className = "compliance-summary";
  refs.complianceSummary.textContent = tx("complianceSummaryInit");
  refs.rhoDisplay.textContent = "";
  refs.exportResults.disabled = true;
  refs.exportSurface.disabled = true;
  refs.exportReport.disabled = true;
  refs.exportReportPdf.disabled = true;
  clearMomentCurvatureOutputs();
  renderPlot([], []);
  renderPlot3d([], []);
  render3dSliceTable([]);
}

function persistProjectPrefs(): void {
  localStorage.setItem("pmm-code-mode", refs.codeMode.value);
  localStorage.setItem("pmm-concrete-model", refs.concreteModel.value);
  localStorage.setItem("pmm-material-preset", refs.materialPreset.value);
  localStorage.setItem("pmm-steel-preset", refs.steelPreset.value);
  localStorage.setItem("pmm-p-sign", refs.pSign.value);
  localStorage.setItem("pmm-expected-strength", refs.useExpectedStrength.checked ? "1" : "0");
  localStorage.setItem("pmm-expected-fck-factor", refs.expectedFckFactor.value);
  localStorage.setItem("pmm-expected-fyk-factor", refs.expectedFykFactor.value);
  localStorage.setItem("pmm-p-visual", refs.pVisualScale.value);
  localStorage.setItem("pmm-surface-opacity", refs.surfaceOpacity.value);
  localStorage.setItem("pmm-show-nominal-surface", refs.showNominalSurface.checked ? "1" : "0");
  localStorage.setItem("pmm-controls-open", refs.controlsAccordion.open ? "1" : "0");
}

function applyProjectFile(project: ProjectFileV1): void {
  setSelectValue(refs.codeMode, project.input.codeMode, "ts500_tbdy");
  setSelectValue(refs.concreteModel, project.input.concreteModel, "mander_core_cover");
  syncPresetVisibilityForCodeMode();
  const materialPreset = isMaterialPresetId(project.input.materialPreset) ? project.input.materialPreset : "custom";
  setSelectValue(refs.materialPreset, materialPreset, "custom");
  if (materialPreset !== "custom") {
    applyMaterialPresetFromSelection(materialPreset);
  } else {
    setTextValue(refs.fck, project.input.fck, "30");
    setTextValue(refs.gammaC, project.input.gammaC, "1.5");
    setTextValue(refs.gammaS, project.input.gammaS, "1.15");
    setTextValue(refs.es, project.input.es, "200000");
    setTextValue(refs.epsCu, project.input.epsCu, "0.003");
  }

  const steelPreset = isSteelPresetId(project.input.steelPreset) ? project.input.steelPreset : "custom";
  setSelectValue(refs.steelPreset, steelPreset, "custom");
  if (steelPreset !== "custom") {
    applySteelPresetFromSelection(steelPreset);
  } else {
    setTextValue(refs.fyk, project.input.fyk, materialPreset === "custom" ? "420" : refs.fyk.value);
  }

  // Restore sections: use saved sections array, or fall back to single section from input
  if (project.sections && project.sections.length > 0) {
    state.sections = project.sections.map((s) => ({ ...s }));
    state.sectionIdCounter = Math.max(...state.sections.map((s) => s.id), 0);
  } else {
    const shapeVal = project.input.shape === "rect" || project.input.shape === "circle" ? project.input.shape : "rect";
    state.sections = [{
      id: 1, name: "S1", shape: shapeVal as Shape,
      width: project.input.width || "0.40", height: project.input.height || "0.60",
      diameter: project.input.diameter || "0.60",
      barsX: project.input.barsX || "4", barsY: project.input.barsY || "4",
      bars: project.input.bars || "12",
      useDoubleLayer: project.input.useDoubleLayer,
      barsX2: project.input.barsX2 || "2",
      barsY2: project.input.barsY2 || "2",
      bars2: project.input.bars2 || "6",
      layerSpacing: project.input.layerSpacing || "60",
      cover: project.input.cover || "0.04",
      tieDia: project.input.tieDia || "10", barDia: project.input.barDia || "16",
      tieSpacingConf: project.input.tieSpacingConf || "100",
      tieSpacingMid: project.input.tieSpacingMid || "150",
      coverToCenter: project.input.coverToCenter,
    }];
    state.sectionIdCounter = 1;
  }
  state.activeSectionIdx = 0;
  state.sectionFormExpanded = true;
  loadSectionToForm(0);
  renderSectionStrip();
  refs.useExpectedStrength.checked = project.input.useExpectedStrength;
  setTextValue(refs.expectedFckFactor, project.input.expectedFckFactor, "1.30");
  setTextValue(refs.expectedFykFactor, project.input.expectedFykFactor, "1.20");
  setTextValue(refs.mesh, project.input.mesh, "55");
  setTextValue(refs.nAngle, project.input.nAngle, "72");
  setTextValue(refs.nDepth, project.input.nDepth, "55");
  setTextValue(refs.phiP, project.input.phiP, "0.65");
  setTextValue(refs.phiM, project.input.phiM, "0.90");
  setTextValue(refs.pCutoffRatio, project.input.pCutoffRatio, "0.80");
  setTextValue(refs.pVisualScale, project.input.pVisualScale, "0.55");
  setTextValue(refs.surfaceOpacity, project.input.surfaceOpacity, "0.88");
  setSelectValue(refs.pSign, project.input.pSign, "compression_positive");
  setSelectValue(refs.projection, project.input.projection, "p-mx");
  refs.showNominalSurface.checked = project.input.showNominalSurface;
  state.showNominalSurface = project.input.showNominalSurface;
  setTextValue(refs.sliceAngle, project.input.sliceAngle, "0");
  refs.sliceHideZero.checked = project.input.sliceHideZero;
  setTextValue(refs.mcP, project.input.mcP, refs.mcP.value);
  setTextValue(refs.mcAngle, project.input.mcAngle, refs.mcAngle.value);
  setTextValue(refs.mcSteps, project.input.mcSteps, refs.mcSteps.value);
  refs.controlsAccordion.open = project.input.controlsOpen;

  state.loadSheet = project.loadSheet.length > 0 ? project.loadSheet.map((row) => ({ ...row })) : [emptyLoadSheetRow("L1")];
  state.selectedLoadRows.clear();
  state.loadSelectionAnchor = { row: 0, col: "name" };
  state.selectedLoadRange = makeLoadCellRange(state.loadSelectionAnchor, state.loadSelectionAnchor);
  state.activeLoadCell = { row: 0, col: "name" };
  state.loadMouseSelecting = false;

  setTextValue(refs.reportCompany, project.report.company);
  setTextValue(refs.reportDocTitle, project.report.documentTitle, "Kolon PMM Teknik Raporu");
  setTextValue(refs.reportProject, project.report.project);
  setTextValue(refs.reportClient, project.report.client);
  setTextValue(refs.reportPreparedBy, project.report.preparedBy);
  setTextValue(refs.reportCheckedBy, project.report.checkedBy);
  setTextValue(refs.reportRevision, project.report.revision, "R00");
  setTextValue(refs.reportDate, project.report.reportDate, formatDateInputValue(new Date()));
  refs.reportSecCover.checked = project.report.sections.cover;
  refs.reportSecSummary.checked = project.report.sections.summary;
  refs.reportSecVisuals.checked = project.report.sections.visuals;
  refs.reportSecLoadInput.checked = project.report.sections.loadInput;
  refs.reportSecLoadResults.checked = project.report.sections.loadResults;
  refs.reportSecCompliance.checked = project.report.sections.compliance;
  refs.reportSecMphi.checked = project.report.sections.mphi;
  refs.reportSecAppendix.checked = project.report.sections.appendix;
  state.reportLogoDataUrl = project.report.logoDataUrl;
  refs.reportLogo.value = "";
  refs.reportLogoName.textContent = project.report.logoDataUrl
    ? (project.report.logoName || (state.lang === "en" ? "Embedded logo" : "Gömülü logo"))
    : tx("labelReportLogoNoFile");

  persistProjectPrefs();
  bindShapeVisibility();
  bindExpectedStrengthVisibility();
  syncLoadsTextareaFromSheet();
  renderLoadSheetGrid();
  renderSurfaceOpacityValue();
  renderSectionPreview();
  clearAnalysisOutputs();
  syncControlsAccordionLayout();
}

async function readFileText(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error(tx("statusProjectInvalid")));
    reader.readAsText(file, "utf-8");
  });
}

function saveProjectFile(): void {
  const project = collectProjectFile();
  const fileBase = sanitizeProjectFilename(project.report.project || project.report.documentTitle || "pmmstudio-project");
  downloadText(`${fileBase}.pmm`, JSON.stringify(project, null, 2), "application/json;charset=utf-8");
  setStatus(`${tx("statusProjectSaved")} (${fileBase}.pmm)`, "info");
}

async function openProjectFile(): Promise<void> {
  const file = refs.projectFile.files?.[0];
  if (!file) return;
  try {
    const text = await readFileText(file);
    const project = parseProjectFile(text);
    applyProjectFile(project);
    setStatus(`${tx("statusProjectOpened")} (${file.name})`, "info");
  } finally {
    refs.projectFile.value = "";
  }
}

function formatIsoDateForDisplay(value: string): string {
  if (!value) return "-";
  const dt = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(dt.getTime())) return value;
  return dt.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

async function capturePlotlyImage(host: HTMLElement, width: number, height: number): Promise<string> {
  const currentPlotly = Plotly as any;
  try {
    const url = await currentPlotly.toImage(host, { format: "png", width, height });
    return String(url);
  } catch {
    return "";
  }
}

async function createMcImageForReport(data: McData, title: string): Promise<string> {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-12000px";
  host.style.top = "0";
  host.style.width = "860px";
  host.style.height = "420px";
  host.style.background = "#ffffff";
  document.body.appendChild(host);

  const curve = {
    type: "scatter",
    mode: "lines",
    x: data.phi,
    y: data.moment,
    line: { color: "#0f7f99", width: 2.6 },
    name: "M-φ",
  };
  const key = computeMcKeyPoints(data.phi, data.moment);
  const peak = {
    type: "scatter",
    mode: "markers+text",
    x: [key.phiPeak],
    y: [key.mu],
    marker: { color: "#c54242", size: 9, symbol: "diamond" },
    text: [`Mu=${fmt(key.mu, 1)} kNm`],
    textposition: "top right",
    textfont: { color: "#9c2d2d", size: 11 },
    name: "Mu",
  };
  const bilinear = {
    type: "scatter",
    mode: "lines",
    x: [0, key.phiY, key.phiU],
    y: [0, key.mu, key.mu],
    line: { color: "#2f9b5a", width: 1.3, dash: "dash" },
    name: "Bilineer",
  };

  const layout = {
    title: { text: title, x: 0.5, xanchor: "center" as const, font: { size: 15, color: "#17303f" } },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    margin: { l: 74, r: 18, t: 46, b: 64 },
    xaxis: {
      title: "φ (1/m)",
      gridcolor: "rgba(20,60,84,0.14)",
      zerolinecolor: "rgba(20,60,84,0.22)",
      color: "#17303f",
    },
    yaxis: {
      title: "M (kNm)",
      gridcolor: "rgba(20,60,84,0.14)",
      zerolinecolor: "rgba(20,60,84,0.22)",
      color: "#17303f",
    },
    legend: { orientation: "h" as const, y: -0.2 },
    font: { color: "#17303f" },
  };

  const config = { displayModeBar: false, responsive: false };
  try {
    const currentPlotly = Plotly as any;
    await currentPlotly.newPlot(host, [curve, bilinear, peak], layout, config);
    const url = await currentPlotly.toImage(host, { format: "png", width: 1100, height: 500 });
    currentPlotly.purge(host);
    host.remove();
    return String(url);
  } catch {
    host.remove();
    return "";
  }
}

function chooseReportAxialLoad(loads: LoadCase[], signMode: PSignMode): number {
  if (loads.length === 0) return 0;
  const factor = pSignFactorForMode(signMode);
  const compressionValues = loads.map((l) => l.pu * factor).filter((v) => Number.isFinite(v));
  if (compressionValues.length === 0) return loads[0].pu;
  const compMax = Math.max(...compressionValues);
  if (!Number.isFinite(compMax) || compMax <= 0) return loads[0].pu;
  return compMax * factor;
}

function reportInputRows(input: AppInput): Array<[string, string]> {
  return [
    ["Kod modu", input.codeMode],
    ["Kesit tipi", input.shape === "rect" ? "Dörtgen" : "Dairesel"],
    ["Beton modeli", input.concreteModel === "mander_core_cover" ? "Mander core+cover" : "TS500 eşdeğer blok"],
    ["Boyutlar", input.shape === "rect" ? `b=${fmt(input.widthM, 3)} m, h=${fmt(input.heightM, 3)} m` : `D=${fmt(input.diameterM, 3)} m`],
    ["Donatı", `Ø${fmt(input.barDiaMm, 0)} mm, etriye Ø${fmt(input.tieDiaMm, 0)} mm`],
    ["Donatı düzeni", input.shape === "rect"
      ? (
        input.useDoubleLayer
          ? `1.sıra üst/alt=${input.barsX}, sol/sağ=${input.barsY}; 2.sıra üst/alt=${input.barsX2}, sol/sağ=${input.barsY2}; a_row=${fmt(input.layerSpacingMm, 0)} mm`
          : `üst/alt=${input.barsX}, sol/sağ=${input.barsY}`
      )
      : (
        input.useDoubleLayer
          ? `1.halka=${input.bars}, 2.halka=${input.bars2}, a_row=${fmt(input.layerSpacingMm, 0)} mm`
          : `toplam bar=${input.bars}`
      )],
    ["Örtü", `${fmt(input.coverM, 3)} m (${input.coverToCenter ? "merkeze kadar" : "net örtü"})`],
    ["Malzemeler", `fck=${fmt(input.fck, 1)} MPa, fyk=${fmt(input.fyk, 1)} MPa, Es=${fmt(input.es, 0)} MPa`],
    ["Güvenlik", `gc=${fmt(input.gammaC, 2)}, gs=${fmt(input.gammaS, 2)}, phiP=${fmt(input.phiP, 2)}, phiM=${fmt(input.phiM, 2)}, cut-off=${fmt(input.pCutoffRatio, 2)}`],
    ["Analiz ağı", `fiber mesh=${input.mesh}, açı=${input.nAngle}, nötr eksen=${input.nDepth}`],
  ];
}

function selectedOptionText(select: HTMLSelectElement): string {
  return select.options[select.selectedIndex]?.textContent?.trim() ?? select.value;
}

async function buildReportSnapshot(): Promise<ReportSnapshot> {
  const axis = buildAxisExportData();
  if (!axis || state.results.length === 0 || !state.lastInput) {
    throw new Error(tx("statusReportExportEmpty"));
  }
  const meta = collectReportMeta();
  if (!meta.project || !meta.reportDate) {
    throw new Error(tx("statusReportMetaMissing"));
  }
  if (!hasAnyReportSection(meta.sections)) {
    throw new Error(tx("statusReportSectionNone"));
  }
  const wasm = state.wasm;
  if (!wasm) throw new Error(tx("statusWasmLoading"));

  const input = state.lastInput;
  const cfgOk = configureWasm(wasm, input);
  if (cfgOk !== 1) {
    throw new Error(state.lang === "en" ? "Cannot configure section for report." : "Rapor için kesit konfigürasyonu başarısız.");
  }

  const pForMc = chooseReportAxialLoad(input.loads, input.pSignMode);
  const pSignFactor = pSignFactorForMode(input.pSignMode);
  const mc0Data = computeMcDataAtAngle(wasm, input, pForMc, 0, 140, pSignFactor);
  const mc90Data = computeMcDataAtAngle(wasm, input, pForMc, 90, 140, pSignFactor);
  const [mc0Image, mc90Image] = await Promise.all([
    createMcImageForReport(mc0Data, "Moment-Eğrilik (0° / Mx)"),
    createMcImageForReport(mc90Data, "Moment-Eğrilik (90° / My)"),
  ]);

  const pmmCloudDataUrl = refs.plot.toDataURL("image/png");
  const [pmm3dDataUrl] = await Promise.all([
    capturePlotlyImage(refs.plot3d, 1100, 780),
  ]);
  const sectionPreviewDataUrl = refs.sectionPreview.toDataURL("image/png");

  const failCount = state.compliance.filter((check) => check.status === "fail").length;
  const passCount = state.compliance.filter((check) => check.status === "pass").length;
  const infoCount = state.compliance.filter((check) => check.status === "info").length;
  const dcrValues = state.results.map((row) => row.dcr).filter((value) => Number.isFinite(value));
  const maxDcr = dcrValues.length > 0 ? Math.max(...dcrValues) : 0;
  const minDcr = dcrValues.length > 0 ? Math.min(...dcrValues) : 0;

  return {
    meta,
    input,
    loadCases: [...input.loads],
    results: [...state.results],
    compliance: [...state.compliance],
    axis,
    pmmPointCount: input.nAngle * input.nDepth + 2,
    maxDcr,
    minDcr,
    failCount,
    passCount,
    infoCount,
    sectionPreviewDataUrl,
    pmmCloudDataUrl,
    pmm3dDataUrl,
    mphi0: {
      angleDeg: 0,
      axialLoadKn: pForMc,
      data: mc0Data,
      keyPoints: computeMcKeyPoints(mc0Data.phi, mc0Data.moment),
      imageDataUrl: mc0Image,
    },
    mphi90: {
      angleDeg: 90,
      axialLoadKn: pForMc,
      data: mc90Data,
      keyPoints: computeMcKeyPoints(mc90Data.phi, mc90Data.moment),
      imageDataUrl: mc90Image,
    },
  };
}

function renderMphiSummaryTable(section: MphiReportSection): string {
  return `
    <table class="kv-table">
      <tbody>
        <tr><th>Açı</th><td>${fmt(section.angleDeg, 0)}°</td></tr>
        <tr><th>P</th><td>${fmt(section.axialLoadKn, 1)} kN</td></tr>
        <tr><th>Mu</th><td>${fmt(section.keyPoints.mu, 2)} kNm</td></tr>
        <tr><th>φu</th><td>${section.keyPoints.phiU.toExponential(4)} 1/m</td></tr>
        <tr><th>φy (bilineer)</th><td>${section.keyPoints.phiY.toExponential(4)} 1/m</td></tr>
        <tr><th>μφ</th><td>${fmt(section.keyPoints.ductility, 2)}</td></tr>
      </tbody>
    </table>
  `;
}

function buildReportHtml(snapshot: ReportSnapshot, printMode: boolean): string {
  const generatedAt = new Date().toLocaleString("tr-TR");
  const sections = snapshot.meta.sections;
  const docTitle = snapshot.meta.documentTitle || "Kolon PMM Teknik Raporu";
  const safeLogo = snapshot.meta.logoDataUrl;
  const summaryRows = reportInputRows(snapshot.input)
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");
  const loadRows = snapshot.loadCases
    .map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${fmt(row.pu, 2)}</td><td>${fmt(row.mux, 2)}</td><td>${fmt(row.muy, 2)}</td></tr>`)
    .join("");
  const resultRows = snapshot.results
    .map((row) => `<tr>
      <td>${escapeHtml(row.name)}</td>
      <td>${fmt(row.pu, 2)}</td>
      <td>${fmt(row.mux, 2)}</td>
      <td>${fmt(row.muy, 2)}</td>
      <td>${fmt(row.pcap, 2)}</td>
      <td>${fmt(row.mxcap, 2)}</td>
      <td>${fmt(row.mycap, 2)}</td>
      <td>${fmt(row.scale, 4)}</td>
      <td>${fmt(row.dcr, 4)}</td>
      <td>${row.ok ? "UYGUN" : "UYGUN DEĞİL"}</td>
    </tr>`)
    .join("");
  const complianceRows = snapshot.compliance
    .map((row) => `<tr>
      <td>${escapeHtml(row.code)}</td>
      <td>${escapeHtml(row.clause)}</td>
      <td>${escapeHtml(row.description)}</td>
      <td>${escapeHtml(row.value)}</td>
      <td>${escapeHtml(row.limit)}</td>
      <td>${row.status === "pass" ? "UYGUN" : row.status === "fail" ? "UYGUN DEĞİL" : "VERİ GEREKLİ"}</td>
      <td>${escapeHtml(row.note)}</td>
    </tr>`)
    .join("");
  const mxRows = snapshot.axis.mx
    .map((row, i) => `<tr><td>${i + 1}</td><td>${fmt(row.p, 2)}</td><td>${fmt(row.mPos, 2)}</td><td>${fmt(row.mNeg, 2)}</td></tr>`)
    .join("");
  const myRows = snapshot.axis.my
    .map((row, i) => `<tr><td>${i + 1}</td><td>${fmt(row.p, 2)}</td><td>${fmt(row.mPos, 2)}</td><td>${fmt(row.mNeg, 2)}</td></tr>`)
    .join("");

  const imageMarkup = (url: string, alt: string, fallback: string): string => (
    url
      ? `<img src="${url}" alt="${escapeHtml(alt)}" />`
      : `<p class="small">${escapeHtml(fallback)}</p>`
  );

  const sectionBlocks: string[] = [];
  if (sections.cover) {
    sectionBlocks.push(`
    <section class="cover">
      <div class="cover-head">
        <div>
          <p class="kicker">${escapeHtml(snapshot.meta.company || "PMM STUDIO")}</p>
          <h1 class="title">${escapeHtml(docTitle)}</h1>
          <p class="subtitle">${escapeHtml(snapshot.meta.project)}</p>
        </div>
        ${safeLogo ? `<div class="cover-logo-wrap"><img class="cover-logo" src="${safeLogo}" alt="Kurumsal logo" /></div>` : ""}
      </div>
      <div class="cover-meta">
        <div class="meta-item"><div class="meta-k">Kurum/Firma</div><div class="meta-v">${escapeHtml(snapshot.meta.company || "-")}</div></div>
        <div class="meta-item"><div class="meta-k">Müşteri</div><div class="meta-v">${escapeHtml(snapshot.meta.client || "-")}</div></div>
        <div class="meta-item"><div class="meta-k">Hazırlayan</div><div class="meta-v">${escapeHtml(snapshot.meta.preparedBy || "-")}</div></div>
        <div class="meta-item"><div class="meta-k">Kontrol Eden</div><div class="meta-v">${escapeHtml(snapshot.meta.checkedBy || "-")}</div></div>
        <div class="meta-item"><div class="meta-k">Revizyon</div><div class="meta-v">${escapeHtml(snapshot.meta.revision || "-")}</div></div>
        <div class="meta-item"><div class="meta-k">Rapor Tarihi</div><div class="meta-v">${escapeHtml(formatIsoDateForDisplay(snapshot.meta.reportDate))}</div></div>
        <div class="meta-item"><div class="meta-k">Oluşturulma</div><div class="meta-v">${escapeHtml(generatedAt)}</div></div>
      </div>
    </section>`);
  }

  if (sections.summary) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Analiz Özeti</h2>
      <div class="summary-grid">
        <div class="summary-chip"><span class="k">Kod Modu</span><span class="v">${escapeHtml(selectedOptionText(refs.codeMode))}</span></div>
        <div class="summary-chip"><span class="k">Kesit Tipi</span><span class="v">${escapeHtml(selectedOptionText(refs.shape))}</span></div>
        <div class="summary-chip"><span class="k">Beton Modeli</span><span class="v">${escapeHtml(selectedOptionText(refs.concreteModel))}</span></div>
        <div class="summary-chip"><span class="k">PMM Noktası</span><span class="v">${fmt(snapshot.pmmPointCount, 0)}</span></div>
        <div class="summary-chip"><span class="k">DCR (min / max)</span><span class="v">${fmt(snapshot.minDcr, 4)} / ${fmt(snapshot.maxDcr, 4)}</span></div>
        <div class="summary-chip"><span class="k">Uyumlu</span><span class="v">${fmt(snapshot.passCount, 0)}</span></div>
        <div class="summary-chip"><span class="k">Uyumsuz</span><span class="v">${fmt(snapshot.failCount, 0)}</span></div>
        <div class="summary-chip"><span class="k">Ek Kontrol</span><span class="v">${fmt(snapshot.infoCount, 0)}</span></div>
      </div>
      <table class="kv-table"><tbody>${summaryRows}</tbody></table>
    </section>`);
  }

  if (sections.visuals) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Kesit Yerleşimi ve PMM Görselleri</h2>
      <div class="fig-grid">
        <div class="img-wrap">${imageMarkup(snapshot.sectionPreviewDataUrl, "Kesit yerleşimi", "Kesit görseli üretilemedi.")}</div>
        <div class="img-wrap">${imageMarkup(snapshot.pmmCloudDataUrl, "PMM nokta bulutu", "PMM 2B görseli üretilemedi.")}</div>
        <div class="img-wrap">${imageMarkup(snapshot.pmm3dDataUrl, "PMM 3B yüzeyi", "PMM 3B görseli üretilemedi.")}</div>
      </div>
    </section>`);
  }

  if (sections.loadInput) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Yük Girdileri</h2>
      <table>
        <thead><tr><th>Yük Adı</th><th>Pu (kN)</th><th>Mux (kNm)</th><th>Muy (kNm)</th></tr></thead>
        <tbody>${loadRows || `<tr><td colspan="4">-</td></tr>`}</tbody>
      </table>
    </section>`);
  }

  if (sections.loadResults) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Yük Sonuçları</h2>
      <table>
        <thead>
          <tr>
            <th>Yük</th><th>Pu</th><th>Mux</th><th>Muy</th><th>Pcap</th><th>Mxcap</th><th>Mycap</th><th>Scale</th><th>DCR</th><th>Durum</th>
          </tr>
        </thead>
        <tbody>${resultRows || `<tr><td colspan="10">-</td></tr>`}</tbody>
      </table>
    </section>`);
  }

  if (sections.compliance) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Kod Uyumluluk Kontrolü</h2>
      <table>
        <thead><tr><th>Kod</th><th>Madde</th><th>Kontrol</th><th>Değer</th><th>Sınır/Kural</th><th>Sonuç</th><th>Not</th></tr></thead>
        <tbody>${complianceRows || `<tr><td colspan="7">-</td></tr>`}</tbody>
      </table>
    </section>`);
  }

  if (sections.mphi) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Moment-Eğrilik (M-φ) Sonuçları</h2>
      <p class="section-note">Bu bölüm, rapor için otomatik olarak 0° (Mx) ve 90° (My) yönlerinde tekrar hesaplanmıştır.</p>
      <div class="fig-grid split-2">
        <div>
          <div class="img-wrap">${imageMarkup(snapshot.mphi0.imageDataUrl, "M-φ 0 derece", "M-φ 0° görseli üretilemedi.")}</div>
          ${renderMphiSummaryTable(snapshot.mphi0)}
        </div>
        <div>
          <div class="img-wrap">${imageMarkup(snapshot.mphi90.imageDataUrl, "M-φ 90 derece", "M-φ 90° görseli üretilemedi.")}</div>
          ${renderMphiSummaryTable(snapshot.mphi90)}
        </div>
      </div>
    </section>`);
  }

  if (sections.appendix) {
    sectionBlocks.push(`
    <section class="section">
      <h2>Ekler - Mx/My Dış Zarf Tabloları</h2>
      <p class="small">Mx açısı: ${fmt(snapshot.axis.mxAngleDeg, 1)}° | My açısı: ${fmt(snapshot.axis.myAngleDeg, 1)}°</p>
      <div class="split-2">
        <div>
          <h3>Mx dış zarfı</h3>
          <table>
            <thead><tr><th>No</th><th>P (kN)</th><th>Mx+ (kNm)</th><th>Mx- (kNm)</th></tr></thead>
            <tbody>${mxRows || `<tr><td colspan="4">-</td></tr>`}</tbody>
          </table>
        </div>
        <div>
          <h3>My dış zarfı</h3>
          <table>
            <thead><tr><th>No</th><th>P (kN)</th><th>My+ (kNm)</th><th>My- (kNm)</th></tr></thead>
            <tbody>${myRows || `<tr><td colspan="4">-</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </section>`);
  }

  const autoPrintScript = printMode
    ? `<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),180));</script>`
    : "";

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>PMM Studio Teknik Rapor</title>
  <style>
    :root { --ink:#11283a; --muted:#4d6577; --line:#ced8e1; --soft:#edf3f7; --accent:#0f7f99; --fig-max-width:15.8cm; --logo-width:3.9cm; --logo-max-height:1.7cm; }
    * { box-sizing: border-box; }
    body { margin:0; font-family:"Segoe UI", "Arial", sans-serif; color:var(--ink); background:#fff; }
    .report { width: 100%; max-width: 18.6cm; margin:0 auto; padding:18px 20px 28px; }
    .cover-head { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:14px; }
    .cover-logo-wrap { width:var(--logo-width); max-width:var(--logo-width); flex:0 0 var(--logo-width); display:flex; justify-content:flex-end; align-items:flex-start; text-align:right; }
    .cover-logo { width:100%; max-height:var(--logo-max-height); height:auto; object-fit:contain; object-position:right top; }
    .cover { border:1px solid var(--line); border-radius:14px; padding:18px 20px; background:linear-gradient(180deg, #f8fcff, #ffffff); }
    .kicker { margin:0; font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); }
    .title { margin:6px 0 6px; font-size:26px; line-height:1.14; font-weight:750; }
    .subtitle { margin:0 0 12px; color:var(--muted); font-size:13px; }
    .cover-meta { display:grid; grid-template-columns: repeat(auto-fit, minmax(148px,1fr)); gap:8px; }
    .meta-item { border:1px solid var(--line); border-radius:10px; padding:8px 10px; background:#fff; }
    .meta-k { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px; }
    .meta-v { font-size:13px; font-weight:600; }
    .section { margin-top:12px; border:1px solid var(--line); border-radius:12px; padding:11px 12px; background:#fff; }
    h2 { margin:0 0 8px; font-size:17px; line-height:1.22; }
    h3 { margin:8px 0 6px; font-size:13px; }
    .section-note { margin:0 0 6px; color:var(--muted); font-size:11px; }
    .split-2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
    .fig-grid { display:grid; grid-template-columns:1fr; gap:10px; }
    .img-wrap { border:1px solid var(--line); border-radius:10px; padding:6px; background:var(--soft); text-align:center; width:min(100%, var(--fig-max-width)); margin-inline:auto; }
    .img-wrap img { width:100%; height:auto; display:block; border-radius:6px; }
    table { width:100%; border-collapse:collapse; }
    th, td { border:1px solid var(--line); padding:4px 6px; font-size:10.2px; line-height:1.24; text-align:right; vertical-align:top; }
    th:first-child, td:first-child { text-align:left; }
    thead th { background:var(--soft); font-weight:700; }
    .kv-table th { width:38%; background:var(--soft); }
    .summary-grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:6px; margin-bottom:8px; }
    .summary-chip { border:1px solid var(--line); border-radius:9px; padding:6px 8px; background:var(--soft); }
    .summary-chip .k { display:block; font-size:11px; color:var(--muted); margin-bottom:3px; }
    .summary-chip .v { font-size:12.5px; font-weight:700; color:var(--ink); }
    .small { font-size:10px; color:var(--muted); }
    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .report { max-width: 18.6cm; padding: 0; }
      .cover-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
      .cover-logo-wrap { width:var(--logo-width); max-width:var(--logo-width); flex:0 0 var(--logo-width); margin-top:0; text-align:right; }
      .cover { padding:14px 16px; }
      .section { margin-top:10px; padding:9px 10px; }
      .split-2 { grid-template-columns: 1fr; gap:6px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap:5px; margin-bottom:6px; }
      .section { break-inside: auto; page-break-inside: auto; }
      h2, h3 { break-after: avoid-page; page-break-after: avoid; }
      .img-wrap { max-width: var(--fig-max-width); break-inside: avoid-page; page-break-inside: avoid; }
      .img-wrap img { max-width: var(--fig-max-width); }
      table { break-inside: auto; page-break-inside: auto; }
      thead { display: table-header-group; }
      tr { break-inside: avoid-page; page-break-inside: avoid; }
      th, td { padding: 3.5px 5px; font-size: 9.6px; line-height: 1.18; }
      .title { font-size: 22px; margin-bottom: 4px; }
      .subtitle { margin-bottom: 8px; font-size: 12px; }
      .meta-item { padding: 6px 8px; }
      .summary-chip { padding: 5px 7px; }
    }
  </style>
  ${autoPrintScript}
</head>
<body>
  <div class="report">
    ${sectionBlocks.join("\n")}
  </div>
</body>
</html>`;
}

async function exportWordReport(): Promise<void> {
  const snapshot = await buildReportSnapshot();
  const html = buildReportHtml(snapshot, false);
  downloadDoc("pmmstudio_rapor.doc", html);
  setStatus(tx("statusReportExported"), "info");
}

async function exportPdfReport(): Promise<void> {
  const popup = window.open("about:blank", "_blank");
  if (!popup) {
    throw new Error(state.lang === "en" ? "Popup blocker prevented PDF preview." : "Popup engellendi. PDF önizleme açılamadı.");
  }
  const writePopupHtml = (html: string): boolean => {
    try {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      return true;
    } catch {
      return false;
    }
  };
  const writePopupBlobFallback = (html: string): void => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    popup.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const loadingHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Rapor hazırlanıyor...</title></head><body style="font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#17323d;">Rapor hazırlanıyor...</body></html>`;
  if (!writePopupHtml(loadingHtml)) {
    writePopupBlobFallback(loadingHtml);
  }

  try {
    const snapshot = await buildReportSnapshot();
    const html = buildReportHtml(snapshot, true);
    if (!writePopupHtml(html)) {
      writePopupBlobFallback(html);
    }
    setStatus(tx("statusReportPdfExported"), "info");
  } catch (error) {
    const msg = String(error instanceof Error ? error.message : error);
    const errorHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Rapor hatası</title></head><body style="font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#8b1e1e;">PDF raporu oluşturulamadı: ${escapeHtml(msg)}</body></html>`;
    if (!writePopupHtml(errorHtml)) {
      writePopupBlobFallback(errorHtml);
    }
    throw error;
  }
}

async function loadWasm(): Promise<WasmExports> {
  const imports = {
    env: {
      abort: () => {
        throw new Error("WASM abort");
      },
      seed: () => 0,
    },
  };
  const response = await fetch("/wasm/pmm.wasm");
  if (!response.ok) throw new Error("WASM dosyasi bulunamadi.");
  try {
    const { instance } = await WebAssembly.instantiateStreaming(response, imports);
    return instance.exports as unknown as WasmExports;
  } catch {
    const binary = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(binary, imports);
    return instance.exports as unknown as WasmExports;
  }
}

function showError(error: unknown): void {
  setStatus(String(error instanceof Error ? error.message : error), "danger");
}

function must<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element not found: ${id}`);
  return el as T;
}

function n(v: string): number {
  const normalized = v.trim().replace(/\s+/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) throw new Error(`Sayısal değer geçersiz: ${v}`);
  return value;
}

function ni(v: string): number {
  const value = n(v);
  return Math.round(value);
}

function toCsvNumber(v: number): string {
  if (!Number.isFinite(v)) return "";
  const rounded = Math.abs(v) < 1e-12 ? 0 : v;
  return rounded.toFixed(6).replace(/\.?0+$/, "");
}

function toFixedPlain(v: number, d: number): string {
  if (!Number.isFinite(v)) return "-";
  const rounded = Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v;
  return rounded.toFixed(d);
}

function fmtSlice(v: number, d = 1): string {
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
}

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

interface DesignStrengths {
  fckPmm: number;
  fykPmm: number;
  expectedApplied: boolean;
  expectedFckFactor: number;
  expectedFykFactor: number;
}

function resolveDesignStrengths(input: AppInput): DesignStrengths {
  const expectedFckFactor = clamp(input.expectedFckFactor, 1.0, 2.0);
  const expectedFykFactor = clamp(input.expectedFykFactor, 1.0, 2.0);
  const expectedApplied = input.codeMode === "ts500_tbdy" && input.useExpectedStrength;

  return {
    fckPmm: expectedApplied ? input.fck * expectedFckFactor : input.fck,
    fykPmm: expectedApplied ? input.fyk * expectedFykFactor : input.fyk,
    expectedApplied,
    expectedFckFactor,
    expectedFykFactor,
  };
}

function fmt(v: number, d = 2): string {
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
}

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

let mcResizeToken = 0;

function mcPlotHeightPx(): number {
  const acc = document.getElementById("mc-accordion");
  const isFullscreen = !!acc?.classList.contains("mc-fullscreen");
  const vh = window.innerHeight || 900;
  return isFullscreen
    ? clamp(Math.round(vh * 0.58), 360, 720)
    : clamp(Math.round(vh * 0.34), 320, 460);
}

function updateMcFullscreenButtonLabel(): void {
  const acc = document.getElementById("mc-accordion");
  const expanded = !!acc?.classList.contains("mc-fullscreen");
  refs.mcFullscreenBtn.textContent = expanded ? tx("btnMcCollapse") : tx("btnMcFullscreen");
}

function resizeMcPlotsDeferred(delayMs = 80): void {
  if (!state.mcData || state.mcData.phi.length === 0) return;
  mcResizeToken += 1;
  const token = mcResizeToken;
  window.setTimeout(() => {
    if (token !== mcResizeToken) return;
    const targetHeight = mcPlotHeightPx();
    try {
      (Plotly as any).relayout(refs.plotMc, { height: targetHeight });
      (Plotly as any).relayout(refs.plotMcStrain, { height: targetHeight });
      (Plotly as any).Plots.resize(refs.plotMc);
      (Plotly as any).Plots.resize(refs.plotMcStrain);
    } catch {
      // Plot containers may not be ready yet during early layout transitions.
    }
  }, delayMs);
}

function toggleMcFullscreen(): void {
  const acc = document.getElementById("mc-accordion");
  if (!acc) return;
  const entering = !acc.classList.contains("mc-fullscreen");
  acc.classList.toggle("mc-fullscreen", entering);
  refs.mcCloseBtn.classList.toggle("mc-close-visible", entering);
  if (entering) {
    const body = acc.querySelector<HTMLElement>(".accordion-body");
    if (body) body.scrollTop = 0;
  }
  updateMcFullscreenButtonLabel();
  resizeMcPlotsDeferred(90);
  resizeMcPlotsDeferred(260);
}

function closeMcFullscreen(): void {
  const acc = document.getElementById("mc-accordion");
  if (!acc) return;
  acc.classList.remove("mc-fullscreen");
  refs.mcCloseBtn.classList.remove("mc-close-visible");
  updateMcFullscreenButtonLabel();
  resizeMcPlotsDeferred(90);
  resizeMcPlotsDeferred(260);
}

function mcClipboardText(data: McData): string {
  const lines = ["No\tPhi_1/m\tMoment_kNm\tNA_m\tEps_c\tEps_s"];
  for (let i = 0; i < data.phi.length; i++) {
    lines.push(`${i + 1}\t${data.phi[i].toExponential(5)}\t${data.moment[i].toFixed(2)}\t${data.neutralAxis[i].toFixed(4)}\t${data.epsC[i].toExponential(4)}\t${data.epsS[i].toExponential(4)}`);
  }
  return lines.join("\n");
}

async function copyMcData(): Promise<void> {
  if (!state.mcData || state.mcData.phi.length === 0) return;
  await writeClipboardText(mcClipboardText(state.mcData));
  setStatus(tx("statusMcCopied"), "info");
}

function exportMcDataToCsv(): void {
  if (!state.mcData || state.mcData.phi.length === 0) return;
  const rows = ["No,Phi_1/m,Moment_kNm,NA_m,Eps_c,Eps_s"];
  for (let i = 0; i < state.mcData.phi.length; i++) {
    rows.push(`${i + 1},${state.mcData.phi[i].toExponential(5)},${state.mcData.moment[i].toFixed(2)},${state.mcData.neutralAxis[i].toFixed(4)},${state.mcData.epsC[i].toExponential(4)},${state.mcData.epsS[i].toExponential(4)}`);
  }
  downloadText("moment_curvature.csv", rows.join("\n"));
}

function updateMcHoverInfo(data: McData, idx: number): void {
  if (idx < 0 || idx >= data.phi.length) return;
  refs.mcHoverInfo.classList.remove("hidden");
  const epsCLabel = state.lang === "en" ? "Concrete Strain:" : "Beton Birim Uzama:";
  const epsSLabel = state.lang === "en" ? "Steel Strain:" : "Çelik Birim Uzama:";
  const naLabel = state.lang === "en" ? "Neutral Axis:" : "Tarafsız Eksen:";
  // Update labels (they're static in HTML, so update via siblings)
  const labels = refs.mcHoverInfo.querySelectorAll(".mc-hi-label");
  if (labels[0]) labels[0].textContent = epsCLabel;
  if (labels[1]) labels[1].textContent = epsSLabel;
  if (labels[2]) labels[2].textContent = naLabel;
  refs.mcHiEpsC.textContent = data.epsC[idx].toExponential(4);
  refs.mcHiEpsS.textContent = data.epsS[idx].toExponential(4);
  refs.mcHiNA.textContent = (data.neutralAxis[idx] * 1000).toFixed(1) + " mm";
}

function renderStrainDiagram(data: McData, idx: number): void {
  if (idx < 0 || idx >= data.phi.length) return;
  const host = refs.plotMcStrain;
  const phi_i = data.phi[idx];
  const c_i = data.neutralAxis[idx];
  const epsC_i = data.epsC[idx];

  // Compute section depth from lastInput
  let depth = 0.5; // fallback
  if (state.lastInput) {
    if (state.lastInput.shape === "rect") {
      depth = state.lastInput.heightM;
    } else {
      depth = state.lastInput.diameterM;
    }
  }

  // Strain profile: linear from epsC_i at top to eps_bottom at bottom
  const sMax = depth; // simplified: section depth
  const epsBottom = phi_i * (c_i - sMax);

  // Build strain profile line (top to bottom)
  const yPositions = [0, c_i * 1000, depth * 1000]; // in mm
  const strainValues = [epsC_i, 0, epsBottom];

  const sceneBg = state.theme === "light" ? "#f7fbff" : "#06111a";
  const lineColor = state.theme === "light" ? "#d84b4b" : "#ff7f7f";
  const naColor = state.theme === "light" ? "#1a858e" : "#5be7ff";
  const gridColor = state.theme === "light" ? "rgba(41,74,88,0.18)" : "rgba(159,197,202,0.18)";
  const textColor = state.theme === "light" ? "#17323d" : "#cde6eb";

  const strainTrace = {
    type: "scatter",
    mode: "lines+markers",
    x: strainValues,
    y: yPositions,
    name: state.lang === "en" ? "Strain Profile" : "Birim Uzama Profili",
    line: { color: lineColor, width: 2.5 },
    marker: { size: 6, color: lineColor },
    hovertemplate: `ε: %{x:.5f}<br>y: %{y:.1f} mm<extra></extra>`,
  };

  // Neutral axis line (horizontal dashed)
  const naTrace = {
    type: "scatter",
    mode: "lines",
    x: [Math.min(epsBottom, -Math.abs(epsC_i) * 0.3), Math.max(epsC_i, Math.abs(epsBottom) * 0.3)],
    y: [c_i * 1000, c_i * 1000],
    name: state.lang === "en" ? "Neutral Axis" : "Tarafsız Eksen",
    line: { color: naColor, width: 1.5, dash: "dash" },
    hoverinfo: "skip",
  };

  // Zero strain vertical reference
  const zeroTrace = {
    type: "scatter",
    mode: "lines",
    x: [0, 0],
    y: [0, depth * 1000],
    showlegend: false,
    line: { color: gridColor, width: 1 },
    hoverinfo: "skip",
  };

  const yLabel = state.lang === "en" ? "Depth (mm)" : "Derinlik (mm)";
  const xLabel = state.lang === "en" ? "Strain (ε)" : "Birim Uzama (ε)";

  const layout = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: sceneBg,
    height: mcPlotHeightPx(),
    margin: { l: 60, r: 20, t: 52, b: 92 },
    title: {
      text: state.lang === "en" ? "Strain Diagram" : "Birim Uzama Diyagramı",
      font: { color: textColor, size: 13 },
      x: 0.5,
      xanchor: "center" as const,
      y: 0.98,
      yanchor: "top" as const,
    },
    xaxis: {
      title: { text: xLabel, font: { color: textColor, size: 11 } },
      color: textColor,
      gridcolor: gridColor,
      zerolinecolor: gridColor,
    },
    yaxis: {
      title: { text: yLabel, font: { color: textColor, size: 11 } },
      color: textColor,
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      autorange: "reversed" as const,
    },
    legend: {
      font: { color: textColor, size: 10 },
      bgcolor: "rgba(0,0,0,0)",
      orientation: "h" as const,
      x: 0.5,
      xanchor: "center" as const,
      y: -0.22,
      yanchor: "top" as const,
    },
    font: { color: textColor },
    showlegend: true,
  };

  const config = {
    responsive: true,
    displaylogo: false,
    displayModeBar: false,
    scrollZoom: false,
    staticPlot: false,
  };

  try {
    (Plotly as any).react(host, [zeroTrace, strainTrace, naTrace], layout, config);
  } catch (e) {
    host.textContent = String(e);
  }
}
