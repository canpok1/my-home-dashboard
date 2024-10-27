import Logger from "bunyan";
import { LineChannel, LineRepository } from "./types/Line";

export class EventProcessor {
  constructor(private lineRepo: LineRepository) {}

  async process(logger: Logger): Promise<void> {
    const lineChannels = await this.lineRepo.fetchAllLineChannels();

    for (const lineChannel of lineChannels) {
      const childLogger = logger.child({ line_channel_id: lineChannel.id });
      await this.processByLineChannel(childLogger, lineChannel);
    }
  }

  private async processByLineChannel(
    logger: Logger,
    linechannel: LineChannel
  ): Promise<void> {
    logger.info(`start by LINE Channel [${linechannel.id}]`);
  }
}
