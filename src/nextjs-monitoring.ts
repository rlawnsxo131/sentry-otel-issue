import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { NodeSDK, resources, tracing } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { api } from "@opentelemetry/sdk-node";
import { HostMetrics } from "@opentelemetry/host-metrics";
import setupNodeMetrics from "opentelemetry-node-metrics";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";

let meterProvider: MeterProvider | null = null;
let histogram: api.Histogram | null = null;

export async function registerNextjsMonitoring() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const zipkinServiceName = "zipkinServiceName";
    const httpInstrumentation = new HttpInstrumentation();

    const sdk = new NodeSDK({
      resource: new resources.Resource({
        [ATTR_SERVICE_NAME]: zipkinServiceName,
      }),
      spanProcessors: [
        new tracing.BatchSpanProcessor(
          new ZipkinExporter({
            url: "",
            serviceName: zipkinServiceName,
          })
        ),
        {
          onStart(span) {
            console.log("-------onStart-------");
            console.log(
              "[info]",
              "span_type:",
              span.attributes["next.span_type"],
              "route:",
              span.attributes["next.route"]
            );
          },
          onEnd(span) {
            if (!meterProvider) {
              return;
            }

            // logging
            console.log("-------onEnd-------");
            console.log(
              "[info]",
              "span_type:",
              span.attributes["next.span_type"],
              "route:",
              span.attributes["next.route"]
            );

            // Logic that wants normal operation
            if (
              span.attributes["next.span_type"] !== "BaseServer.handleRequest"
            ) {
              return;
            }

            const method = span.attributes["http.method"];
            const route = span.attributes["next.route"];

            if (!method || !route) {
              return;
            }

            const startTime = span.startTime;
            const endTime = span.endTime;

            // milliseconds
            const duration =
              endTime[0] -
              startTime[0] * 1e3 +
              (endTime[1] = startTime[1]) / 1e6;

            if (!histogram) {
              histogram = meterProvider
                .getMeter(httpInstrumentation.instrumentationName)
                .createHistogram("http_response_time_by_route", {
                  unit: "ms",
                  advice: {
                    explicitBucketBoundaries: [],
                  },
                });
            }
            histogram.record(duration, { method, route });
          },
          async forceFlush() {},
          async shutdown() {},
        },
      ],
      instrumentations: [httpInstrumentation, new ExpressInstrumentation()],
      metricReader: new PrometheusExporter(),
    });

    sdk.start();

    if (!meterProvider) {
      meterProvider = api.metrics.getMeterProvider() as MeterProvider;
    }

    const hostMetrics = new HostMetrics();

    hostMetrics.start();
    setupNodeMetrics(meterProvider);

    process.on("SIGTERM", () => {
      sdk
        .shutdown()
        .then(() => console.log("Tracing terminated"))
        .catch((err) => console.error(err))
        .finally(() => process.exit(0));
    });
  }
}
