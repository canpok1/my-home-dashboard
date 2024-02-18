CREATE TABLE admin_users (
  id SERIAL NOT NULL COMMENT '管理者ユーザーID',
  user_name VARCHAR(255) NOT NULL COMMENT 'ユーザー名',
  password_hash varchar(512) NOT NULL COMMENT 'パスワードハッシュ',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (id),
  CONSTRAINT uk_admin_users_user_name UNIQUE (user_name)
)
COMMENT '管理者ユーザー'
;
