ALTER TABLE electricity_notify_dest_line_users
  ADD COLUMN last_notified_at DATETIME COMMENT '最終通知日時(UTC)' AFTER line_user_id
;
