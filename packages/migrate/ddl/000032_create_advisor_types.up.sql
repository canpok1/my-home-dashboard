CREATE TABLE advisor_types (
  id TINYINT UNSIGNED NOT NULL COMMENT 'アドバイザー種別ID',
  type_name VARCHAR(255) NOT NULL COMMENT 'アドバイザー種別名',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT uk_advisor_types_type_name UNIQUE (type_name)
)
COMMENT 'アドバイザー種別'
;

INSERT INTO advisor_types (id, type_name) VALUES
(0, 'electricity')
;

