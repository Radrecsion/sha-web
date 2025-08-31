-- ============================================================
-- DATABASE INIT SCRIPT UNTUK GMPE / ATTENUATION MODELS
-- ============================================================

-- Buat schema dasar
CREATE TABLE IF NOT EXISTS gmpe_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    reference VARCHAR(255),
    tectonic_env VARCHAR(100),     -- contoh: Subduction, Crustal, Intraslab
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel koefisien GMPE (umum untuk persamaan log10 PGA/SA)
CREATE TABLE IF NOT EXISTS gmpe_coefficients (
    id SERIAL PRIMARY KEY,
    gmpe_id INT REFERENCES gmpe_models(id) ON DELETE CASCADE,
    period FLOAT,                  -- period (T) dalam detik, 0 = PGA
    c1 FLOAT,
    c2 FLOAT,
    c3 FLOAT,
    c4 FLOAT,
    c5 FLOAT,
    c6 FLOAT,
    sigma FLOAT,
    tau FLOAT,
    phi FLOAT
);

-- ============================================================
-- SEED DATA: GMPE MODELS
-- ============================================================

INSERT INTO gmpe_models (name, reference, tectonic_env)
VALUES
('Sadigh et al. 1997', '02sadig1997s.txt', 'Crustal'),
('Youngs et al. 1997', '04youngs1997s.txt', 'Subduction Interface'),
('Atkinson & Boore 1997', '05jobor1997.txt', 'Intraslab'),
('Silva et al. 1997', '06absilva1997.txt', 'Crustal'),
('Campbell 1997', '07campbell1997.txt', 'Crustal'),
('Atkinson & Boore 2003 (sub)', '08atkboor20030.txt', 'Subduction Interface'),
('Atkinson & Boore 2003 (slab)', '09atkboor20031.txt', 'Intraslab'),
('Chiou & Youngs 2006 NGA', '10atboorNGA2006.txt', 'Crustal');

-- ============================================================
-- NOTE:
-- Data koefisien (gmpe_coefficients) harus di-*seed* berdasarkan
-- isi tabel dari file txt (Sadigh 1997, Youngs 1997, dst).
-- Format disesuaikan: tiap baris = 1 period dengan c1..c6, sigma, dst.
-- ============================================================
