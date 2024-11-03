import { Event } from "@line/bot-sdk/dist/webhook/api";

export interface LineChannel {
  id: string;
  memo: string | null;
}

export interface LineWebhookMessage {
  messageId: string;
  signature: string;
  destination: string;
  events: Event[];
}

export interface LineChannelRepository {
  fetchAllLineChannels(): Promise<LineChannel[]>;
}

export interface LineUserRepository {
  addLineUserIfNotExists(userId: string): Promise<void>;
  upsertElectricityNotifySetting(
    channelId: string,
    userId: string,
    enable: boolean
  ): Promise<number>;
}

export interface LineWebhookMessageRepository {
  fetchWebhookMessages(channelId: string): Promise<LineWebhookMessage[]>;
  deleteWebhookMessage(channelId: string, messageId: string): Promise<void>;
}
