export interface AppStatusRepository {
  async upsertAppStatusStopped(appName: string, now: Date): Promise<void>;
  async upsertAppStatusRunning(appName: string, now: Date): Promise<void>;
  async upsertAppStatusError(appName: string, now: Date): Promise<void>;
}
