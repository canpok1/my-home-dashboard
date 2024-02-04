ALTER TABLE electricity_daily_usages
  DROP COLUMN electricity_fetch_setting_id
;

ALTER TABLE electricity_monthly_usages
  DROP COLUMN electricity_fetch_setting_id
;

ALTER TABLE gas_monthly_usages
  DROP COLUMN gas_fetch_setting_id
;

ALTER TABLE water_monthly_usages
  DROP COLUMN water_fetch_setting_id
;
