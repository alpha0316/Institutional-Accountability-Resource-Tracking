CREATE TABLE users (
    id            UUID PRIMARY KEY,
    aza_user_id   VARCHAR(255) UNIQUE,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    role          VARCHAR(32)  NOT NULL,
    school_id     UUID,
    supplier_id   UUID
);

CREATE TABLE suppliers (
    id                  UUID PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    contact_email       VARCHAR(255) NOT NULL UNIQUE,
    aza_api_key         VARCHAR(255),
    aza_webhook_secret  VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE government_tokens (
    id               UUID PRIMARY KEY,
    token_code       VARCHAR(64)  NOT NULL UNIQUE,
    supplier_id      UUID         NOT NULL,
    supplier_name    VARCHAR(255) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    value            NUMERIC(14, 2) NOT NULL,
    issued_date      DATE NOT NULL,
    expiry_date      DATE NOT NULL,
    status           VARCHAR(32) NOT NULL
);

CREATE TABLE students (
    id                 UUID PRIMARY KEY,
    unique_code        VARCHAR(64)  NOT NULL UNIQUE,
    full_name          VARCHAR(255) NOT NULL,
    enrollment_status  VARCHAR(32)  NOT NULL,
    school_id          UUID         NOT NULL,
    year               INT          NOT NULL,
    department         VARCHAR(255) NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL
);

CREATE TABLE cards (
    id           UUID PRIMARY KEY,
    student_id   UUID         NOT NULL REFERENCES students(id),
    card_number  VARCHAR(64)  NOT NULL UNIQUE,
    qr_code      VARCHAR(255) NOT NULL UNIQUE,
    is_active    BOOLEAN      NOT NULL,
    issued_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE meal_validations (
    id              UUID PRIMARY KEY,
    card_number     VARCHAR(64)  NOT NULL,
    student_name    VARCHAR(255) NOT NULL,
    dining_hall_id  VARCHAR(64)  NOT NULL,
    scan_time       TIMESTAMPTZ  NOT NULL,
    served          BOOLEAN      NOT NULL,
    is_duplicate    BOOLEAN      NOT NULL,
    is_flagged      BOOLEAN      NOT NULL
);
CREATE INDEX idx_meal_validations_card_hall_time ON meal_validations(card_number, dining_hall_id, scan_time);

CREATE TABLE supply_orders (
    id           UUID PRIMARY KEY,
    item_type    VARCHAR(255) NOT NULL,
    quantity     INT          NOT NULL,
    unit         VARCHAR(32)  NOT NULL,
    order_date   DATE         NOT NULL,
    supplier_id  UUID         NOT NULL,
    school_id    UUID         NOT NULL,
    token_ref    VARCHAR(64),
    status       VARCHAR(32)  NOT NULL
);

CREATE TABLE reorder_levels (
    id             UUID PRIMARY KEY,
    item_type      VARCHAR(255) NOT NULL UNIQUE,
    unit           VARCHAR(32)  NOT NULL,
    current_stock  INT          NOT NULL,
    min_stock      INT          NOT NULL,
    status         VARCHAR(32)  NOT NULL
);

CREATE TABLE daily_reports (
    id              UUID PRIMARY KEY,
    school_id       UUID         NOT NULL,
    school_name     VARCHAR(255) NOT NULL,
    report_date     DATE         NOT NULL,
    meals_served    INT          NOT NULL,
    enrolled_count  INT          NOT NULL,
    fraud_flags     INT          NOT NULL,
    status          VARCHAR(32)  NOT NULL
);

CREATE TABLE reimbursement_claims (
    id                UUID PRIMARY KEY,
    report_id         UUID         NOT NULL REFERENCES daily_reports(id),
    institution_name  VARCHAR(255) NOT NULL,
    amount_claimed    NUMERIC(14, 2) NOT NULL,
    amount_approved   NUMERIC(14, 2),
    status            VARCHAR(32)  NOT NULL,
    submitted_at      TIMESTAMPTZ  NOT NULL
);

CREATE TABLE bank_transactions (
    id             UUID PRIMARY KEY,
    token_id       UUID         NOT NULL REFERENCES government_tokens(id),
    token_code     VARCHAR(64)  NOT NULL,
    supplier_name  VARCHAR(255) NOT NULL,
    amount         NUMERIC(14, 2) NOT NULL,
    processed_at   TIMESTAMPTZ,
    status         VARCHAR(32)  NOT NULL
);

CREATE TABLE payment_sessions (
    id                   UUID PRIMARY KEY,
    gov_token_id         UUID NOT NULL REFERENCES government_tokens(id),
    supplier_id          UUID NOT NULL REFERENCES suppliers(id),
    bank_transaction_id  UUID NOT NULL REFERENCES bank_transactions(id),
    aza_session_id       VARCHAR(64) UNIQUE,
    amount               NUMERIC(14, 2) NOT NULL,
    status               VARCHAR(32) NOT NULL,
    reference            VARCHAR(255),
    checkout_url         VARCHAR(500),
    created_at           TIMESTAMPTZ NOT NULL,
    completed_at         TIMESTAMPTZ
);
