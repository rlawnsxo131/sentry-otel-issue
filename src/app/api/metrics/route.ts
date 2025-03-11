export async function GET() {
  const response = await fetch("http://localhost:9464/metrics");
  const data = await response.text();
  return new Response(data, { status: 200 });
}
