CREATE TABLE notifications (
    id              UUID PRIMARY KEY,
    recipient_role  VARCHAR(32)  NOT NULL,
    type            VARCHAR(48)  NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         VARCHAR(500) NOT NULL,
    related_id      UUID,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_notifications_recipient_role ON notifications (recipient_role);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);
