CREATE TABLE gas_fetch_settings (
  gas_site_id BIGINT UNSIGNED NOT NULL COMMENT 'ガス料金サイトID',
  user_name VARCHAR(255) NOT NULL COMMENT 'ユーザー名',
  encrypted_password VARCHAR(512) NOT NULL COMMENT '暗号化済パスワード',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (gas_site_id, user_name)
)
COMMENT 'ガス料金の取得設定'
;
