import createClient from "openapi-fetch";
import { components, paths } from "./MessagingGateway.gen";
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
  ): Promise<SentMessageObject[]> {
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
      return data.sentMessages;
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
    messages: messagingApi.Message[]
  ): Promise<void> {
    const promises = [];
    for (const to of tos) {
      promises.push(this.sendMessage(channelId, to, messages));
    }
    await Promise.all(promises);
  }
}
