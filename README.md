# trip-to-carbon

A wrapper for the [Trip to Carbon API](https://triptocarbon.xyz/).

Install it from npm:

```sh
npm install trip-to-carbon-xyz
```

Usage:

```javascript
import { carbonFootprint } from "trip-to-carbon-xyz";

const taxiFootprint = await carbonFootprint({
  token: "YourAppToken", // optional
  country: "USA",
  distance: {
    amount: 10,
    unit: "miles",
    mode: "taxi",
  },
});
console.log(
  `Your 10-mile taxi trip had a carbon footprint of ${taxiFootprint} kilograms.`,
);

const fuelFootprint = await carbonFootprint({
  token: "YourAppToken", // optional
  country: "GBR",
  fuel: {
    amount: 456,
    unit: "gallons",
    type: "jetFuel",
  },
});
```
