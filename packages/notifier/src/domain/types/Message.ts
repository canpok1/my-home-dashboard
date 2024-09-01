import { messagingApi } from "@line/bot-sdk";

export type Message = messagingApi.Message;

export interface MessageRepository {
  sendMessage(
    channelId: string,
    to: string,
    messages: Message[]
  ): Promise<{ id: number; quoteToken?: string }[]>;

  bulkSendMessage(
    channelId: string,
    tos: string[],
    messages: Message[]
  ): Promise<void>;
}
