// TS500 concrete column PMM kernel for WebAssembly (AssemblyScript).
// Units:
// - geometry: m
// - material: MPa
// - loads/capacities: kN, kNm

const MPA_TO_KN_M2: f64 = 1000.0;
const EPS: f64 = 1e-12;
const INF: f64 = 1e300;
const TWO_PI: f64 = 2.0 * Math.PI;

let sectionShape: i32 = 0; // 0=rect, 1=circle
let sectionArea: f64 = 0.0;
let sectionAsTotal: f64 = 0.0;

let rectHalfW: f64 = 0.0;
let rectHalfH: f64 = 0.0;
let circleR: f64 = 0.0;

let fibersX = new Array<f64>();
let fibersY = new Array<f64>();
let fibersA = new Array<f64>();

let barsX = new Array<f64>();
let barsY = new Array<f64>();

let pointsP = new Array<f64>();
let pointsMx = new Array<f64>();
let pointsMy = new Array<f64>();

let angleCount: i32 = 0;
let depthCount: i32 = 0;

let phiPFactor: f64 = 1.0;
let phiMFactor: f64 = 1.0;
let pCutoffRatio: f64 = 1.0;

let concreteModel: i32 = 0; // 0=TS500 block, 1=Mander core+cover
let tieSpacingConf: f64 = 0.10;

let sectionCover: f64 = 0.0;
let sectionTieDia: f64 = 0.0;
let sectionBarDia: f64 = 0.0;
let sectionCoverToCenter: i32 = 0;

let coreEdge: f64 = 0.0;
let rectCoreHalfW: f64 = 0.0;
let rectCoreHalfH: f64 = 0.0;
let circleCoreR: f64 = 0.0;

let unconfFco: f64 = 0.0;
let unconfEcc: f64 = 0.0;
let unconfR: f64 = 0.0;
let unconfEcu: f64 = 0.0;

let confFcc: f64 = 0.0;
let confEcc: f64 = 0.0;
let confR: f64 = 0.0;
let confEcu: f64 = 0.0;
let confActive: i32 = 0;

let topPoleP: f64 = 0.0;
let botPoleP: f64 = 0.0;
let topPoleNominal: f64 = 0.0;
let botPoleNominal: f64 = 0.0;

let lastPcap: f64 = 0.0;
let lastMxcap: f64 = 0.0;
let lastMycap: f64 = 0.0;
let lastScale: f64 = 0.0;
let lastDcr: f64 = 0.0;
let lastOk: i32 = 0;

function ts500K1(fck: f64): f64 {
  if (fck <= 30.0) return 0.85;
  if (fck <= 35.0) return 0.82;
  if (fck <= 40.0) return 0.76 + (40.0 - fck) * (0.82 - 0.76) / 5.0;
  if (fck <= 45.0) return 0.73 + (45.0 - fck) * (0.76 - 0.73) / 5.0;
  if (fck <= 50.0) return 0.70 + (50.0 - fck) * (0.73 - 0.70) / 5.0;
  let ex = 0.70 - 0.006 * (fck - 50.0);
  if (ex < 0.65) ex = 0.65;
  return ex;
}

function clearSectionData(): void {
  fibersX.length = 0;
  fibersY.length = 0;
  fibersA.length = 0;
  barsX.length = 0;
  barsY.length = 0;
  pointsP.length = 0;
  pointsMx.length = 0;
  pointsMy.length = 0;
  coreEdge = 0.0;
  rectCoreHalfW = 0.0;
  rectCoreHalfH = 0.0;
  circleCoreR = 0.0;
}

function buildRectGeometry(
  width: f64,
  height: f64,
  cover: f64,
  tieDia: f64,
  barDia: f64,
  barsXCount: i32,
  barsYCount: i32,
  mesh: i32,
  coverToCenter: i32
): i32 {
  if (width <= 0.0 || height <= 0.0) return 0;
  if (barsXCount < 2 || barsYCount < 2) return 0;
  if (mesh < 10) return 0;

  clearSectionData();

  sectionShape = 0;
  rectHalfW = 0.5 * width;
  rectHalfH = 0.5 * height;
  sectionArea = width * height;
  sectionCover = cover;
  sectionTieDia = tieDia;
  sectionBarDia = barDia;
  sectionCoverToCenter = coverToCenter;

  let edge = cover;
  if (coverToCenter == 0) edge = cover + tieDia + 0.5 * barDia;
  if (edge >= rectHalfW || edge >= rectHalfH) return 0;

  coreEdge = computeTieCenterEdge();
  rectCoreHalfW = rectHalfW - coreEdge;
  rectCoreHalfH = rectHalfH - coreEdge;
  if (rectCoreHalfW < 0.0) rectCoreHalfW = 0.0;
  if (rectCoreHalfH < 0.0) rectCoreHalfH = 0.0;
  circleCoreR = 0.0;

  let dx = width / <f64>mesh;
  let dy = height / <f64>mesh;
  let x0 = -rectHalfW + 0.5 * dx;
  let y0 = -rectHalfH + 0.5 * dy;
  for (let j = 0; j < mesh; j++) {
    let y = y0 + <f64>j * dy;
    for (let i = 0; i < mesh; i++) {
      let x = x0 + <f64>i * dx;
      fibersX.push(x);
      fibersY.push(y);
      fibersA.push(dx * dy);
    }
  }

  let barArea = Math.PI * barDia * barDia / 4.0;
  let xLeft = -rectHalfW + edge;
  let xRight = rectHalfW - edge;
  let yBot = -rectHalfH + edge;
  let yTop = rectHalfH - edge;

  let sx = (barsXCount > 1) ? (xRight - xLeft) / <f64>(barsXCount - 1) : 0.0;
  let sy = (barsYCount > 1) ? (yTop - yBot) / <f64>(barsYCount - 1) : 0.0;

  for (let i = 0; i < barsXCount; i++) {
    let x = xLeft + <f64>i * sx;
    barsX.push(x);
    barsY.push(yTop);
    barsX.push(x);
    barsY.push(yBot);
  }
  for (let j = 1; j < barsYCount - 1; j++) {
    let y = yBot + <f64>j * sy;
    barsX.push(xLeft);
    barsY.push(y);
    barsX.push(xRight);
    barsY.push(y);
  }

  sectionAsTotal = <f64>barsX.length * barArea;
  return 1;
}

function buildCircleGeometry(
  diameter: f64,
  cover: f64,
  tieDia: f64,
  barDia: f64,
  barCount: i32,
  mesh: i32,
  coverToCenter: i32
): i32 {
  if (diameter <= 0.0) return 0;
  if (barCount < 3) return 0;
  if (mesh < 10) return 0;

  clearSectionData();

  sectionShape = 1;
  circleR = 0.5 * diameter;
  sectionArea = Math.PI * circleR * circleR;
  sectionCover = cover;
  sectionTieDia = tieDia;
  sectionBarDia = barDia;
  sectionCoverToCenter = coverToCenter;

  let edge = cover;
  if (coverToCenter == 0) edge = cover + tieDia + 0.5 * barDia;
  let rb = circleR - edge;
  if (rb <= 0.0) return 0;

  coreEdge = computeTieCenterEdge();
  circleCoreR = circleR - coreEdge;
  if (circleCoreR < 0.0) circleCoreR = 0.0;
  rectCoreHalfW = 0.0;
  rectCoreHalfH = 0.0;

  let step = diameter / <f64>mesh;
  let x0 = -circleR + 0.5 * step;
  let y0 = -circleR + 0.5 * step;
  for (let j = 0; j < mesh; j++) {
    let y = y0 + <f64>j * step;
    for (let i = 0; i < mesh; i++) {
      let x = x0 + <f64>i * step;
      if (x * x + y * y <= circleR * circleR + 1e-16) {
        fibersX.push(x);
        fibersY.push(y);
        fibersA.push(step * step);
      }
    }
  }

  let barArea = Math.PI * barDia * barDia / 4.0;
  for (let i = 0; i < barCount; i++) {
    let ang = TWO_PI * <f64>i / <f64>barCount;
    barsX.push(rb * Math.cos(ang));
    barsY.push(rb * Math.sin(ang));
  }

  sectionAsTotal = <f64>barsX.length * barArea;
  return 1;
}

function sectionSmax(nx: f64, ny: f64): f64 {
  if (sectionShape == 0) {
    let ax = nx >= 0.0 ? nx : -nx;
    let ay = ny >= 0.0 ? ny : -ny;
    return ax * rectHalfW + ay * rectHalfH;
  }
  return circleR;
}

function sectionDepth(nx: f64, ny: f64): f64 {
  if (sectionShape == 0) {
    let ax = nx >= 0.0 ? nx : -nx;
    let ay = ny >= 0.0 ? ny : -ny;
    return 2.0 * (ax * rectHalfW + ay * rectHalfH);
  }
  return 2.0 * circleR;
}

function computeTieCenterEdge(): f64 {
  if (sectionCoverToCenter != 0) {
    let v = sectionCover - 0.5 * sectionBarDia;
    return v > 0.0 ? v : 0.0;
  }
  return sectionCover + 0.5 * sectionTieDia;
}

function manderCurveStress(eps: f64, fPeak: f64, epsPeak: f64, r: f64, epsLimit: f64): f64 {
  if (eps <= 0.0 || eps > epsLimit) return 0.0;
  if (fPeak <= 0.0 || epsPeak <= EPS || r <= 1.0 + EPS) return 0.0;

  let x = eps / epsPeak;
  if (x <= 0.0) return 0.0;
  let xr = Math.pow(x, r);
  let den = r - 1.0 + xr;
  if (den <= EPS) return 0.0;
  let stress = fPeak * (x * r) / den;
  if (stress < 0.0) return 0.0;
  if (stress > fPeak * 1.05) stress = fPeak * 1.05;
  return stress;
}

function isCoreFiber(x: f64, y: f64): i32 {
  if (sectionShape == 0) {
    if (rectCoreHalfW <= EPS || rectCoreHalfH <= EPS) return 0;
    let ax = x >= 0.0 ? x : -x;
    let ay = y >= 0.0 ? y : -y;
    return (ax <= rectCoreHalfW + 1e-12 && ay <= rectCoreHalfH + 1e-12) ? 1 : 0;
  }
  if (circleCoreR <= EPS) return 0;
  return (x * x + y * y <= circleCoreR * circleCoreR + 1e-16) ? 1 : 0;
}

function setupConcreteModelParams(
  fck: f64,
  fyk: f64,
  gammaC: f64,
  gammaS: f64,
  epsCu: f64
): void {
  confActive = 0;

  let fco = (fck / gammaC) * MPA_TO_KN_M2;
  if (fco <= 0.0) fco = 1.0;
  let fyh = (fyk / gammaS) * MPA_TO_KN_M2;
  if (fyh <= 0.0) fyh = 1.0;

  let eco = 0.002;
  let ecMpa = 5000.0 * Math.sqrt(fck > 0.0 ? fck : 1.0);
  let ec = ecMpa * MPA_TO_KN_M2;
  let eSecUn = fco / eco;
  let denUn = ec - eSecUn;
  let rUn = denUn > EPS ? ec / denUn : 1e6;
  if (rUn < 1.02) rUn = 1.02;

  unconfFco = fco;
  unconfEcc = eco;
  unconfR = rUn;
  unconfEcu = epsCu > 0.0 ? epsCu : 0.003;

  confFcc = unconfFco;
  confEcc = unconfEcc;
  confR = unconfR;
  confEcu = unconfEcu;

  if (concreteModel != 1) return;

  let s = tieSpacingConf;
  if (s <= EPS || sectionTieDia <= EPS) return;

  let ash = Math.PI * sectionTieDia * sectionTieDia / 4.0;
  let fl = 0.0;
  let rhoEff = 0.0;

  if (sectionShape == 0) {
    let bc = 2.0 * rectCoreHalfW;
    let hc = 2.0 * rectCoreHalfH;
    if (bc <= EPS || hc <= EPS) return;

    let rhoX = (2.0 * ash) / (s * bc);
    let rhoY = (2.0 * ash) / (s * hc);
    let keX = 1.0 - s / (2.0 * bc);
    let keY = 1.0 - s / (2.0 * hc);
    if (keX < 0.0) keX = 0.0;
    if (keY < 0.0) keY = 0.0;

    let flx = keX * rhoX * fyh;
    let fly = keY * rhoY * fyh;
    fl = 0.5 * (flx + fly);
    rhoEff = 0.5 * (rhoX + rhoY) * (0.5 * (keX + keY));
  } else {
    let dCore = 2.0 * circleCoreR;
    if (dCore <= EPS) return;

    let rhoS = (4.0 * ash) / (s * dCore);
    let ke = 1.0 - s / (2.0 * dCore);
    if (ke < 0.0) ke = 0.0;
    fl = 0.5 * ke * rhoS * fyh;
    rhoEff = rhoS * ke;
  }

  if (fl <= EPS) return;

  let ratio = fl / fco;
  let fcc = fco * (2.254 * Math.sqrt(1.0 + 7.94 * ratio) - 2.0 * ratio - 1.254);
  if (fcc < fco) fcc = fco;

  let ecc = eco * (1.0 + 5.0 * (fcc / fco - 1.0));
  if (ecc <= eco) ecc = eco;
  let eSec = fcc / ecc;
  let den = ec - eSec;
  let r = den > EPS ? ec / den : 1e6;
  if (r < 1.02) r = 1.02;

  let epsSu = 0.09;
  let ecu = 0.004 + 1.4 * rhoEff * fyh * epsSu / fcc;
  if (ecu < unconfEcu) ecu = unconfEcu;
  if (ecu > 0.020) ecu = 0.020;

  confFcc = fcc;
  confEcc = ecc;
  confR = r;
  confEcu = ecu;
  confActive = 1;
}

function computeResponse(
  nx: f64,
  ny: f64,
  c: f64,
  epsCu: f64,
  k1: f64,
  concStress: f64,
  fyd: f64,
  es: f64,
  barArea: f64
): StaticArray<f64> {
  let out = new StaticArray<f64>(3);
  let sMax = sectionSmax(nx, ny);
  let epsBlock = epsCu * (1.0 - k1);
  let invC = 1.0 / c;
  let useMander = concreteModel == 1;

  let p = 0.0;
  let mx = 0.0;
  let my = 0.0;

  let fCount = fibersX.length;
  for (let i = 0; i < fCount; i++) {
    let x = unchecked(fibersX[i]);
    let y = unchecked(fibersY[i]);
    let s = x * nx + y * ny;
    let eps = epsCu * (1.0 - (sMax - s) * invC);
    let conc = 0.0;
    if (useMander) {
      if (isCoreFiber(x, y) != 0 && confActive != 0) {
        conc = manderCurveStress(eps, confFcc, confEcc, confR, confEcu);
      } else {
        conc = manderCurveStress(eps, unconfFco, unconfEcc, unconfR, unconfEcu);
      }
    } else if (eps >= epsBlock) {
      conc = concStress;
    }

    if (conc > 0.0) {
      let force = conc * unchecked(fibersA[i]);
      p += force;
      mx += force * y;
      my += force * x;
    }
  }

  let bCount = barsX.length;
  for (let i = 0; i < bCount; i++) {
    let x = unchecked(barsX[i]);
    let y = unchecked(barsY[i]);
    let s = x * nx + y * ny;
    let eps = epsCu * (1.0 - (sMax - s) * invC);
    let sig = es * eps;
    if (sig > fyd) sig = fyd;
    if (sig < -fyd) sig = -fyd;
    if (useMander) {
      let concBar = 0.0;
      if (isCoreFiber(x, y) != 0 && confActive != 0) {
        concBar = manderCurveStress(eps, confFcc, confEcc, confR, confEcu);
      } else {
        concBar = manderCurveStress(eps, unconfFco, unconfEcc, unconfR, unconfEcu);
      }
      sig -= concBar;
    } else if (eps >= epsBlock) {
      sig -= concStress;
    }

    let force = sig * barArea;
    p += force;
    mx += force * y;
    my += force * x;
  }

  unchecked((out[0] = p));
  unchecked((out[1] = mx));
  unchecked((out[2] = my));
  return out;
}

function buildPmmPoints(
  fck: f64,
  fyk: f64,
  gammaC: f64,
  gammaS: f64,
  esMpa: f64,
  epsCu: f64,
  nAngle: i32,
  nDepth: i32,
  barDia: f64
): i32 {
  if (nAngle < 8 || nDepth < 10) return 0;
  if (barsX.length == 0 || fibersX.length == 0) return 0;

  pointsP.length = 0;
  pointsMx.length = 0;
  pointsMy.length = 0;

  angleCount = nAngle;
  depthCount = nDepth;

  let fcd = fck / gammaC;
  let fydMpa = fyk / gammaS;
  let fyd = fydMpa * MPA_TO_KN_M2;
  let es = esMpa * MPA_TO_KN_M2;
  let epsY = fyd / es;
  let concStress = 0.85 * fcd * MPA_TO_KN_M2;
  let k1 = ts500K1(fck);
  let barArea = Math.PI * barDia * barDia / 4.0;
  setupConcreteModelParams(fck, fyk, gammaC, gammaS, epsCu);

  botPoleNominal = -sectionAsTotal * fyd;
  topPoleNominal = concStress * sectionArea + sectionAsTotal * (fyd - concStress);
  let pCapMax = topPoleNominal * phiPFactor * pCutoffRatio;
  botPoleP = botPoleNominal * phiPFactor;
  topPoleP = pCapMax;

  for (let ai = 0; ai < nAngle; ai++) {
    let phi = TWO_PI * <f64>ai / <f64>nAngle;
    let nx = Math.cos(phi);
    let ny = Math.sin(phi);

    let depth = sectionDepth(nx, ny);
    let cMin = depth * 1e-4;
    if (cMin < 1e-6) cMin = 1e-6;
    let cMaxA = depth * 1.2;
    let cMaxB = depth / k1 * 1.2;
    let cMax = cMaxA > cMaxB ? cMaxA : cMaxB;

    // Ensure the farthest steel layer can approach compression yield.
    // This improves the upper compression branch and P cut-off plateau behavior.
    if (epsCu > epsY + 1e-6) {
      let denom = 1.0 - epsY / epsCu;
      if (denom > 1e-6) {
        let cNeedYieldAll = depth / denom;
        let cNeedWithMargin = cNeedYieldAll * 1.15;
        if (cNeedWithMargin > cMax) cMax = cNeedWithMargin;
      }
    }

    let cMaxLimit = depth * 50.0;
    if (cMax > cMaxLimit) cMax = cMaxLimit;
    if (cMax <= cMin) cMax = cMin * 10.0;

    let ratio = Math.pow(cMax / cMin, 1.0 / <f64>(nDepth - 1));
    let c = cMin;
    for (let di = 0; di < nDepth; di++) {
      let res = computeResponse(nx, ny, c, epsCu, k1, concStress, fyd, es, barArea);
      let pDesign = unchecked(res[0]) * phiPFactor;
      if (pDesign > pCapMax) pDesign = pCapMax;
      pointsP.push(pDesign);
      pointsMx.push(unchecked(res[1]) * phiMFactor);
      pointsMy.push(unchecked(res[2]) * phiMFactor);
      c *= ratio;
    }
  }

  return 1;
}

function rayTriangleT(
  dx: f64,
  dy: f64,
  dz: f64,
  ax: f64,
  ay: f64,
  az: f64,
  bx: f64,
  by: f64,
  bz: f64,
  cx: f64,
  cy: f64,
  cz: f64
): f64 {
  let e1x = bx - ax;
  let e1y = by - ay;
  let e1z = bz - az;
  let e2x = cx - ax;
  let e2y = cy - ay;
  let e2z = cz - az;

  let pvx = dy * e2z - dz * e2y;
  let pvy = dz * e2x - dx * e2z;
  let pvz = dx * e2y - dy * e2x;
  let det = e1x * pvx + e1y * pvy + e1z * pvz;
  if (det < EPS && det > -EPS) return INF;

  let invDet = 1.0 / det;
  let tvx = -ax;
  let tvy = -ay;
  let tvz = -az;
  let u = (tvx * pvx + tvy * pvy + tvz * pvz) * invDet;
  if (u < 0.0 || u > 1.0) return INF;

  let qvx = tvy * e1z - tvz * e1y;
  let qvy = tvz * e1x - tvx * e1z;
  let qvz = tvx * e1y - tvy * e1x;
  let v = (dx * qvx + dy * qvy + dz * qvz) * invDet;
  if (v < 0.0 || u + v > 1.0) return INF;

  let t = (e2x * qvx + e2y * qvy + e2z * qvz) * invDet;
  if (t <= EPS) return INF;
  return t;
}

function testTriangleByIndex(
  dx: f64,
  dy: f64,
  dz: f64,
  i0: i32,
  i1: i32,
  i2: i32
): f64 {
  return rayTriangleT(
    dx,
    dy,
    dz,
    unchecked(pointsP[i0]),
    unchecked(pointsMx[i0]),
    unchecked(pointsMy[i0]),
    unchecked(pointsP[i1]),
    unchecked(pointsMx[i1]),
    unchecked(pointsMy[i1]),
    unchecked(pointsP[i2]),
    unchecked(pointsMx[i2]),
    unchecked(pointsMy[i2])
  );
}

function testTriangleWithPole(
  dx: f64,
  dy: f64,
  dz: f64,
  i0: i32,
  i1: i32,
  poleP: f64
): f64 {
  return rayTriangleT(
    dx,
    dy,
    dz,
    unchecked(pointsP[i0]),
    unchecked(pointsMx[i0]),
    unchecked(pointsMy[i0]),
    unchecked(pointsP[i1]),
    unchecked(pointsMx[i1]),
    unchecked(pointsMy[i1]),
    poleP,
    0.0,
    0.0
  );
}

export function configureRect(
  width: f64,
  height: f64,
  cover: f64,
  tieDia: f64,
  barDia: f64,
  barsXCount: i32,
  barsYCount: i32,
  coverToCenter: i32,
  fck: f64,
  fyk: f64,
  gammaC: f64,
  gammaS: f64,
  esMpa: f64,
  epsCu: f64,
  mesh: i32,
  nAngle: i32,
  nDepth: i32
): i32 {
  let okGeom = buildRectGeometry(
    width,
    height,
    cover,
    tieDia,
    barDia,
    barsXCount,
    barsYCount,
    mesh,
    coverToCenter
  );
  if (okGeom == 0) return 0;
  return buildPmmPoints(fck, fyk, gammaC, gammaS, esMpa, epsCu, nAngle, nDepth, barDia);
}

export function configureCircle(
  diameter: f64,
  cover: f64,
  tieDia: f64,
  barDia: f64,
  barCount: i32,
  coverToCenter: i32,
  fck: f64,
  fyk: f64,
  gammaC: f64,
  gammaS: f64,
  esMpa: f64,
  epsCu: f64,
  mesh: i32,
  nAngle: i32,
  nDepth: i32
): i32 {
  let okGeom = buildCircleGeometry(diameter, cover, tieDia, barDia, barCount, mesh, coverToCenter);
  if (okGeom == 0) return 0;
  return buildPmmPoints(fck, fyk, gammaC, gammaS, esMpa, epsCu, nAngle, nDepth, barDia);
}

export function setConcreteModel(model: i32, tieSpacingConfM: f64): void {
  concreteModel = model == 1 ? 1 : 0;
  tieSpacingConf = tieSpacingConfM;
  if (!(tieSpacingConf > 0.0)) tieSpacingConf = 0.10;
}

export function setDesignFactors(phiP: f64, phiM: f64, pCutoff: f64): void {
  let pFactor = phiP;
  let mFactor = phiM;
  let cutoff = pCutoff;

  if (!(pFactor > 0.0)) pFactor = 1.0;
  if (!(mFactor > 0.0)) mFactor = 1.0;
  if (!(cutoff > 0.0)) cutoff = 1.0;

  if (pFactor > 1.0) pFactor = 1.0;
  if (mFactor > 1.0) mFactor = 1.0;
  if (cutoff > 1.0) cutoff = 1.0;

  phiPFactor = pFactor;
  phiMFactor = mFactor;
  pCutoffRatio = cutoff;
}

export function evaluateLoad(p: f64, mx: f64, my: f64): f64 {
  lastPcap = 0.0;
  lastMxcap = 0.0;
  lastMycap = 0.0;
  lastScale = 0.0;
  lastDcr = INF;
  lastOk = 0;

  if (pointsP.length == 0 || angleCount < 3 || depthCount < 2) return lastDcr;

  let nrm = Math.sqrt(p * p + mx * mx + my * my);
  if (nrm <= EPS) {
    lastDcr = 0.0;
    lastOk = 1;
    return lastDcr;
  }

  let bestT = INF;
  for (let ai = 0; ai < angleCount; ai++) {
    let an = ai + 1;
    if (an == angleCount) an = 0;
    for (let di = 0; di < depthCount - 1; di++) {
      let i00 = ai * depthCount + di;
      let i10 = an * depthCount + di;
      let i01 = ai * depthCount + (di + 1);
      let i11 = an * depthCount + (di + 1);

      let t1 = testTriangleByIndex(p, mx, my, i00, i10, i01);
      if (t1 < bestT) bestT = t1;
      let t2 = testTriangleByIndex(p, mx, my, i10, i11, i01);
      if (t2 < bestT) bestT = t2;
    }
  }

  let topRow = depthCount - 1;
  let botRow = 0;
  for (let ai = 0; ai < angleCount; ai++) {
    let an = ai + 1;
    if (an == angleCount) an = 0;

    let iTop0 = ai * depthCount + topRow;
    let iTop1 = an * depthCount + topRow;
    let tTop = testTriangleWithPole(p, mx, my, iTop0, iTop1, topPoleP);
    if (tTop < bestT) bestT = tTop;

    let iBot0 = ai * depthCount + botRow;
    let iBot1 = an * depthCount + botRow;
    let tBot = testTriangleWithPole(p, mx, my, iBot1, iBot0, botPoleP);
    if (tBot < bestT) bestT = tBot;
  }

  if (bestT >= INF * 0.5) {
    return lastDcr;
  }

  lastScale = bestT;
  lastPcap = p * bestT;
  lastMxcap = mx * bestT;
  lastMycap = my * bestT;
  lastDcr = 1.0 / bestT;
  if (lastDcr <= 1.0 + 1e-9) lastOk = 1;
  return lastDcr;
}

export function getLastPcap(): f64 {
  return lastPcap;
}

export function getLastMxcap(): f64 {
  return lastMxcap;
}

export function getLastMycap(): f64 {
  return lastMycap;
}

export function getLastScale(): f64 {
  return lastScale;
}

export function getLastDcr(): f64 {
  return lastDcr;
}

export function getLastOk(): i32 {
  return lastOk;
}

export function getPointCount(): i32 {
  return pointsP.length + 2;
}

export function getPointP(index: i32): f64 {
  if (index < pointsP.length) return unchecked(pointsP[index]);
  if (index == pointsP.length) return botPoleP;
  return topPoleP;
}

export function getPointMx(index: i32): f64 {
  if (index < pointsMx.length) return unchecked(pointsMx[index]);
  return 0.0;
}

export function getPointMy(index: i32): f64 {
  if (index < pointsMy.length) return unchecked(pointsMy[index]);
  return 0.0;
}
