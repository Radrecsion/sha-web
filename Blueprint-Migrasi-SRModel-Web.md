
# Blueprint Migrasi SRModel (VB6/Fortran) → Aplikasi Website
_Tanggal: 2025-08-16_

Dokumen ini merangkum peta eksekusi migrasi dari aplikasi lama berbasis VB6 + modul Fortran (multi-site & single-site) menjadi aplikasi web modern. Disusun agar tim dev bisa langsung implementasi tanpa harus memahami Fortran terlebih dahulu.

---

## 1) Ringkasan Sistem Lama
- **Komponen**: 
  - Binary `.exe` (UI/driver VB6).
  - **Modul Fortran**: `00AMultiSite01.for`, `00AMultiSite02.for/02-Edit`, `00ASingleSite02.for`.
  - File data/parameter `.txt`: `00Intensity.txt`, `00ReturnPeriod.txt`, `00Parameter0.txt`, `DataSource.txt`, `333MSitedat.txt`, `333SSitedat.txt`, serta kumpulan koefisien GMPE (mis. `02sadig1997s.txt`, `11youngsNGA2006.txt`, dll.).
- **Alur**:
  1) Baca parameter (perioda spektral, return period, sumber, grid/lokasi).
  2) Hitung hazard (loop sumber × jarak × magnitudo × GMPE).
  3) Tulis output (hazard curve per lokasi) ke `.txt`.

---

## 2) Target Arsitektur Web (Usulan)
```mermaid
flowchart TD
  A[Browser (React)] --> B[API Backend (Python FastAPI)]
  B --> C[Modul Perhitungan (Python)]
  B --> D[(PostgreSQL)]
  C --> D
```
- **Frontend**: React (alternatif Vue) + Charting (Chart.js/Plotly).
- **Backend**: Python **FastAPI** (alternatif Node.js/Express).
- **Perhitungan**: Python modules (NumPy, SciPy, Pandas).
- **Database**: PostgreSQL (alternatif MySQL).

---

## 3) Pemetaan Modul Fortran → Python
### 3.1 Program Utama (Multi-Site & Single-Site)
- **Tugas**: orkestrasi pembacaan input, loop lokasi/sumber, panggil subrutin, tulis hasil.
- **Python**: `services/engine.py`
  - `run_single_site(params) -> HazardResult`
  - `run_multi_site(params) -> HazardGridResult`

### 3.2 Subrutin Inti
| Fortran | Fungsi | Python (baru) | Catatan Implementasi |
|---|---|---|---|
| `RISK` | Hazard untuk tiap return period (λ, P(exceed)) | `calc/risk.py::hazard_curve(params, gmpe_fn, mag_dist, dist_model)` | Vektorisasi NumPy untuk loop intensitas & periode |
| `MAGNITUDE` | Distribusi magnitudo (G-R & Characteristic) | `calc/magnitude.py::sample_pdf_cdf(params)` | Parameter a,b; Mmin/Mmax; opsi characteristic Mchar |
| `ATENUASI` | GMPE multipel | `calc/attenuation.py` berisi fungsi GMPE: `sadigh_1997()`, `youngs_1997()`, `abrahamson_silva_1997()`, `campbell_1997()`, `atkinson_boor_2003()`, `boor_atkinson_2006()`, `chiou_youngs_2006()` | Pisahkan koefisien ke tabel DB |
| `JARAK`, `PROJARAK`, `SEGMENT`, `POJOK`, `DDALAM` | Metrik jarak (Rrup, Rjb, Rhypo, dsb.) & geometri sumber | `calc/distance.py::compute_rupture_distance(source, site)` | Dukungan geometri fault: titik, segmen, area; gunakan shapely/geodesi opsional |
| I/O `.txt` | Baca/format file parameter & hasil | Digantikan oleh DB + serializer JSON | DB sebagai sumber kebenaran; ekspor CSV jika perlu |

> **Catatan**: Nama fungsi dapat dipetakan 1:1 dari Fortran untuk memudahkan pelacakan. Jika tersedia komentar/rumus di Fortran, sertakan sebagai docstring pada fungsi Python.

---

## 4) Skema Database (Draft)
### 4.1 Tabel Referensi
- `gmpe_model`  
  - `id`, `name`, `version`, `reference`
- `gmpe_coeff`  
  - `id`, `gmpe_id`(FK), `period`, `coef_name`, `coef_value`
- `seismic_source`  
  - `id`, `name`, `type`(point/line/area/subduction/crustal), `geometry`(GeoJSON/WKT), `mmin`, `mmax`, `mchar`, `a_value`, `b_value`, `depth`, `dip`, `rake`
- `site`  
  - `id`, `name`, `lat`, `lon`, `vs30`, `z1pt0`, `z2pt5`

### 4.2 Tabel Operasional
- `analysis_job`  
  - `id`, `mode`(single/multi), `params_json`, `status`, `created_at`, `created_by`
- `analysis_result`  
  - `id`, `job_id`(FK), `site_id`(nullable for grid), `period`, `im_type`(PGA/SA/T), `intensity`, `prob_exceed`, `lambda`

> Koefisien GMPE yang semula di `.txt` dipindah ke `gmpe_coeff`. Parameter default dari `00Parameter0.txt` → `params_json` sebagai preset.

---

## 5) Desain API (FastAPI, Ringkas)
- `POST /api/v1/analysis/single`  
  - **Body**: `{ lat, lon, vs30, periods[], returnPeriods[], gmpe: "boor_atkinson_2006", sources: [id...] }`  
  - **Res**: `{ curves: [{ period, points: [{ im, prob }] }], stats: { hazard: ... } }`
- `POST /api/v1/analysis/multi`  
  - **Body**: `{ bbox|gridSpec, vs30Default, periods[], returnPeriods[], ... }`  
  - **Res**: `{ grid: [{ lat, lon, imlAtRP }], meta: ... }`
- `GET /api/v1/gmpe` → daftar model GMPE tersedia
- `GET /api/v1/sources` → daftar sumber gempa
- `POST /api/v1/export` → ekspor CSV/GeoTIFF (opsional peta hazard)

> Response **JSON** agar mudah divisualisasikan di frontend. Simpan `job` bila ingin repeatable / audit trail.

---

## 6) Rancangan Frontend (React)
- **Halaman Input**
  - Mode: *Single Site* / *Multi Site* (toggle)
  - Form: lokasi (map picker), vs30, periode (multi-select), return period (mis. 43, 72, 475, 2475 th), pilihan GMPE
- **Halaman Hasil**
  - **Single**: grafik hazard curve (IM vs Prob/λ), tabel nilai IML pada RP tertentu, unduh CSV
  - **Multi**: peta heatmap kontur IML pada RP tertentu, slider pilih periode
- **Komponen**
  - `HazardChart`, `ResultTable`, `MapHeatmap`, `JobStatus`

---

## 7) Aturan Validasi Hasil (Paritas dengan Fortran)
1. Pasang **tes unit** per GMPE: bandingkan hasil Python vs hasil dari `.exe` atau file contoh.
2. **Toleransi**: perbedaan numerik ≤ 1–3% (tergantung pembulatan/konstanta).
3. Uji skenario batas: Mmin/Mmax, jarak sangat dekat/jauh, kedalaman dalam/ dangkal.
4. Uji beberapa periode (PGA, SA(0.2s), SA(1.0s), dst.).

---

## 8) Urutan Eksekusi Proyek (Checklist Operasional)
1. **Inventaris data**: kumpulkan semua `.txt` koefisien GMPE, `Parameter0`, `Intensity`, `ReturnPeriod`, dan data sumber (`333M/333S`).  
2. **Desain skema DB** dan migrasi awal; import koefisien GMPE & sumber gempa.  
3. **Translasi modul Fortran → Python**:
   - `magnitude.py`, `distance.py`, `attenuation.py`, `risk.py`
   - Buat **tes unit** untuk tiap fungsi.
4. **Engine orkestra** (`engine.py`): implement `run_single_site` & `run_multi_site`.
5. **API FastAPI**: endpoint `analysis/single` & `analysis/multi` + schema Pydantic.
6. **Frontend**: halaman input & hasil, komponen chart & peta.
7. **Parity testing**: samakan output dengan alat lama pada beberapa kasus uji.
8. **DevOps**: Dockerfile, CI untuk tes, deploy ke staging; logging & error report.
9. **Dokumentasi**: panduan pengguna & contoh skenario analisis.
10. **Go-Live**: hardening keamanan, backup DB, monitoring.

---

## 9) Contoh Pseudocode (Python) — _Ringkas_
```python
# magnitude.py
def magnitude_pdf(params):
    # Gutenberg-Richter + optional characteristic
    # return callable f(M) and cumulative F(M)
    ...

# attenuation.py
def boor_atkinson_2006(M, R, Vs30, T, coeffs):
    # implementasi sesuai persamaan BA06
    ...

# distance.py
def rupture_distance(source, site):
    # hitung Rrup/Rjb/Rhypo tergantung tipe sumber
    ...

# risk.py
def hazard_curve(params, gmpe_fn, mag_dist, dist_model):
    # loop IMLs atau solve invers untuk RP tertentu
    # kembalikan list (IM, lambda/Prob)
    ...
```

---

## 10) Estimasi Artefak yang Dihasilkan
- **Repo Backend** (Python): `app/main.py`, `app/calc/*.py`, `app/services/engine.py`, `tests/*`
- **Repo Frontend** (React): `src/pages/*`, `src/components/*`
- **Skema DB**: skrip SQL migrasi + skrip import koefisien GMPE
- **Dokumentasi**: README, contoh request/response API, contoh CSV hasil

---

## 11) Risiko & Mitigasi
- **Perbedaan formulasi GMPE** antar varian: pastikan koefisien & satuan konsisten (g, m/s², ln/ log10).  
  → *Mitigasi*: tabel konversi satuan + tes unit per model.
- **Geometri sumber** yang kompleks (subduksi/segmen) → jarak rupture akurat.  
  → *Mitigasi*: gunakan pustaka geospasial (shapely/pyproj) & validasi visual.
- **Kinerja** untuk grid besar (multi-site).  
  → *Mitigasi*: vektorisasi NumPy, caching koefisien, kemungkinan parallelism.

---

## 12) Next Actions (langsung eksekusi)
1. Buat **repo backend + frontend** (template kosong).
2. Implement & uji `magnitude.py` + `attenuation.py (>=1 GMPE)`.
3. Bangun endpoint `/analysis/single` dan tampilkan grafik hazard sederhana.
4. Import 1 set koefisien GMPE ke DB dan lakukan **parity test** dengan data lama.
5. Lanjutkan perluasan GMPE & mode `multi` + heatmap.

---

> Dokumen ini dapat menjadi *source of truth* bagi tim pengembang. Jika diperlukan, saya bisa lanjutkan dengan **pembuatan kerangka proyek (skeleton)**: struktur folder backend/ frontend + file awal (tanpa logika penuh) agar developer langsung mulai kode.
