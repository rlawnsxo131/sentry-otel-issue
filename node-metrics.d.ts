declare module "opentelemetry-node-metrics" {
  export default function setupNodeMetrics(
    meterProvider: import("@opentelemetry/sdk-metrics").MeterProvider,
    config?: { prefix: string; labels: Record<string, string> }
  ): void;
}
