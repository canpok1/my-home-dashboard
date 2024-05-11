ALTER TABLE electricity_fetch_settings
  ADD COLUMN fetch_enable BOOLEAN NOT NULL DEFAULT TRUE COMMENT '取得処理の有効化' AFTER encrypted_password
;

ALTER TABLE gas_fetch_settings
  ADD COLUMN fetch_enable BOOLEAN NOT NULL DEFAULT TRUE COMMENT '取得処理の有効化' AFTER encrypted_password
;

ALTER TABLE water_fetch_settings
  ADD COLUMN fetch_enable BOOLEAN NOT NULL DEFAULT TRUE COMMENT '取得処理の有効化' AFTER encrypted_password
;
