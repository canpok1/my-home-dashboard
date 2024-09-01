ALTER TABLE electricity_notify_dest_line_users
  ADD COLUMN notify_enable BOOLEAN NOT NULL DEFAULT TRUE COMMENT '通知処理の有効化' AFTER line_user_id
;
