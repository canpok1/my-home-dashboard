ALTER TABLE electricity_notify_settings
  DROP FOREIGN KEY fk_electricity_notify_settings_advisor_id,
  DROP COLUMN advisor_id
;
