import {
  assert,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { carbonFootprint } from "./mod.ts";

const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

const getBaseUrl = (server: Deno.HttpServer<Deno.NetAddr>): string =>
  `http://${server.addr.hostname}:${server.addr.port}`;

Deno.test("makes distance requests", async () => {
  const server = Deno.serve((req) => {
    const url = new URL(req.url);

    assertEquals(url.pathname, "/v1/footprint");

    assertEquals(url.searchParams.get("activity"), "10");
    assertEquals(url.searchParams.get("activityType"), "miles");
    assertEquals(url.searchParams.get("mode"), "taxi");
    assertEquals(url.searchParams.get("country"), "usa");
    assert(!url.searchParams.has("fuelType"));

    return json({ carbonFootprint: "1.23" });
  });

  assertEquals(
    await carbonFootprint({
      baseUrl: getBaseUrl(server),
      country: "USA",
      distance: {
        amount: 10,
        unit: "miles",
        mode: "taxi",
      },
    }),
    1.23,
  );

  await server.shutdown();
});

Deno.test("makes fuel requests", async () => {
  const server = Deno.serve((req) => {
    const url = new URL(req.url);

    assertEquals(url.pathname, "/v1/footprint");

    assertEquals(url.searchParams.get("activity"), "456");
    assertEquals(url.searchParams.get("activityType"), "fuel");
    assertEquals(url.searchParams.get("fuelType"), "jetFuel");
    assertEquals(url.searchParams.get("country"), "gbr");
    assert(!url.searchParams.get("mode"));

    return json({ carbonFootprint: "1.23" });
  });

  assertEquals(
    await carbonFootprint({
      baseUrl: getBaseUrl(server),
      country: "GBR",
      fuel: {
        amount: 456,
        unit: "gallons",
        type: "jetFuel",
      },
    }),
    1.23,
  );

  await server.shutdown();
});

Deno.test("token", async () => {
  const server = Deno.serve((req) => {
    const url = new URL(req.url);

    assertEquals(url.searchParams.get("appTkn"), "foobar");

    return json({ carbonFootprint: "1.23" });
  });

  assertEquals(
    await carbonFootprint({
      token: "foobar",
      baseUrl: getBaseUrl(server),
      country: "GBR",
      fuel: {
        amount: 456,
        unit: "gallons",
        type: "jetFuel",
      },
    }),
    1.23,
  );

  await server.shutdown();
});

Deno.test("errors from API", async () => {
  const server = Deno.serve(() => json({ errorMessage: "foobar" }));

  await assertRejects(
    () => (
      carbonFootprint({
        baseUrl: getBaseUrl(server),
        country: "USA",
        distance: {
          amount: 10,
          unit: "miles",
          mode: "taxi",
        },
      })
    ),
    Error,
    "foobar",
  );

  await server.shutdown();
});
