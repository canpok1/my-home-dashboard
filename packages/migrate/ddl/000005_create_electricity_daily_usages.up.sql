CREATE TABLE electricity_daily_usages (
  usage_year INT UNSIGNED NOT NULL COMMENT '年',
  usage_month INT UNSIGNED NOT NULL COMMENT '月',
  usage_date INT UNSIGNED NOT NULL COMMENT '日',
  usage_amount DECIMAL(15,5) UNSIGNED NOT NULL COMMENT '使用量(kWh)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時(UTC)',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時(UTC)',

  PRIMARY KEY (usage_year, usage_month, usage_date)
)
COMMENT '日間電気使用状況'
;
