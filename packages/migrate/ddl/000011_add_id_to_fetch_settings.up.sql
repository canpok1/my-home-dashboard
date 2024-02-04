ALTER TABLE electricity_fetch_settings
  DROP PRIMARY KEY,
  ADD COLUMN id SERIAL COMMENT 'ID' FIRST,
  ADD PRIMARY KEY (id),
  ADD CONSTRAINT uk_electricity_fetch_settings_electricity_site_id_user_name UNIQUE (electricity_site_id, user_name)
;

ALTER TABLE gas_fetch_settings
  DROP PRIMARY KEY,
  ADD COLUMN id SERIAL COMMENT 'ID' FIRST,
  ADD PRIMARY KEY (id),
  ADD CONSTRAINT uk_gas_fetch_settings_gas_site_id_user_name UNIQUE (gas_site_id, user_name)
;

ALTER TABLE water_fetch_settings
  DROP PRIMARY KEY,
  ADD COLUMN id SERIAL COMMENT 'ID' FIRST,
  ADD PRIMARY KEY (id),
  ADD CONSTRAINT uk_water_fetch_settings_water_site_id_user_name UNIQUE (water_site_id, user_name)
;
