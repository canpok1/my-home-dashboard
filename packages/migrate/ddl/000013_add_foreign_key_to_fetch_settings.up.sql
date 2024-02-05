ALTER TABLE electricity_daily_usages
  DROP PRIMARY KEY,
  MODIFY COLUMN electricity_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT '電気料金取得設定ID',
  ADD PRIMARY KEY (electricity_fetch_setting_id, usage_year, usage_month, usage_date),
  ADD CONSTRAINT fk_electricity_daily_usages_electricity_fetch_setting_id
    FOREIGN KEY (electricity_fetch_setting_id) REFERENCES electricity_fetch_settings (id)
;

ALTER TABLE electricity_monthly_usages
  DROP PRIMARY KEY,
  MODIFY COLUMN electricity_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT '電気料金取得設定ID',
  ADD PRIMARY KEY (electricity_fetch_setting_id, usage_year, usage_month),
  ADD CONSTRAINT fk_electricity_monthly_usages_electricity_fetch_setting_id
    FOREIGN KEY (electricity_fetch_setting_id) REFERENCES electricity_fetch_settings (id)
;

ALTER TABLE gas_monthly_usages
  DROP PRIMARY KEY,
  MODIFY COLUMN gas_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT 'ガス料金取得設定ID',
  ADD PRIMARY KEY (gas_fetch_setting_id, usage_year, usage_month),
  ADD CONSTRAINT fk_gas_monthly_usages_gas_fetch_setting_id
    FOREIGN KEY (gas_fetch_setting_id) REFERENCES gas_fetch_settings (id)
;

ALTER TABLE water_monthly_usages
  DROP PRIMARY KEY,
  MODIFY COLUMN water_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT '水道料金取得設定ID',
  ADD PRIMARY KEY (water_fetch_setting_id, usage_year, usage_month),
  ADD CONSTRAINT fk_water_monthly_usages_water_fetch_setting_id
    FOREIGN KEY (water_fetch_setting_id) REFERENCES water_fetch_settings (id)
;
