import Logger from "bunyan";
import {
  LineChannel,
  LineChannelRepository,
  LineUserRepository,
  LineWebhookMessage,
  LineWebhookMessageRepository,
} from "./types/Line";
import {
  Event,
  FollowEvent,
  UnfollowEvent,
} from "@line/bot-sdk/dist/webhook/api";

export class EventProcessor {
  constructor(
    private repo: LineChannelRepository &
      LineUserRepository &
      LineWebhookMessageRepository
  ) {}

  async process(logger: Logger): Promise<void> {
    const lineChannels = await this.repo.fetchAllLineChannels();

    for (const lineChannel of lineChannels) {
      const childLogger = logger.child({ line_channel_id: lineChannel.id });
      await this.processByLineChannel(childLogger, lineChannel);
    }
  }

  private async processByLineChannel(
    logger: Logger,
    lineChannel: LineChannel
  ): Promise<void> {
    logger.info(
      `process by LINE Channel ${lineChannel.memo}[${lineChannel.id}]`
    );

    const messages = await this.repo.fetchWebhookMessages(lineChannel.id);
    logger.info(`fetched message count is ${messages.length}`);

    for (const message of messages) {
      const childLogger = logger.child({ message_id: message.messageId });
      await this.handleMessage(childLogger, lineChannel, message);
    }
  }

  private async handleMessage(
    logger: Logger,
    lineChannel: LineChannel,
    message: LineWebhookMessage
  ): Promise<void> {
    try {
      logger.info(
        `handle message [${message.messageId}], event count is ${message.events.length}`
      );

      for (const event of message.events) {
        const childLogger = logger.child({
          event_type: event.type,
          webhook_event_id: event.webhookEventId,
        });
        await this.handleEvent(childLogger, lineChannel, event);
      }

      await this.repo.deleteWebhookMessage(lineChannel.id, message.messageId);
    } catch (err) {
      logger.error({ err }, `failed handle message [${message.messageId}]`);
    }
  }

  private async handleEvent(
    logger: Logger,
    lineChannel: LineChannel,
    event: Event
  ): Promise<void> {
    try {
      logger.info(`handle event [${event.type}]`);
      switch (event.type) {
        case "follow":
          this.handleFollowEvent(logger, lineChannel, event);
          break;
        case "unfollow":
          this.handleUnfollowEvent(logger, lineChannel, event);
          break;
        default:
          logger.warn(`event type [${event.type}] is not supported`);
      }
    } catch (err) {
      logger.error({ err }, `failed handle event [${event.type}]`);
    }
  }

  private async handleFollowEvent(
    logger: Logger,
    lineChannel: LineChannel,
    event: FollowEvent
  ): Promise<void> {
    if (!event.source) {
      logger.warn(`skip event, source is not found`);
      return;
    }
    if (event.source.type != "user") {
      logger.warn(`skip event, source type [${event.source.type}] is not user`);
      return;
    }
    if (!event.source.userId) {
      logger.warn(`skip event, source userId is not found`);
      return;
    }

    const userId = event.source.userId;
    await this.repo.addLineUserIfNotExists(userId);
    await this.repo.upsertElectricityNotifySetting(
      lineChannel.id,
      userId,
      true
    );
    logger.info(`update notify setting to enable for user[${userId}]`);
  }

  private async handleUnfollowEvent(
    logger: Logger,
    lineChannel: LineChannel,
    event: UnfollowEvent
  ): Promise<void> {
    if (!event.source) {
      logger.warn(`skip event, source is not found`);
      return;
    }
    if (event.source.type != "user") {
      logger.warn(`skip event, source type [${event.source.type}] is not user`);
      return;
    }
    if (!event.source.userId) {
      logger.warn(`skip event, source userId is not found`);
      return;
    }

    const userId = event.source.userId;
    await this.repo.upsertElectricityNotifySetting(
      lineChannel.id,
      userId,
      false
    );
    logger.info(`update notify setting to disable for user[${userId}]`);
  }
}
