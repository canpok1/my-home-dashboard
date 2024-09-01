ALTER TABLE electricity_notify_settings
  ADD COLUMN advisor_id BIGINT UNSIGNED COMMENT 'アドバイザーID' AFTER line_channel_id,
  ADD CONSTRAINT fk_electricity_notify_settings_advisor_id
    FOREIGN KEY (advisor_id) REFERENCES advisors (id)
;
