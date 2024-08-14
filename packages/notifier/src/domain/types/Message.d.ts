import { messagingApi } from "@line/bot-sdk";

export type Message = messagingApi.Message;

export interface MessageRepository {
  async sendMessage(
    channelId: string,
    to: string,
    messages: Message[]
  ): Promise<SentMessageObject[]>

  async bulkSendMessage(
    channelId: string,
    tos: string[],
    messages: Message[]
  ): Promise<void>;
}
