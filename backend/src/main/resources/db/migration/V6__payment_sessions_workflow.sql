ALTER TABLE payment_sessions ALTER COLUMN bank_transaction_id DROP NOT NULL;
ALTER TABLE bank_transactions ADD COLUMN reason VARCHAR(255);
