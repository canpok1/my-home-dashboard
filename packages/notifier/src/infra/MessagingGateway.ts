import createClient from "openapi-fetch";
import { components, paths } from "./types/MessagingGateway.gen";
import { messagingApi } from "@line/bot-sdk";
import { MessageRepository } from "../domain/types/Message";

export type SentMessageObject = components["schemas"]["SentMessageObject"];

export class MessagingGatewayClient implements MessageRepository {
  readonly client;

  constructor(origin?: string) {
    this.client = createClient<paths>({
      baseUrl: origin || "https://messaging-gateway.ktnet.info",
    });
  }

  async sendMessage(
    channelId: string,
    to: string,
    messages: messagingApi.Message[]
  ): Promise<messagingApi.SentMessage[]> {
    const { data, error } = await this.client.POST(
      "/api/line/v2/bot/message/push",
      {
        params: {
          header: {
            "X-MessagingGateway-Line-Channel-Id": channelId,
          },
        },
        body: {
          to: to,
          messages: messages.map((msg) => ({ ...msg })),
        },
      }
    );

    if (data?.sentMessages) {
      return data.sentMessages.map((msg) => ({ ...msg }));
    }

    if (error) {
      throw new Error(error.message);
    } else {
      throw new Error("data and error are empty");
    }
  }

  async bulkSendMessage(
    channelId: string,
    tos: string[],
    messages: messagingApi.Message[],
    onEachMessageSent?: (
      to: string,
      sentMessages: messagingApi.SentMessage[]
    ) => Promise<void>
  ): Promise<void> {
    const promises = [];
    for (const to of tos) {
      const func = async () => {
        const sentMessages = await this.sendMessage(channelId, to, messages);
        if (onEachMessageSent) {
          await onEachMessageSent(to, sentMessages);
        }
      };
      promises.push(func());
    }
    await Promise.all(promises);
  }
}
