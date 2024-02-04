ALTER TABLE electricity_daily_usages
  ADD COLUMN electricity_fetch_setting_id BIGINT UNSIGNED COMMENT '電気料金取得設定ID' FIRST
;

ALTER TABLE electricity_monthly_usages
  ADD COLUMN electricity_fetch_setting_id BIGINT UNSIGNED COMMENT '電気料金取得設定ID' FIRST
;

ALTER TABLE gas_monthly_usages
  ADD COLUMN gas_fetch_setting_id BIGINT UNSIGNED COMMENT 'ガス料金取得設定ID' FIRST
;

ALTER TABLE water_monthly_usages
  ADD COLUMN water_fetch_setting_id BIGINT UNSIGNED COMMENT '水道料金取得設定ID' FIRST
;
