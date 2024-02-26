export interface AppStatusRepository {
  upsertStopped(appName: string, now: Date): Promise<void>;
  upsertRunning(appName: string, now: Date): Promise<void>;
  upsertError(appName: string, now: Date): Promise<void>;
}
