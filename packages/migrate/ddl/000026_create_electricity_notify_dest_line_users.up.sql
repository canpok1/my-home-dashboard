CREATE TABLE electricity_notify_dest_line_users(
  electricity_notify_setting_id BIGINT UNSIGNED NOT NULL COMMENT '通知設定ID',
  line_user_id VARCHAR(256) NOT NULL COMMENT 'LINEユーザーID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (electricity_notify_setting_id, line_user_id),
  CONSTRAINT fk_electricity_notify_dest_line_users_notify_setting_id FOREIGN KEY (electricity_notify_setting_id) REFERENCES electricity_notify_settings (id),
  CONSTRAINT fk_electricity_notify_dest_line_users_line_user_id FOREIGN KEY (line_user_id) REFERENCES line_users (id)
)
COMMENT '電気料金通知先のLINEユーザー'
;
