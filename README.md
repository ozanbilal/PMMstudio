# TS500 PMM WASM

Tarayicida calisan `TypeScript + WASM` kolon PMM kontrol araci.

## Ozellikler
- Dairesel ve dortgen kesit
- Birimler: `m`, `kN`, `kNm`, `MPa`
- Boyuna donati capi ve etriye capi girişi: `mm`
- TS500 malzeme katsayilariyla tasarim gerilmeleri (`fcd`, `fyd`)
- Yukler icin DCR, kapasite noktasi ve PMM nokta bulutu
- Eksen tick degerleri gorunen 2B projeksiyon
- Etkilesimli 3B PMM yuzeyi (Mx-My-P)
- Tasarim dayanimi azaltma katsayilari: `phiP`, `phiM`
- Eksenel basincta `P cut-off` uygulamasi (`phiP * cut-off * P0`)
- TS500 / TBDY2018 madde-bazli uyumluluk kontrol tablosu
- Sonuclari CSV olarak disari alma

## Calistirma
```bash
npm install
npm run dev
```

## Uretim build
```bash
npm run build
npm run preview
```

## Notlar
- WASM cekirdegi `assembly/index.ts` dosyasindadir.
- Arayuz ve dosya islemleri `src/main.ts` icindedir.
- PMM yuzeyi aci/notr eksen meshinden olusturulan ucgenli bir yuzey olarak cozulur.
