import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "john-dsn",
  release: "john-release",
});
