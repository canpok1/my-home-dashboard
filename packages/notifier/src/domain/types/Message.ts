import { messagingApi } from "@line/bot-sdk";

export type Message = messagingApi.Message;

export interface MessageRepository {
  sendMessage(
    channelId: string,
    to: string,
    messages: Message[]
  ): Promise<messagingApi.SentMessage[]>;

  bulkSendMessage(
    channelId: string,
    tos: string[],
    messages: Message[],
    onEachMessageSent?: (
      to: string,
      sentMessages: messagingApi.SentMessage[]
    ) => Promise<void>
  ): Promise<void>;
}
