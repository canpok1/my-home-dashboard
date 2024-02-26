CREATE TABLE app_statuses (
  id SERIAL NOT NULL COMMENT 'アプリステータスID',
  app_name VARCHAR(255) NOT NULL COMMENT 'アプリ名',
  status_type_id TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'ステータス種別ID',
  last_successful_at DATETIME COMMENT '最終処理成功日時(UTC)',
  last_failure_at DATETIME COMMENT '最終処理失敗日時(UTC)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT fk_app_statuses_status_type_id FOREIGN KEY (status_type_id) REFERENCES app_status_types (id),
  CONSTRAINT uk_app_statuses_app_name UNIQUE (app_name)
)
COMMENT 'アプリステータス'
;


