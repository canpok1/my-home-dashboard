import createClient from "openapi-fetch";
import { paths } from "./types/MessagingGateway.gen";

export class MessagingGatewayClient {
  readonly client;

  constructor(origin?: string) {
    this.client = createClient<paths>({
      baseUrl: origin || "https://messaging-gateway.ktnet.info",
    });
  }
}
