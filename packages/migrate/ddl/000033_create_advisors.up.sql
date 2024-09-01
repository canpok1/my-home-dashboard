CREATE TABLE advisors (
  id SERIAL NOT NULL COMMENT 'アドバイザーID',
  advisor_type_id TINYINT UNSIGNED NOT NULL COMMENT 'アドバイザー種別ID',
  encrypted_apikey VARCHAR(512) NOT NULL COMMENT '暗号化済APIキー',
  memo TEXT COMMENT 'メモ',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT fk_advisors_advisor_type_id FOREIGN KEY (advisor_type_id) REFERENCES advisor_types (id)
)
COMMENT 'アドバイザー'
;
