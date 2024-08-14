CREATE TABLE notify_status_types (
  id TINYINT UNSIGNED NOT NULL COMMENT '通知ステータス種別ID',
  type_name VARCHAR(255) NOT NULL COMMENT '通知ステータス種別名',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT uk_notify_status_types_type_name UNIQUE (type_name)
)
COMMENT '通知ステータス種別'
;

INSERT INTO notify_status_types (id, type_name) VALUES
(0, 'success'),
(1, 'failure')
;
