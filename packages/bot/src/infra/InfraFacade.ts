import { AppStatusRepository } from "../domain/types/AppStatus";
import {
  LineChannel,
  LineChannelRepository,
  LineUserRepository,
  LineWebhookMessage,
  LineWebhookMessageRepository,
} from "../domain/types/Line";
import { MessagingGatewayClient } from "./MessagingGateway";
import { MySqlClient } from "./MySqlClient";

export class InfraFacade
  implements
    AppStatusRepository,
    LineChannelRepository,
    LineUserRepository,
    LineWebhookMessageRepository
{
  constructor(
    private mySqlClient: MySqlClient,
    private messagingGatewayClient: MessagingGatewayClient
  ) {}

  fetchWebhookMessages(channelId: string): Promise<LineWebhookMessage[]> {
    return this.messagingGatewayClient.fetchWebhookMessages(channelId);
  }

  deleteWebhookMessage(channelId: string, messageId: string): Promise<void> {
    return this.messagingGatewayClient.deleteWebhookMessage(
      channelId,
      messageId
    );
  }

  addLineUserIfNotExists(userId: string): Promise<void> {
    return this.mySqlClient.addLineUserIfNotExists(userId);
  }

  upsertElectricityNotifySetting(
    channelId: string,
    userId: string,
    enable: boolean
  ): Promise<number> {
    return this.mySqlClient.upsertElectricityNotifySetting(
      channelId,
      userId,
      enable
    );
  }

  fetchAllLineChannels(): Promise<LineChannel[]> {
    return this.mySqlClient.fetchAllLineChannels();
  }

  upsertAppStatusStopped(appName: string, now: Date): Promise<void> {
    return this.mySqlClient.upsertAppStatusStopped(appName, now);
  }

  upsertAppStatusRunning(appName: string, now: Date): Promise<void> {
    return this.mySqlClient.upsertAppStatusRunning(appName, now);
  }

  upsertAppStatusError(appName: string, now: Date): Promise<void> {
    return this.mySqlClient.upsertAppStatusError(appName, now);
  }
}
