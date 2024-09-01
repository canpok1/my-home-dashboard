export interface AppStatusRepository {
  upsertAppStatusStopped(appName: string, now: Date): Promise<void>;
  upsertAppStatusRunning(appName: string, now: Date): Promise<void>;
  upsertAppStatusError(appName: string, now: Date): Promise<void>;
}
