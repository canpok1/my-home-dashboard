CREATE TABLE water_fetch_settings (
  id BIGINT UNSIGNED NOT NULL COMMENT '取得設定ID',
  user_name VARCHAR(255) NOT NULL COMMENT 'ユーザー名',
  encrypted_password VARCHAR(512) NOT NULL COMMENT '暗号化済パスワード'
)
COMMENT '水道料金の取得設定'
;
