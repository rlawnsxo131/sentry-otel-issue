export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    (await import("./nextjs-monitoring")).registerNextjsMonitoring();

    // The results will vary depending on whether this line is commented out or not.
    await import("../sentry.server.config");
  }
}
