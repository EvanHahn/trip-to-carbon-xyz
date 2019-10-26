import axios from 'axios';

interface CarbonFootprintBaseOptions {
  baseUrl?: string,
  country: string,
  token?: string,
}
type CarbonFootprintDistanceOptions = {
  distance: {
    amount: number,
    unit: 'miles',
    mode: string
  }
}
type CarbonFootprintFuelOptions = {
  fuel: {
    amount: number,
    unit: 'gallons',
    type: string
  }
}
type CarbonFootprintOptions = CarbonFootprintBaseOptions & (
  CarbonFootprintDistanceOptions |
  CarbonFootprintFuelOptions
)

export async function carbonFootprint(options: CarbonFootprintOptions): Promise<number> {
  const baseUrl = 'baseUrl' in options ? options.baseUrl : 'https://api.triptocarbon.xyz'

  const params = new URLSearchParams()

  if ('token' in options) {
    params.set('appTkn', options.token!)
  }
  if ('distance' in options) {
    if ('fuel' in options) {
      throw new Error('The `fuel` and `distance` options are mutually exclusive')
    }
    params.set('activity', String(options.distance.amount))
    params.set('activityType', 'miles')
    params.set('mode', options.distance.mode)
  } else if ('fuel' in options) {
    params.set('activity', String(options.fuel.amount))
    params.set('activityType', 'fuel')
    params.set('fuelType', options.fuel.type);
  } else {
    throw new Error('Please provide a `fuel` or `distance` option')
  }
  params.set('country', transformCountryOption(options.country))

  const {data} = await axios.get('/v1/footprint', {
    baseURL: baseUrl,
    params,
    validateStatus: alwaysTrue
  })

  if (!data || (typeof data !== 'object')) {
    throw new Error('Bad response from the Trip to Carbon API')
  } else if ('errorMessage' in data) {
    throw new Error(data.errorMessage)
  }

  return parseFloat(data.carbonFootprint)
}

function alwaysTrue(): true {
  return true
}

function transformCountryOption(countryOption: string) {
  const lowercased = countryOption.toLowerCase();
  switch (lowercased) {
    case 'usa':
    case 'gbr':
      return lowercased
    default:
      return 'def'
  }
}
