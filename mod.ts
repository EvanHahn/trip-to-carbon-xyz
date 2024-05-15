interface CarbonFootprintBaseOptions {
  baseUrl?: string;
  country: string;
  token?: string;
}
type CarbonFootprintDistanceOptions = {
  distance: {
    amount: number;
    unit: "miles";
    mode: string;
  };
};
type CarbonFootprintFuelOptions = {
  fuel: {
    amount: number;
    unit: "gallons";
    type: string;
  };
};
type CarbonFootprintOptions =
  & CarbonFootprintBaseOptions
  & (
    | CarbonFootprintDistanceOptions
    | CarbonFootprintFuelOptions
  );

function getUrl(options: CarbonFootprintOptions): URL {
  const {
    baseUrl = "https://api.triptocarbon.xyz",
    token,
  } = options;

  const result = new URL(baseUrl);
  const { searchParams } = result;

  result.pathname = "/v1/footprint";

  if (token) searchParams.set("appTkn", token);

  if ("distance" in options) {
    searchParams.set("activity", String(options.distance.amount));
    searchParams.set("activityType", "miles");
    searchParams.set("mode", options.distance.mode);
  } else if ("fuel" in options) {
    searchParams.set("activity", String(options.fuel.amount));
    searchParams.set("activityType", "fuel");
    searchParams.set("fuelType", options.fuel.type);
  } else {
    throw new Error("Please provide a `fuel` or `distance` option");
  }

  searchParams.set("country", options.country.toLowerCase() || "def");

  return result;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  Boolean(value) &&
  typeof value === "object" &&
  !Array.isArray(value)
);

const badResponseError = (): Error =>
  new Error("Bad response from the Trip to Carbon API");

function parseResponseData(responseData: unknown): number {
  if (!isRecord(responseData)) throw badResponseError();

  if ("errorMessage" in responseData) {
    if (typeof responseData.errorMessage === "string") {
      throw new Error(responseData.errorMessage);
    } else {
      throw badResponseError();
    }
  }

  const { carbonFootprint } = responseData;

  let result: number;
  switch (typeof carbonFootprint) {
    case "number":
      result = carbonFootprint;
      break;
    case "string":
      result = parseFloat(carbonFootprint);
      break;
    default:
      throw badResponseError();
  }

  if (Number.isFinite(result)) return result;

  throw badResponseError();
}

export async function carbonFootprint(
  options: CarbonFootprintOptions,
): Promise<number> {
  const response = await fetch(getUrl(options));

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch (_err) {
    throw new Error("Bad response from the Trip to Carbon API");
  }

  return parseResponseData(responseData);
}
