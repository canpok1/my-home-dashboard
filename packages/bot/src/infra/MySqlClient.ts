import { AppStatusRepository } from "../domain/types/AppStatus";
import {
  LineChannel,
  LineChannelRepository,
  LineUserRepository,
} from "../domain/types/Line";
import { PrismaClient } from "@prisma/client";

export class MySqlClient
  implements AppStatusRepository, LineChannelRepository, LineUserRepository
{
  constructor(private prisma: PrismaClient) {}
  async upsertAppStatusStopped(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "stopped",
          },
        },
        last_successful_at: now,
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "stopped",
          },
        },
        last_successful_at: now,
        updated_at: now,
      },
    });
  }

  async upsertAppStatusRunning(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "running",
          },
        },
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "running",
          },
        },
        updated_at: now,
      },
    });
  }

  async upsertAppStatusError(appName: string, now: Date): Promise<void> {
    await this.prisma.app_statuses.upsert({
      where: {
        app_name: appName,
      },
      create: {
        app_name: appName,
        app_status_types: {
          connect: {
            type_name: "error",
          },
        },
        last_failure_at: now,
      },
      update: {
        app_status_types: {
          connect: {
            type_name: "error",
          },
        },
        last_failure_at: now,
        updated_at: now,
      },
    });
  }

  async fetchAllLineChannels(): Promise<LineChannel[]> {
    return await this.prisma.line_channels.findMany();
  }

  async addLineUserIfNotExists(userId: string): Promise<void> {
    await this.prisma.line_users.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
      },
    });
  }

  async upsertElectricityNotifySetting(
    channelId: string,
    userId: string,
    enable: boolean
  ): Promise<number> {
    const settings = await this.prisma.electricity_notify_settings.findMany({
      where: {
        line_channel_id: channelId,
      },
    });

    for (const setting of settings) {
      await this.prisma.electricity_notify_dest_line_users.upsert({
        where: {
          electricity_notify_setting_id_line_user_id: {
            electricity_notify_setting_id: setting.id,
            line_user_id: userId,
          },
        },
        update: {
          notify_enable: enable,
        },
        create: {
          electricity_notify_setting_id: setting.id,
          line_user_id: userId,
          notify_enable: enable,
        },
      });
    }

    return settings.length;
  }
}
