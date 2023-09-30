import bunyan, { LogLevelString, levelFromName } from "bunyan";
import { CommonEnv } from "./Env";
import Logger from "bunyan";
import BunyanSlack from "bunyan-slack";

const LogLevelStrings = ["trace", "debug", "info", "warn", "error", "fatal"];

export function isLogLevelString(s: string): s is LogLevelString {
  return LogLevelStrings.some((v) => v === s);
}

export function toLogLevel(s: string): number {
  if (isLogLevelString(s)) {
    return levelFromName[s];
  }
  throw new Error(`cannot convert to log level, string[${s}] is not supported`);
}

export function createLogger(env: CommonEnv): Logger {
  return bunyan.createLogger({
    name: "fetcher",
    streams: [
      {
        stream: process.stdout,
      },
      {
        type: "raw",
        stream: new BunyanSlack({
          webhookUrl: env.slackWebhookUrl,
          customFormatter: formatSlack,
        }),
        level: env.slackLogLevel,
      },
    ],
    level: env.logLevel,
  });
}

type LogRecord = {
  msg: string;
  err?: Error;
};

type SlackMessage = {
  attachments: any[];
};

function formatSlack(
  record: LogRecord,
  levelName: LogLevelString
): SlackMessage {
  let color: string = "";
  switch (levelName) {
    case "trace":
    case "debug":
      color = "#F4FBFE";
      break;
    case "info":
      color = "#36a64f";
      break;
    case "warn":
      color = "#ffd900";
      break;
    case "error":
      color = "#ff0000";
      break;
    case "fatal":
      color = "#000000";
      break;
  }

  const fields = [
    {
      title: "level",
      value: String(levelName),
      short: true,
    },
  ];
  if (record.err?.stack) {
    fields.push({
      title: "stack trace",
      value: record.err.stack,
      short: false,
    });
  }

  return {
    attachments: [
      {
        text: record.msg,
        color: color,
        fields: fields,
      },
    ],
  };
}
