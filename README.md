trip-to-carbon
==============

A wrapper for the [Trip to Carbon API](https://triptocarbon.xyz/).

Install it from npm:

```sh
npm install trip-to-carbon-xyz
```

Usage:

```javascript
import { carbonFootprint } from 'trip-to-carbon-xyz'

const taxiFootprint = await carbonFootprint({
  country: 'USA',
  distance: {
    amount: 10,
    unit: 'miles',
    mode: 'taxi'
  }
})
console.log(`Your 10-mile taxi trip had a carbon footprint of ${taxiFootprint} kilograms.`)

const fuelFootprint = await carbonFootprint({
  country: 'GBR',
  fuel: {
    amount: 456,
    unit: 'gallons',
    type: 'jetFuel'
  }
})
//If you have an id token
const taxiFootprint = await carbonFootprint({
  country: 'USA',
  id: 'SomeIdFromGottenTheSite',
  distance: {
    amount: 10,
    unit: 'miles',
    mode: 'taxi'
  }
})
console.log(`Your 10-mile taxi trip had a carbon footprint of ${taxiFootprint} kilograms.`)

const fuelFootprint = await carbonFootprint({
  country: 'GBR',
  id: 'SomeIdFromGottenTheSite'
  fuel: {
    amount: 456,
    unit: 'gallons',
    type: 'jetFuel'
  }
})

```
