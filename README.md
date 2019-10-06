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
  appId: 'YourAppId',  //remove this property if you do not have an app id
  distance: {
    amount: 10,
    unit: 'miles',
    mode: 'taxi'
  }
})
console.log(`Your 10-mile taxi trip had a carbon footprint of ${taxiFootprint} kilograms.`)

const fuelFootprint = await carbonFootprint({
  country: 'GBR',
  appId: 'YourAppId',   //remove this property if you do not have an app id
  fuel: {
    amount: 456,
    unit: 'gallons',
    type: 'jetFuel'
  }
})

```
