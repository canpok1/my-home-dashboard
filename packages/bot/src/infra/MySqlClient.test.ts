import { PrismaClient } from "@prisma/client";
import { MySqlClient } from "./MySqlClient";

const prisma = vPrisma.client as unknown as PrismaClient;

describe("MySqlClient", () => {
  const client = new MySqlClient(prisma);

  describe("upsertAppStatusStopped", () => {
    describe("app_statusesのレコードが存在しない", () => {
      it("レコードが追加されること", async () => {
        const appName = "test";
        const now = new Date();

        await client.upsertAppStatusStopped(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "stopped",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });

    describe("app_statusesのレコードが存在する", () => {
      const appName = "test";

      beforeEach(async () => {
        await prisma.app_statuses.create({
          data: {
            app_name: appName,
            status_type_id: 2, // error
          },
        });
      });

      it("レコードが更新されること", async () => {
        const now = new Date();

        await client.upsertAppStatusStopped(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "stopped",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });
  });

  describe("upsertAppStatusRunning", () => {
    describe("app_statusesのレコードが存在しない", () => {
      it("レコードが追加されること", async () => {
        const appName = "test";
        const now = new Date();

        await client.upsertAppStatusRunning(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "running",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });

    describe("app_statusesのレコードが存在する", () => {
      const appName = "test";

      beforeEach(async () => {
        await prisma.app_statuses.create({
          data: {
            app_name: appName,
            status_type_id: 2, // error
          },
        });
      });

      it("レコードが更新されること", async () => {
        const now = new Date();

        await client.upsertAppStatusRunning(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "running",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });
  });

  describe("upsertAppStatusError", () => {
    describe("app_statusesのレコードが存在しない", () => {
      it("レコードが追加されること", async () => {
        const appName = "test";
        const now = new Date();

        await client.upsertAppStatusError(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "error",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });

    describe("app_statusesのレコードが存在する", () => {
      const appName = "test";

      beforeEach(async () => {
        await prisma.app_statuses.create({
          data: {
            app_name: appName,
            status_type_id: 0, // stopped
          },
        });
      });

      it("レコードが更新されること", async () => {
        const now = new Date();

        await client.upsertAppStatusError(appName, now);

        const records = await prisma.app_statuses.findMany({
          where: {
            app_status_types: {
              type_name: "error",
            },
          },
        });
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("app_name", appName);
      });
    });
  });

  describe("fetchAllLineChannels", () => {
    describe("line_channelsにレコードが0件", () => {
      it("空配列を返すこと", async () => {
        const records = await client.fetchAllLineChannels();

        expect(records).toHaveLength(0);
      });
    });

    describe("line_channelsにレコードが複数件", () => {
      const existsRecord1 = { id: "aaaa", memo: "レコード1" };
      const existsRecord2 = { id: "bbbb", memo: "レコード2" };

      beforeEach(async () => {
        await prisma.line_channels.createMany({
          data: [existsRecord1, existsRecord2],
        });
      });

      it("登録レコードが取得できること", async () => {
        const records = await client.fetchAllLineChannels();

        expect(records).toHaveLength(2);
        expect(records).toContainEqual(expect.objectContaining(existsRecord1));
        expect(records).toContainEqual(expect.objectContaining(existsRecord2));
      });
    });
  });

  describe("addLineUserIfNotExists", () => {
    describe("line_usersに該当レコードが存在しない", () => {
      it("レコードが追加されること", async () => {
        const userId = "aaaa";

        await client.addLineUserIfNotExists(userId);

        const records = await prisma.line_users.findMany();
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("id", userId);
      });
    });

    describe("line_usersに該当レコードが存在する", () => {
      const existsRecord = { id: "aaaa", memo: "レコード1" };

      beforeEach(async () => {
        await prisma.line_users.create({
          data: existsRecord,
        });
      });

      it("レコードが追加されないこと", async () => {
        await client.addLineUserIfNotExists(existsRecord.id);

        const records = await prisma.line_users.findMany();
        expect(records).toHaveLength(1);
        expect(records[0]).toHaveProperty("id", existsRecord.id);
      });
    });
  });

  describe("upsertElectricityNotifySetting", () => {
    const fetchSetting = {
      id: 10,
      setting_name: "取得設定",
      electricity_site_id: 11,
      user_name: "ユーザー",
      encrypted_password: "password",
      fetch_enable: true,
    };

    beforeEach(async () => {
      await prisma.electricity_fetch_settings.create({ data: fetchSetting });
    });

    const createRecords = async (
      lineChannelId: string,
      notifySettingId?: bigint,
      lineUserId?: string
    ): Promise<void> => {
      await prisma.line_channels.upsert({
        where: {
          id: lineChannelId,
        },
        update: {},
        create: {
          id: lineChannelId,
          memo: "dummy memo",
        },
      });
      if (notifySettingId) {
        await prisma.electricity_notify_settings.upsert({
          where: {
            id: notifySettingId,
          },
          update: {},
          create: {
            id: notifySettingId,
            electricity_fetch_setting_id: fetchSetting.id,
            line_channel_id: lineChannelId,
            notify_date: 1,
            notify_enable: true,
            template: "dummy template",
          },
        });
      }
      if (lineUserId) {
        await prisma.line_users.upsert({
          where: {
            id: lineUserId,
          },
          update: {},
          create: {
            id: lineUserId,
            memo: "dummy memo",
          },
        });
      }
      if (notifySettingId && lineUserId) {
        await prisma.electricity_notify_dest_line_users.upsert({
          where: {
            electricity_notify_setting_id_line_user_id: {
              electricity_notify_setting_id: notifySettingId,
              line_user_id: lineUserId,
            },
          },
          update: {},
          create: {
            electricity_notify_setting_id: notifySettingId,
            line_user_id: lineUserId,
            notify_enable: true,
          },
        });
      }
    };

    describe("条件に一致しないレコードが存在する", () => {
      const otherChannelId = "bbbb";
      const otherNotifySettingId = 11n;
      const otherLineUserId = "cccc";

      beforeEach(async () => {
        await createRecords(
          otherChannelId,
          otherNotifySettingId,
          otherLineUserId
        );
      });

      describe("channelIdが一致するelectricity_notify_settingsが存在しない", () => {
        it("electricity_notify_dest_line_usersが作成・更新されないこと", async () => {
          const channelId = "xxxx";
          const userId = "yyyy";
          const enable = true;
          const beforeRecordCount =
            await prisma.electricity_notify_dest_line_users.count();

          const result = await client.upsertElectricityNotifySetting(
            channelId,
            userId,
            enable
          );

          expect(result).toBe(0);

          const afterRecords =
            await prisma.electricity_notify_dest_line_users.findMany();
          expect(afterRecords).toHaveLength(beforeRecordCount);
        });
      });

      describe("channelIdが一致するelectricity_notify_settingsが複数存在する", () => {
        const channelId = "xxxx";
        const notifySettingId1 = 101n;
        const notifySettingId2 = 102n;
        const userId = "yyyy";
        const beforeEnable = false;

        beforeEach(async () => {
          await createRecords(channelId, notifySettingId1, userId);
          await createRecords(channelId, notifySettingId2, userId);
          await prisma.electricity_notify_dest_line_users.updateMany({
            where: {
              line_user_id: userId,
            },
            data: { notify_enable: beforeEnable },
          });
        });

        it("既存ユーザーを指定するとelectricity_notify_dest_line_usersが更新されること", async () => {
          const newEnable = !beforeEnable;
          const beforeRecordCount =
            await prisma.electricity_notify_dest_line_users.count();

          const result = await client.upsertElectricityNotifySetting(
            channelId,
            userId,
            newEnable
          );

          expect(result).toBe(2);

          const afterRecordCount =
            await prisma.electricity_notify_dest_line_users.count();
          expect(afterRecordCount).toBe(beforeRecordCount);

          const updatedRecords =
            await prisma.electricity_notify_dest_line_users.findMany({
              where: {
                line_user_id: userId,
              },
            });
          expect(updatedRecords).toHaveLength(2);
          expect(updatedRecords).toContainEqual(
            expect.objectContaining({
              electricity_notify_setting_id: notifySettingId1,
              notify_enable: newEnable,
            })
          );
          expect(updatedRecords).toContainEqual(
            expect.objectContaining({
              electricity_notify_setting_id: notifySettingId2,
              notify_enable: newEnable,
            })
          );
        });

        describe("electricity_notify_settingと紐づいていないline_userが存在する", () => {
          const newUserId = "zzzz";

          beforeEach(async () => {
            await prisma.line_users.create({ data: { id: newUserId } });
          });

          it("新規ユーザーを指定するとelectricity_notify_dest_line_usersが新規作成されること", async () => {
            const newEnable = !beforeEnable;
            const beforeRecordCount =
              await prisma.electricity_notify_dest_line_users.count();

            const result = await client.upsertElectricityNotifySetting(
              channelId,
              newUserId,
              newEnable
            );

            expect(result).toBe(2);

            const afterRecordCount =
              await prisma.electricity_notify_dest_line_users.count();
            expect(afterRecordCount).toBe(beforeRecordCount + 2);

            const newRecords =
              await prisma.electricity_notify_dest_line_users.findMany({
                where: {
                  line_user_id: newUserId,
                },
              });
            expect(newRecords).toHaveLength(2);
            expect(newRecords).toContainEqual(
              expect.objectContaining({
                electricity_notify_setting_id: notifySettingId1,
                notify_enable: newEnable,
              })
            );
            expect(newRecords).toContainEqual(
              expect.objectContaining({
                electricity_notify_setting_id: notifySettingId2,
                notify_enable: newEnable,
              })
            );
          });
        });
      });
    });
  });
});
