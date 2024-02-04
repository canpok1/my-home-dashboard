CREATE TABLE water_fetch_settings (
  water_site_id BIGINT UNSIGNED NOT NULL COMMENT '水道料金サイトID',
  user_name VARCHAR(255) NOT NULL COMMENT 'ユーザー名',
  encrypted_password VARCHAR(512) NOT NULL COMMENT '暗号化済パスワード',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (water_site_id, user_name)
)
COMMENT '水道料金の取得設定'
;
