CREATE TABLE electricity_notify_settings (
  id SERIAL NOT NULL COMMENT '通知設定ID',
  electricity_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT '取得設定ID',
  line_channel_id VARCHAR(256) NOT NULL COMMENT '通知用LINEチャンネルID',
  notify_date TINYINT UNSIGNED NOT NULL COMMENT '通知日（1〜31）',
  notify_enable BOOLEAN NOT NULL DEFAULT TRUE COMMENT '通知処理の有効化',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT fk_electricity_notify_settings_electricity_fetch_setting_id FOREIGN KEY (electricity_fetch_setting_id) REFERENCES electricity_fetch_settings (id),
  CONSTRAINT fk_electricity_notify_settings_line_channel_id FOREIGN KEY (line_channel_id) REFERENCES line_channels (id)
)
COMMENT '電気料金の通知設定'
;
