import createClient from "openapi-fetch";
import { paths } from "./types/MessagingGateway.gen";
import {
  LineWebhookMessage,
  LineWebhookMessageRepository,
} from "../domain/types/Line";
import { Event } from "@line/bot-sdk/dist/webhook/api";

export class MessagingGatewayClient implements LineWebhookMessageRepository {
  readonly client;

  constructor(
    private consumer: string,
    origin?: string
  ) {
    this.client = createClient<paths>({
      baseUrl: origin || "https://messaging-gateway.ktnet.info",
    });
  }

  async fetchWebhookMessages(channelId: string): Promise<LineWebhookMessage[]> {
    const { data, error } = await this.client.GET(
      "/api/line/webhook/{channelId}/messages/new",
      {
        params: {
          path: { channelId },
          query: { consumer: this.consumer, max_idle_time_ms: 5 * 60 * 1000 },
        },
      }
    );
    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data?.messages) {
      return [];
    }
    return data.messages.map((msg) => ({
      messageId: msg.messageId || "",
      signature: msg.signature,
      destination: msg.destination,
      events: msg.events.map((e) => e as Event),
    }));
  }

  async deleteWebhookMessage(
    channelId: string,
    messageId: string
  ): Promise<void> {
    const { data, error } = await this.client.DELETE(
      "/api/line/webhook/{channelId}/messages/{messageId}",
      {
        params: {
          path: { channelId, messageId },
        },
      }
    );
    if (error) {
      throw new Error(error.message);
    }
  }
}
