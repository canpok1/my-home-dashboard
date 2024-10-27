export interface LineChannel {
  id: string;
}

export interface LineRepository {
  fetchAllLineChannels(): Promise<LineChannel[]>;
}
