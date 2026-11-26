CREATE DATABASE IF NOT EXISTS reimburze
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reimburze;

-- ============ USERS ============
-- Login pakai username (bukan email). Tidak ada kolom email.
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          ENUM('ketua','bendahara_inti','bendahara_acara','admin') NOT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============ KAS (pemasukan/pengeluaran non-reimburse) ============
CREATE TABLE cash_transactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  type             ENUM('income','expense') NOT NULL,
  amount           DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  description      VARCHAR(255),
  category         VARCHAR(100),
  transaction_date DATE NOT NULL,
  created_by       INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (transaction_date),
  INDEX idx_type (type)
) ENGINE=InnoDB;

-- ============ PENGAJUAN REIMBURSE ============
CREATE TABLE reimbursements (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  code                   VARCHAR(30) NOT NULL UNIQUE,
  submitted_by           INT NOT NULL,
  event_name             VARCHAR(150),
  title                  VARCHAR(200) NOT NULL,
  description            TEXT,
  amount                 DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  expense_date           DATE NOT NULL,
  status                 ENUM('pending','partially_verified','approved','rejected')
                         NOT NULL DEFAULT 'pending',
  ketua_decision         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  bendahara_inti_decision ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_submitter (submitted_by)
) ENGINE=InnoDB;

-- ============ BUKTI NOTA (1 pengajuan bisa >1 file) ============
CREATE TABLE reimbursement_receipts (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  reimbursement_id  INT NOT NULL,
  file_path         VARCHAR(255) NOT NULL,   -- /uploads/xxx.jpg
  file_type         VARCHAR(50),             -- image/jpeg, application/pdf
  original_name     VARCHAR(255),
  uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reimbursement_id) REFERENCES reimbursements(id) ON DELETE CASCADE,
  INDEX idx_reimb (reimbursement_id)
) ENGINE=InnoDB;

-- ============ RIWAYAT VERIFIKASI (audit) ============
CREATE TABLE verification_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  reimbursement_id INT NOT NULL,
  verifier_id      INT NOT NULL,
  verifier_role    ENUM('ketua','bendahara_inti') NOT NULL,
  decision         ENUM('approved','rejected') NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reimbursement_id) REFERENCES reimbursements(id) ON DELETE CASCADE,
  FOREIGN KEY (verifier_id) REFERENCES users(id),
  INDEX idx_reimb (reimbursement_id)
) ENGINE=InnoDB;

-- ============ AUDIT UMUM ============
CREATE TABLE audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(100),
  entity     VARCHAR(50),
  entity_id  INT,
  metadata   JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;