ALTER TABLE electricity_fetch_settings
  ADD COLUMN setting_name VARCHAR(255) NOT NULL DEFAULT '取得設定' COMMENT '設定名' AFTER id
;

ALTER TABLE gas_fetch_settings
  ADD COLUMN setting_name VARCHAR(255) NOT NULL DEFAULT '取得設定' COMMENT '設定名' AFTER id
;

ALTER TABLE water_fetch_settings
  ADD COLUMN setting_name VARCHAR(255) NOT NULL DEFAULT '取得設定' COMMENT '設定名' AFTER id
;
