ALTER TABLE electricity_daily_usages
  DROP FOREIGN KEY fk_electricity_daily_usages_electricity_fetch_setting_id,
  DROP PRIMARY KEY,
  MODIFY COLUMN electricity_fetch_setting_id BIGINT UNSIGNED COMMENT '電気料金取得設定ID',
  ADD PRIMARY KEY (usage_year, usage_month, usage_date)
;

ALTER TABLE electricity_monthly_usages
  DROP FOREIGN KEY fk_electricity_monthly_usages_electricity_fetch_setting_id,
  DROP PRIMARY KEY,
  MODIFY COLUMN electricity_fetch_setting_id BIGINT UNSIGNED COMMENT '電気料金取得設定ID',
  ADD PRIMARY KEY (usage_year, usage_month)
;

ALTER TABLE gas_monthly_usages
  DROP FOREIGN KEY fk_gas_monthly_usages_gas_fetch_setting_id,
  DROP PRIMARY KEY,
  MODIFY COLUMN gas_fetch_setting_id BIGINT UNSIGNED COMMENT 'ガス料金取得設定ID',
  ADD PRIMARY KEY (usage_year, usage_month)
;

ALTER TABLE water_monthly_usages
  DROP FOREIGN KEY fk_water_monthly_usages_water_fetch_setting_id,
  DROP PRIMARY KEY,
  MODIFY COLUMN water_fetch_setting_id BIGINT UNSIGNED COMMENT '水道料金取得設定ID',
  ADD PRIMARY KEY (usage_year, usage_month)
;
