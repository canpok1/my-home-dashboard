CREATE TABLE electricity_fetch_statuses (
  id SERIAL NOT NULL COMMENT '電気料金取得ステータスID',
  electricity_fetch_setting_id BIGINT UNSIGNED NOT NULL COMMENT '取得設定ID',
  status_type_id TINYINT UNSIGNED NOT NULL COMMENT 'ステータス種別ID',
  last_successful_at DATETIME COMMENT '最終成功日時(UTC)',
  last_failure_at DATETIME COMMENT '最終失敗日時(UTC)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT fk_electricity_fetch_statuses_electricity_fetch_setting_id FOREIGN KEY (electricity_fetch_setting_id) REFERENCES electricity_fetch_settings (id),
  CONSTRAINT uk_electricity_fetch_statuses_electricity_fetch_setting_id UNIQUE (electricity_fetch_setting_id),
  CONSTRAINT fk_electricity_fetch_statuses_status_type_id FOREIGN KEY (status_type_id) REFERENCES fetch_status_types (id)
)
COMMENT '電気料金取得ステータス'
;
