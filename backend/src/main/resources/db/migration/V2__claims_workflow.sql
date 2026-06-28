DROP TABLE reimbursement_claims;

CREATE TABLE claims (
    id                  UUID PRIMARY KEY,
    claim_code          VARCHAR(64)  NOT NULL UNIQUE,
    school_id           UUID         NOT NULL,
    school_name         VARCHAR(255) NOT NULL,
    semester_label      VARCHAR(64)  NOT NULL,
    semester_start      DATE         NOT NULL,
    semester_end        DATE         NOT NULL,
    verified_students   INT          NOT NULL,
    claim_value         NUMERIC(14, 2) NOT NULL,
    risk_score          INT          NOT NULL,
    fraud_flags         INT          NOT NULL,
    stage               VARCHAR(32)  NOT NULL,
    frozen              BOOLEAN      NOT NULL DEFAULT FALSE,
    rejected            BOOLEAN      NOT NULL DEFAULT FALSE,
    government_notes    TEXT,
    submitted_at        TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ  NOT NULL
);

CREATE TABLE claim_approval_logs (
    id          UUID PRIMARY KEY,
    claim_id    UUID NOT NULL REFERENCES claims(id),
    action      VARCHAR(255) NOT NULL,
    actor       VARCHAR(255) NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_claim_approval_logs_claim_id ON claim_approval_logs(claim_id);

CREATE TABLE claim_deductions (
    id        UUID PRIMARY KEY,
    claim_id  UUID NOT NULL REFERENCES claims(id),
    reason    VARCHAR(255) NOT NULL,
    amount    NUMERIC(14, 2) NOT NULL
);

CREATE TABLE claim_documents (
    id        UUID PRIMARY KEY,
    claim_id  UUID NOT NULL REFERENCES claims(id),
    name      VARCHAR(255) NOT NULL,
    type      VARCHAR(32) NOT NULL
);
