CREATE TABLE electricity_notify_statuses (
  id SERIAL NOT NULL COMMENT '電気料金通知ステータスID',
  electricity_notify_setting_id BIGINT UNSIGNED NOT NULL COMMENT '通知設定ID',
  status_type_id TINYINT UNSIGNED NOT NULL COMMENT 'ステータス種別ID',
  last_successful_at DATETIME COMMENT '最終成功日時(UTC)',
  last_failure_at DATETIME COMMENT '最終失敗日時(UTC)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT fk_electricity_notify_statuses_electricity_notify_setting_id FOREIGN KEY (electricity_notify_setting_id) REFERENCES electricity_notify_settings (id),
  CONSTRAINT uk_electricity_notify_statuses_electricity_notify_setting_id UNIQUE (electricity_notify_setting_id),
  CONSTRAINT fk_electricity_notify_statuses_status_type_id FOREIGN KEY (status_type_id) REFERENCES notify_status_types (id)
)
COMMENT '電気料金通知ステータス'
;

