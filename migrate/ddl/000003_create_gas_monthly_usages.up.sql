CREATE TABLE gas_monthly_usages (
  usage_year INT UNSIGNED NOT NULL COMMENT '年',
  usage_month INT UNSIGNED NOT NULL COMMENT '月',
  usage_begin_at DATE NOT NULL COMMENT '開始日',
  usage_end_at DATE NOT NULL COMMENT '終了日',
  usage_amount DECIMAL(15,5) UNSIGNED NOT NULL COMMENT '使用量(m^3)',
  usage_yen INT UNSIGNED NOT NULL COMMENT '料金(円)',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',

  PRIMARY KEY (usage_year, usage_month)
)
COMMENT '月間ガス使用状況'
;
