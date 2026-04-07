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
        <div class="hero-controls">
          <label class="compact-field">
            <span data-i18n="labelLanguage">Dil / Language</span>
            <select id="lang" class="compact-select">
              <option value="tr" data-i18n="optLangTr">Türkçe</option>
              <option value="en" data-i18n="optLangEn">English</option>
            </select>
          </label>

          <label class="compact-field">
            <span data-i18n="labelTheme">Tema</span>
            <select id="theme" class="compact-select">
              <option value="dark" data-i18n="optThemeDark">Karanlık</option>
              <option value="light" data-i18n="optThemeLight">Aydınlık</option>
            </select>
          </label>
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

    <main class="workspace">
      <section class="panel controls">
        <div class="panel-head panel-head-inline">
          <h2 data-i18n="headingInputs">Girdi ve Kesit Tanımı</h2>
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
                <span data-i18n="labelShape">Kesit Tipi</span>
                <select id="shape">
                  <option value="rect" data-i18n="optShapeRect">Dörtgen</option>
                  <option value="circle" data-i18n="optShapeCircle">Dairesel</option>
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
            </div>
            <div class="grid controls-grid controls-grid--section">
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
          </section>

          <section class="input-group input-group--analysis">
            <div class="input-group-head">
              <h3 data-i18n="headingGroupAnalysis">Malzeme ve Analiz</h3>
            </div>
            <div class="grid controls-grid controls-grid--analysis">
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
          </div>
          <div class="loads">
            <label>
              <span data-i18n="labelLoads">Yükler (satır başına: </span><code data-i18n="labelLoadsFmtA">ad,Pu,Mux,Muy</code><span data-i18n="labelLoadsOr"> veya </span><code data-i18n="labelLoadsFmtB">Pu,Mux,Muy</code><span data-i18n="labelLoadsEnd">)</span>
              <textarea id="loads-text" rows="7">L1,1200,120,80
L2,1800,200,140
L3,650,90,45</textarea>
            </label>
            <label>
              <span data-i18n="labelCsvLoad">CSV yük dosyası (opsiyonel; kolonlar: name,Pu,Mux,Muy)</span>
              <input id="loads-file" type="file" accept=".csv,text/csv" />
            </label>
          </div>

          <div class="actions">
            <button id="export-results" disabled data-i18n="btnExportResults">Sonuç CSV</button>
            <button id="export-surface" disabled data-i18n="btnExportSurface">PMM Nokta CSV</button>
            <button id="export-report" disabled data-i18n="btnExportReport">Rapor Word</button>
          </div>
          <p id="rho-display" class="status rho-line"></p>
        </section>
      </section>

      <div class="right-col-wrap" style="display: flex; flex-direction: column; gap: 16px;">
        <section class="panel viz">
          <div class="viz-head">
          <h2 data-i18n="headingCloud">PMM Nokta Bulutu</h2>
          <label class="compact-field">
          <span data-i18n="labelProjection">Görünüm</span>
            <select id="projection">
              <option value="p-mx" data-i18n="optProjPMx">P - Mx</option>
              <option value="p-my" data-i18n="optProjPMy">P - My</option>
              <option value="mx-my" data-i18n="optProjMxMy">Mx - My</option>
            </select>
          </label>
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
  lang: must<HTMLSelectElement>("lang"),
  theme: must<HTMLSelectElement>("theme"),
  codeMode: must<HTMLSelectElement>("code-mode"),
  concreteModel: must<HTMLSelectElement>("concrete-model"),
  shape: must<HTMLSelectElement>("shape"),
  width: must<HTMLInputElement>("width"),
  height: must<HTMLInputElement>("height"),
  diameter: must<HTMLInputElement>("diameter"),
  barsX: must<HTMLInputElement>("bars-x"),
  barsY: must<HTMLInputElement>("bars-y"),
  bars: must<HTMLInputElement>("bars"),
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
  pSign: must<HTMLSelectElement>("p-sign"),
  loadsText: must<HTMLTextAreaElement>("loads-text"),
  loadsFile: must<HTMLInputElement>("loads-file"),
  runBtn: must<HTMLButtonElement>("run-btn"),
  exportResults: must<HTMLButtonElement>("export-results"),
  exportSurface: must<HTMLButtonElement>("export-surface"),
  exportReport: must<HTMLButtonElement>("export-report"),
  status: must<HTMLParagraphElement>("status"),
  statusLog: must<HTMLOListElement>("status-log"),
  rhoDisplay: must<HTMLParagraphElement>("rho-display"),
  sectionPreview: must<HTMLCanvasElement>("section-preview"),
  sectionPreviewMeta: must<HTMLParagraphElement>("section-preview-meta"),
  projection: must<HTMLSelectElement>("projection"),
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
  fieldBarsX: must<HTMLElement>("field-bars-x"),
  fieldBarsY: must<HTMLElement>("field-bars-y"),
  fieldBars: must<HTMLElement>("field-bars"),
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
} = {
  wasm: null,
  results: [],
  surface: [],
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
    labelCover: "Cover (m)",
    labelTieDia: "Etriye çapı (mm)",
    labelBarDia: "Boyuna donatı çapı (mm)",
    labelTieSpacingConf: "Sarılma bölgesi etriye aralığı s_conf (mm)",
    labelTieSpacingMid: "Orta bölge etriye aralığı s_mid (mm)",
    labelFck: "fck (MPa)",
    labelFyk: "fyk (MPa)",
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
    labelPSign: "P işaret konvansiyonu",
    optPSignPositive: "Basınç (+)",
    optPSignNegative: "Basınç (-) [SAP2000]",
    labelCoverToCenter: "Cover değeri donatı merkezine kadar verildi",
    labelExpectedStrength: "TBDY beklenen dayanım artışı aktif (önerilen: fce=1.30*fck, fye=1.20*fyk)",
    labelExpectedFckFactor: "Beklenen beton katsayısı fce/fck",
    labelExpectedFykFactor: "Beklenen çelik katsayısı fye/fyk",
    headingSectionPreview: "Kesit ve Donatı Yerleşimi",
    labelLoads: "Yükler (satır başına: ",
    labelLoadsFmtA: "ad,Pu,Mux,Muy",
    labelLoadsOr: " veya ",
    labelLoadsFmtB: "Pu,Mux,Muy",
    labelLoadsEnd: ")",
    labelCsvLoad: "CSV yük dosyası (opsiyonel; kolonlar: name,Pu,Mux,Muy)",
    btnRun: "PMM Hesapla",
    btnExportResults: "Sonuç CSV",
    btnExportSurface: "PMM Nokta CSV",
    btnExportReport: "Rapor Word",
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
    labelCover: "Cover (m)",
    labelTieDia: "Tie diameter (mm)",
    labelBarDia: "Longitudinal bar diameter (mm)",
    labelTieSpacingConf: "Confinement tie spacing s_conf (mm)",
    labelTieSpacingMid: "Middle-zone tie spacing s_mid (mm)",
    labelFck: "fck (MPa)",
    labelFyk: "fyk (MPa)",
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
    labelPSign: "P sign convention",
    optPSignPositive: "Compression (+)",
    optPSignNegative: "Compression (-) [SAP2000]",
    labelCoverToCenter: "Cover is given to bar center",
    labelExpectedStrength: "Enable TBDY expected-strength increase (recommended: fce=1.30*fck, fye=1.20*fyk)",
    labelExpectedFckFactor: "Expected concrete factor fce/fck",
    labelExpectedFykFactor: "Expected steel factor fye/fyk",
    headingSectionPreview: "Section & Rebar Layout",
    labelLoads: "Loads (per line: ",
    labelLoadsFmtA: "name,Pu,Mux,Muy",
    labelLoadsOr: " or ",
    labelLoadsFmtB: "Pu,Mux,Muy",
    labelLoadsEnd: ")",
    labelCsvLoad: "CSV load file (optional; columns: name,Pu,Mux,Muy)",
    btnRun: "Run PMM",
    btnExportResults: "Results CSV",
    btnExportSurface: "PMM Points CSV",
    btnExportReport: "Word Report",
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
    btnMcCopy: "Copy Data",
    btnMcExport: "Excel (CSV)",
    statusMcCopied: "M-φ data copied to clipboard.",
  },
} as const;

type I18nKey = keyof typeof I18N.tr;

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

function applyLocale(): void {
  const all = document.querySelectorAll<HTMLElement>("[data-i18n]");
  for (const el of all) {
    const key = el.dataset.i18n as I18nKey | undefined;
    if (!key) continue;
    el.textContent = tx(key);
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
  render3dSliceTable(state.surface);
  renderSectionPreview();
}

function applyTheme(theme: ThemeMode): void {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.body.classList.toggle("theme-light", theme === "light");
  document.body.classList.toggle("theme-dark", theme === "dark");
  renderPlot(state.surface, state.results);
  renderPlot3d(state.surface, state.results);
  if (state.mcData) renderMcPlot(state.mcData);
}

init().catch((error) => {
  setStatus(state.lang === "en" ? `Error: ${String(error)}` : `Hata: ${String(error)}`, "danger");
});

async function init(): Promise<void> {
  const savedLang = localStorage.getItem("pmm-lang");
  if (savedLang === "tr" || savedLang === "en") state.lang = savedLang;
  refs.lang.value = state.lang;

  const savedTheme = localStorage.getItem("pmm-theme");
  if (savedTheme === "dark" || savedTheme === "light") state.theme = savedTheme;
  refs.theme.value = state.theme;
  applyTheme(state.theme);

  const savedPSign = localStorage.getItem("pmm-p-sign");
  if (savedPSign === "compression_positive" || savedPSign === "compression_negative") {
    refs.pSign.value = savedPSign;
  }

  const savedConcreteModel = localStorage.getItem("pmm-concrete-model");
  if (savedConcreteModel === "ts500_block" || savedConcreteModel === "mander_core_cover") {
    refs.concreteModel.value = savedConcreteModel;
  }
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

  applyLocale();
  bindShapeVisibility();
  bindExpectedStrengthVisibility();
  applyCodeModePreset(false);
  bindSectionPreviewListeners();
  renderSectionPreview();
  refs.shape.addEventListener("change", bindShapeVisibility);
  refs.codeMode.addEventListener("change", () => {
    localStorage.setItem("pmm-code-mode", refs.codeMode.value);
    applyCodeModePreset(true);
    bindExpectedStrengthVisibility();
  });
  refs.lang.addEventListener("change", () => {
    state.lang = refs.lang.value as Lang;
    localStorage.setItem("pmm-lang", state.lang);
    applyLocale();
    renderPlot(state.surface, state.results);
    renderPlot3d(state.surface, state.results);
  });
  refs.theme.addEventListener("change", () => {
    const value = refs.theme.value as ThemeMode;
    localStorage.setItem("pmm-theme", value);
    applyTheme(value);
  });
  refs.projection.addEventListener("change", () => {
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
  refs.sliceAngle.addEventListener("input", () => {
    const parsed = Number(refs.sliceAngle.value.replace(",", "."));
    state.sliceAngleDeg = Number.isFinite(parsed) ? normalizeDeg(parsed) : 0;
    render3dSliceTable(state.surface);
  });
  refs.sliceHideZero.addEventListener("change", () => {
    render3dSliceTable(state.surface);
  });
  refs.sliceCopy.addEventListener("click", () => copySliceTableToClipboard().catch(showError));
  refs.runBtn.addEventListener("click", () => runAnalysis().catch(showError));
  refs.exportResults.addEventListener("click", exportResultsCsv);
  refs.exportSurface.addEventListener("click", exportSurfaceCsv);
  refs.exportReport.addEventListener("click", exportWordReport);
  refs.mcRunBtn.addEventListener("click", () => runMomentCurvature().catch(showError));
  refs.mcFullscreenBtn.addEventListener("click", toggleMcFullscreen);
  refs.mcCloseBtn.addEventListener("click", closeMcFullscreen);
  refs.mcCopyBtn.addEventListener("click", () => copyMcData().catch(showError));
  refs.mcExportBtn.addEventListener("click", exportMcDataToCsv);

  setStatus(tx("statusWasmLoading"), "info");
  state.wasm = await loadWasm();
  setStatus(tx("statusWasmReady"), "info");
}

function bindShapeVisibility(): void {
  const shape = refs.shape.value as Shape;
  const rect = shape === "rect";
  refs.fieldWidth.classList.toggle("hidden", !rect);
  refs.fieldHeight.classList.toggle("hidden", !rect);
  refs.fieldBarsX.classList.toggle("hidden", !rect);
  refs.fieldBarsY.classList.toggle("hidden", !rect);
  refs.fieldDiameter.classList.toggle("hidden", rect);
  refs.fieldBars.classList.toggle("hidden", rect);
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

function applyCodeModePreset(notify: boolean): void {
  const codeMode = refs.codeMode.value as CodeMode;
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

function bindSectionPreviewListeners(): void {
  const ids: HTMLElement[] = [
    refs.shape,
    refs.width,
    refs.height,
    refs.diameter,
    refs.barsX,
    refs.barsY,
    refs.bars,
    refs.cover,
    refs.tieDia,
    refs.barDia,
    refs.coverToCenter,
  ];

  for (const el of ids) {
    el.addEventListener("input", () => renderSectionPreview());
    el.addEventListener("change", () => renderSectionPreview());
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
  coverM: number;
  tieDiaM: number;
  barDiaM: number;
  coverToCenter: boolean;
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
    coverM: parsePreviewNumber(refs.cover.value, 0),
    tieDiaM: parsePreviewNumber(refs.tieDia.value, 0) / 1000.0,
    barDiaM: parsePreviewNumber(refs.barDia.value, 0) / 1000.0,
    coverToCenter: refs.coverToCenter.checked,
  };

  if (input.barDiaM <= 0 || input.tieDiaM <= 0 || input.coverM <= 0) return null;
  if (shape === "rect") {
    if (input.widthM <= 0 || input.heightM <= 0) return null;
  } else if (input.diameterM <= 0) {
    return null;
  }

  return input;
}

function computeSectionBarCenters(input: SectionPreviewInput): XY[] {
  const edge = input.coverToCenter ? input.coverM : input.coverM + input.tieDiaM + 0.5 * input.barDiaM;
  const bars: XY[] = [];
  if (input.shape === "rect") {
    const hw = 0.5 * input.widthM;
    const hh = 0.5 * input.heightM;
    const xLeft = -hw + edge;
    const xRight = hw - edge;
    const yBot = -hh + edge;
    const yTop = hh - edge;
    if (xLeft >= xRight || yBot >= yTop) return bars;

    const sx = input.barsX > 1 ? (xRight - xLeft) / (input.barsX - 1) : 0;
    const sy = input.barsY > 1 ? (yTop - yBot) / (input.barsY - 1) : 0;

    for (let i = 0; i < input.barsX; i++) {
      const x = xLeft + i * sx;
      bars.push({ x, y: yTop });
      bars.push({ x, y: yBot });
    }
    for (let j = 1; j < input.barsY - 1; j++) {
      const y = yBot + j * sy;
      bars.push({ x: xLeft, y });
      bars.push({ x: xRight, y });
    }
    return bars;
  }

  const r = 0.5 * input.diameterM;
  const rb = r - edge;
  if (rb <= 0) return bars;
  for (let i = 0; i < input.bars; i++) {
    const a = (2 * Math.PI * i) / input.bars;
    bars.push({ x: rb * Math.cos(a), y: rb * Math.sin(a) });
  }
  return bars;
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
  const bars = computeSectionBarCenters(input);

  const maxX = input.shape === "rect" ? 0.5 * input.widthM : 0.5 * input.diameterM;
  const maxY = input.shape === "rect" ? 0.5 * input.heightM : 0.5 * input.diameterM;
  const scale = 0.88 * Math.min((w - 36) / (2 * maxX || 1), (h - 30) / (2 * maxY || 1));
  const cx = w * 0.5;
  const cy = h * 0.53;
  const sx = (x: number): number => cx + x * scale;
  const sy = (y: number): number => cy - y * scale;

  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, cy);
  ctx.lineTo(w - 14, cy);
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, h - 10);
  ctx.stroke();

  if (input.shape === "rect") {
    const hw = 0.5 * input.widthM;
    const hh = 0.5 * input.heightM;
    ctx.fillStyle = state.theme === "light" ? "rgba(225, 238, 244, 0.95)" : "rgba(13, 26, 38, 0.95)";
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.4;
    ctx.fillRect(sx(-hw), sy(hh), 2 * hw * scale, 2 * hh * scale);
    ctx.strokeRect(sx(-hw), sy(hh), 2 * hw * scale, 2 * hh * scale);

    const chw = hw - tieCenterEdge;
    const chh = hh - tieCenterEdge;
    if (chw > 0 && chh > 0) {
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sx(-chw), sy(chh), 2 * chw * scale, 2 * chh * scale);
    }
  } else {
    const r = 0.5 * input.diameterM;
    ctx.fillStyle = state.theme === "light" ? "rgba(225, 238, 244, 0.95)" : "rgba(13, 26, 38, 0.95)";
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const rc = r - tieCenterEdge;
    if (rc > 0) {
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rc * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const barR = Math.max(2.2, 0.5 * input.barDiaM * scale);
  for (const b of bars) {
    ctx.fillStyle = state.theme === "light" ? "#20303a" : "#f0c97a";
    ctx.strokeStyle = state.theme === "light" ? "#0e1e28" : "#ffe4a6";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(sx(b.x), sy(b.y), barR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
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

async function runAnalysis(): Promise<void> {
  const wasm = state.wasm;
  if (!wasm) throw new Error(state.lang === "en" ? "WASM is not ready yet." : "WASM henuz hazir degil.");

  setStatus(tx("statusPmmCalculating"), "info");

  const textLoads = parseLoadsText(refs.loadsText.value);
  const fileLoads = refs.loadsFile.files?.[0] ? await parseLoadsCsvFile(refs.loadsFile.files[0]) : [];
  const loads = [...textLoads, ...fileLoads];
  if (loads.length === 0) throw new Error(state.lang === "en" ? "Enter at least one load case." : "En az bir yuk girin.");

  const input = collectInput(loads);
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

  const count = wasm.getPointCount();
  const surface: PmmPoint[] = [];
  for (let i = 0; i < count; i++) {
    surface.push({
      p: wasm.getPointP(i),
      mx: wasm.getPointMx(i),
      my: wasm.getPointMy(i),
    });
  }

  const compliance = evaluateCompliance(input);

  state.results = results;
  state.surface = surface;
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

  const maxDcr = Math.max(...results.map((r) => r.dcr));
  const failCount = compliance.filter((c) => c.status === "fail").length;
  const infoCount = compliance.filter((c) => c.status === "info").length;
  setStatus(runSummaryText(input, maxDcr, failCount, infoCount), "info");
}

function collectInput(loads: LoadCase[]): AppInput {
  return {
    codeMode: refs.codeMode.value as CodeMode,
    concreteModel: refs.concreteModel.value as ConcreteModel,
    useExpectedStrength: refs.useExpectedStrength.checked,
    expectedFckFactor: n(refs.expectedFckFactor.value),
    expectedFykFactor: n(refs.expectedFykFactor.value),
    shape: refs.shape.value as Shape,
    widthM: n(refs.width.value),
    heightM: n(refs.height.value),
    diameterM: n(refs.diameter.value),
    barsX: ni(refs.barsX.value),
    barsY: ni(refs.barsY.value),
    bars: ni(refs.bars.value),
    coverM: n(refs.cover.value),
    tieDiaMm: n(refs.tieDia.value),
    barDiaMm: n(refs.barDia.value),
    tieSpacingConfMm: n(refs.tieSpacingConf.value),
    tieSpacingMidMm: n(refs.tieSpacingMid.value),
    coverToCenter: refs.coverToCenter.checked,
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
  const nBars = input.shape === "rect" ? (2 * input.barsX + 2 * Math.max(0, input.barsY - 2)) : input.bars;
  const areaM2 = input.shape === "rect"
    ? input.widthM * input.heightM
    : Math.PI * (input.diameterM * 0.5) * (input.diameterM * 0.5);
  if (areaM2 <= 0) return 0;
  const barAreaM2 = Math.PI * barDiaM * barDiaM / 4.0;
  return (nBars * barAreaM2 / areaM2) * 100.0;
}

function configureWasm(wasm: WasmExports, input: AppInput): number {
  const tieDiaM = input.tieDiaMm / 1000.0;
  const barDiaM = input.barDiaMm / 1000.0;
  const tieSpacingConfM = input.tieSpacingConfMm / 1000.0;
  const strengths = resolveDesignStrengths(input);
  const concreteModelId = input.concreteModel === "mander_core_cover" ? 1 : 0;
  wasm.setConcreteModel(concreteModelId, tieSpacingConfM);
  wasm.setDesignFactors(input.phiP, input.phiM, input.pCutoffRatio);

  if (input.shape === "rect") {
    return wasm.configureRect(
      input.widthM,
      input.heightM,
      input.coverM,
      tieDiaM,
      barDiaM,
      input.barsX,
      input.barsY,
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

  const barDiaM = input.barDiaMm / 1000.0;
  const coverNetMm = (
    input.coverToCenter
      ? input.coverM - input.tieDiaMm / 1000.0 - input.barDiaMm / 2000.0
      : input.coverM
  ) * 1000.0;
  const nBars = input.shape === "rect" ? (2 * input.barsX + 2 * Math.max(0, input.barsY - 2)) : input.bars;
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

  if (input.shape === "rect") {
    const edgeM = input.coverToCenter
      ? input.coverM
      : input.coverM + (input.tieDiaMm / 1000.0) + (input.barDiaMm / 2000.0);

    const xSpanMm = Math.max(0, (input.widthM - 2.0 * edgeM) * 1000.0);
    const ySpanMm = Math.max(0, (input.heightM - 2.0 * edgeM) * 1000.0);
    const sx = input.barsX > 1 ? xSpanMm / (input.barsX - 1) : Number.POSITIVE_INFINITY;
    const sy = input.barsY > 1 ? ySpanMm / (input.barsY - 1) : Number.POSITIVE_INFINITY;
    const smax = Math.max(sx, sy);

    addCheck(
      out,
      "TS500",
      "7.4.1",
      "Etriye/cirozla tutulan boyuna donati araligi",
      smax <= 300,
      `${fmt(smax, 1)} mm`,
      "<= 300 mm",
      "TS500 s.25"
    );
  }

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

function readCurrentPVisualScale(): number {
  const v = Number(refs.pVisualScale.value);
  if (!Number.isFinite(v)) return 0.55;
  return Math.min(1.5, Math.max(0.2, v));
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
  const series = surface.map((p) => pickProjection(p, projection, pSignFactor));
  const loads = results.map((r) => pickProjection({ p: r.pu, mx: r.mux, my: r.muy }, projection, pSignFactor));

  const xs = [...series.map((v) => v.x), ...loads.map((v) => v.x)];
  const ys = [...series.map((v) => v.y), ...loads.map((v) => v.y)];
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
  if (shellPointCount > 0 && shellPointCount <= series.length && state.angleCount >= 3 && state.depthCount >= 2) {
    const shellSeries = series.slice(0, shellPointCount);
    ctx.strokeStyle = pal.mesh;
    ctx.lineWidth = 0.9;

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
  }

  ctx.fillStyle = pal.cloud;
  for (const p of series) {
    ctx.beginPath();
    ctx.arc(sx(p.x), sy(p.y), 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

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

  const x: number[][] = [];
  const y: number[][] = [];
  const z: number[][] = [];
  for (let ai = 0; ai < angleCount; ai++) {
    const rowX: number[] = [];
    const rowY: number[] = [];
    const rowZ: number[] = [];
    for (let di = 0; di < depthCount; di++) {
      const idx = ai * depthCount + di;
      const p = surface[idx];
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

  const surfaceTrace = {
    type: "surface",
    x,
    y,
    z,
    showscale: false,
    opacity: 0.88,
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
        ? "P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>"
        : "P: %{z:.1f} kN<br>Mx: %{x:.1f} kNm<br>My: %{y:.1f} kNm<extra></extra>",
  };

  const loadTrace = {
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
  };

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
    (Plotly as any).react(host, [surfaceTrace, loadTrace], layout, config);
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

function parseLoadsText(raw: string): LoadCase[] {
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const out: LoadCase[] = [];
  for (const line of rows) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 3 || parts.length > 4) {
      throw new Error(`Yuk satiri gecersiz: ${line}`);
    }
    const hasName = parts.length === 4;
    const name = hasName ? parts[0] : `L${out.length + 1}`;
    const offset = hasName ? 1 : 0;
    out.push({
      name,
      pu: n(parts[offset]),
      mux: n(parts[offset + 1]),
      muy: n(parts[offset + 2]),
    });
  }
  return out;
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

function downloadText(name: string, text: string): void {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
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
  // Convert user P to WASM convention (positive = compression)
  const pKn = pKnRaw * pSignFactor;

  const angleDeg = Number(refs.mcAngle.value.trim().replace(",", ".")) || 0;
  const angleRad = (angleDeg * Math.PI) / 180;
  // angle=0° → Mx bending: nx=sin(0)=0, ny=cos(0)=1 → horizontal NA
  // angle=90° → My bending: nx=sin(90°)=1, ny=cos(90°)=0 → vertical NA
  const nx = Math.sin(angleRad);
  const ny = Math.cos(angleRad);

  const nSteps = Math.max(20, Math.min(400, Math.round(Number(refs.mcSteps.value) || 80)));

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

  if (count === 0) throw new Error(tx("statusMcNoPoints"));

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

  // Determine concrete ultimate strain for truncation
  const epsCuLimit = input.epsCu > 0 ? input.epsCu : 0.003;
  // For Mander confined model, use the higher confined εcu from the model
  const epsCuCutoff = input.concreteModel === "mander_core_cover" ? epsCuLimit * 2.5 : epsCuLimit;

  // First pass: find last valid index (where εc <= εcu)
  // Allow going slightly beyond εcu to capture the descending branch start
  let lastConcreteIdx = count - 1;
  let firstExceedIdx = -1;
  for (let i = 0; i < count; i++) {
    if (tempEpsC[i] > epsCuCutoff && firstExceedIdx < 0) {
      firstExceedIdx = i;
      // Include a few points past εcu to show the knee
      lastConcreteIdx = Math.min(count - 1, i + 10);
      break;
    }
  }

  // Second pass: also check for moment drop below 80% after peak
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
    
    // Stop at 50% point on descending branch (severe drop = section failed)
    if (peakFound && m < minAllowedMoment) {
      break;
    }
  }

  state.mcData = { phi, moment, neutralAxis, epsC, epsS };
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

function exportWordReport(): void {
  const axis = buildAxisExportData();
  if (!axis || state.results.length === 0) {
    setStatus(tx("statusReportExportEmpty"), "danger");
    return;
  }

  const mxRowsHtml = axis.mx
    .map((r, i) => `<tr><td>${i + 1}</td><td>${fmt(r.p, 1)}</td><td>${fmt(r.mPos, 1)}</td><td>${fmt(r.mNeg, 1)}</td></tr>`)
    .join("");
  const myRowsHtml = axis.my
    .map((r, i) => `<tr><td>${i + 1}</td><td>${fmt(r.p, 1)}</td><td>${fmt(r.mPos, 1)}</td><td>${fmt(r.mNeg, 1)}</td></tr>`)
    .join("");
  const resultRowsHtml = state.results
    .map((r) => `<tr><td>${escapeHtml(r.name)}</td><td>${fmt(r.pu)}</td><td>${fmt(r.mux)}</td><td>${fmt(r.muy)}</td><td>${fmt(r.dcr, 4)}</td><td>${r.ok ? tx("resultOk") : tx("resultFail")}</td></tr>`)
    .join("");

  const now = new Date().toLocaleString(state.lang === "en" ? "en-US" : "tr-TR");
  const title = state.lang === "en" ? "Concrete Column PMM Report" : "Betonarme Kolon PMM Raporu";
  const secMx = state.lang === "en" ? "Mx Axis Capacity (with mirror)" : "Mx Yönü Kapasite (mirror ile)";
  const secMy = state.lang === "en" ? "My Axis Capacity (with mirror)" : "My Yönü Kapasite (mirror ile)";
  const secRes = state.lang === "en" ? "Load Results" : "Yük Sonuçları";
  const lblMeta = state.lang === "en" ? "Generated" : "Oluşturulma";

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body{font-family:Calibri,Arial,sans-serif;color:#111;margin:24px}
    h1{font-size:22px;margin:0 0 8px}
    h2{font-size:16px;margin:18px 0 8px}
    p{margin:2px 0 8px}
    table{border-collapse:collapse;width:100%;margin:6px 0 12px}
    th,td{border:1px solid #999;padding:5px 7px;font-size:11px;text-align:right}
    th:first-child, td:first-child{text-align:left}
    .muted{color:#555}
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="muted">${escapeHtml(lblMeta)}: ${escapeHtml(now)}</p>
  <p class="muted">Mx angle: ${fmt(axis.mxAngleDeg, 1)}° | My angle: ${fmt(axis.myAngleDeg, 1)}°</p>

  <h2>${escapeHtml(secRes)}</h2>
  <table>
    <thead><tr><th>Load</th><th>Pu (kN)</th><th>Mux (kNm)</th><th>Muy (kNm)</th><th>DCR</th><th>Status</th></tr></thead>
    <tbody>${resultRowsHtml}</tbody>
  </table>

  <h2>${escapeHtml(secMx)}</h2>
  <table>
    <thead><tr><th>No</th><th>P (kN)</th><th>Mx+ (kNm)</th><th>Mx- (kNm)</th></tr></thead>
    <tbody>${mxRowsHtml}</tbody>
  </table>

  <h2>${escapeHtml(secMy)}</h2>
  <table>
    <thead><tr><th>No</th><th>P (kN)</th><th>My+ (kNm)</th><th>My- (kNm)</th></tr></thead>
    <tbody>${myRowsHtml}</tbody>
  </table>
</body>
</html>`;

  downloadDoc("ts500_pmm_report.doc", html);
  setStatus(tx("statusReportExported"), "info");
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

function toggleMcFullscreen(): void {
  const acc = document.getElementById("mc-accordion");
  if (!acc) return;
  const entering = !acc.classList.contains("mc-fullscreen");
  acc.classList.toggle("mc-fullscreen", entering);
  refs.mcCloseBtn.classList.toggle("mc-close-visible", entering);
  if (state.mcData) {
    setTimeout(() => {
      (Plotly as any).Plots.resize(refs.plotMc);
      (Plotly as any).Plots.resize(refs.plotMcStrain);
    }, 80);
  }
}

function closeMcFullscreen(): void {
  const acc = document.getElementById("mc-accordion");
  if (!acc) return;
  acc.classList.remove("mc-fullscreen");
  refs.mcCloseBtn.classList.remove("mc-close-visible");
  if (state.mcData) {
    setTimeout(() => {
      (Plotly as any).Plots.resize(refs.plotMc);
      (Plotly as any).Plots.resize(refs.plotMcStrain);
    }, 80);
  }
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
    margin: { l: 60, r: 20, t: 32, b: 56 },
    title: {
      text: state.lang === "en" ? "Strain Diagram" : "Birim Uzama Diyagramı",
      font: { color: textColor, size: 13 },
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
    },
    font: { color: textColor },
    showlegend: true,
  };

  const config = { responsive: true, displaylogo: false, scrollZoom: false, staticPlot: false };

  try {
    (Plotly as any).react(host, [zeroTrace, strainTrace, naTrace], layout, config);
  } catch (e) {
    host.textContent = String(e);
  }
}
