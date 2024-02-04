ALTER TABLE electricity_fetch_settings
  DROP CONSTRAINT uk_electricity_fetch_settings_electricity_site_id_user_name,
  DROP PRIMARY KEY,
  DROP COLUMN id,
  ADD PRIMARY KEY (electricity_site_id, user_name)
;

ALTER TABLE gas_fetch_settings
  DROP CONSTRAINT uk_gas_fetch_settings_gas_site_id_user_name,
  DROP PRIMARY KEY,
  DROP COLUMN id,
  ADD PRIMARY KEY (gas_site_id, user_name)
;

ALTER TABLE water_fetch_settings
  DROP CONSTRAINT uk_water_fetch_settings_water_site_id_user_name,
  DROP PRIMARY KEY,
  DROP COLUMN id,
  ADD PRIMARY KEY (water_site_id, user_name)
;
