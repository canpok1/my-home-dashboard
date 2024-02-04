CREATE TABLE electricity_fetch_settings (
  electricity_site_id BIGINT UNSIGNED NOT NULL COMMENT '電気料金サイトID',
  user_name VARCHAR(255) NOT NULL COMMENT 'ユーザー名',
  encrypted_password VARCHAR(512) NOT NULL COMMENT '暗号化済パスワード',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (electricity_site_id, user_name)
)
COMMENT '電気料金の取得設定'
;
