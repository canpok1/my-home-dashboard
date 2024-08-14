ALTER TABLE electricity_notify_settings
  ADD COLUMN template TEXT NOT NULL DEFAULT '' COMMENT '通知メッセージのテンプレート' AFTER notify_enable
;
