ALTER TABLE supply_orders ADD COLUMN received_quantity INT;

CREATE TABLE supply_consumptions (
    id             UUID PRIMARY KEY,
    school_id      UUID         NOT NULL,
    item_type      VARCHAR(255) NOT NULL,
    quantity       INT          NOT NULL,
    unit           VARCHAR(64)  NOT NULL,
    meal_session   VARCHAR(32)  NOT NULL,
    students_served INT         NOT NULL,
    consumed_at    TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_supply_consumptions_school_id ON supply_consumptions (school_id);
