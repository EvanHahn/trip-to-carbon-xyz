import { carbonFootprint } from '../trip-to-carbon'
import getPort from 'get-port'
import http, { IncomingMessage, ServerResponse, RequestListener, Server } from 'http'

describe('carbonFootprint', () => {
  const fakeServers: Server[] = []

  function createFakeServer (requestListener: RequestListener): Promise<Server> {
    const result = http.createServer(requestListener)
    fakeServers.push(result)
    return getPort().then((port: number) => (
      new Promise((resolve, reject) => {
        result.on('listening', () => {
          resolve(result)
        })
        result.on('error', reject)
        result.listen(port)
      })
    ))
  }

  function getBaseUrl (server: Server): string {
    const address = server.address()
    if (!address || (typeof address !== 'object')) {
      throw new Error('Expected the server to have an object address')
    }
    return `http://localhost:${address.port}`
  }

  function json (res: ServerResponse, toWrite: unknown): void {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(toWrite))
  }

  function parseUrlParams (req: IncomingMessage): URLSearchParams {
    return new URL(req.url || '/', 'https://fake.example.com').searchParams
  }

  afterEach(async () => {
    await Promise.all(fakeServers.map(server => (
      new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    )))
    fakeServers.length = 0
  })

  describe('distance requests', () => {
    it('returns the carbon footprint value from the server', async () => {
      const server = await createFakeServer((_req, res) => {
        json(res, { carbonFootprint: '1.23' })
      })
      expect(await carbonFootprint({
        baseUrl: getBaseUrl(server),
        country: 'USA',
        distance: {
          amount: 10,
          unit: 'miles',
          mode: 'taxi'
        }
      })).toEqual(1.23)
    })

    it('sends the right query parameters', async () => {
      const server = await createFakeServer((req, res) => {
        const searchParams = parseUrlParams(req)
        expect(searchParams.get('activity')).toEqual('456')
        expect(searchParams.get('activityType')).toEqual('miles')
        expect(searchParams.get('mode')).toEqual('taxi')
        expect(searchParams.get('country')).toEqual('usa')
        expect(searchParams.has('fuelType')).toBeFalsy()

        json(res, { carbonFootprint: '1.23' })
      })

      await carbonFootprint({
        baseUrl: getBaseUrl(server),
        country: 'USA',
        distance: {
          amount: 456,
          unit: 'miles',
          mode: 'taxi'
        }
      })
    })
  })

  describe('fuel requests', () => {
    it('returns the carbon footprint value from the server', async () => {
      const server = await createFakeServer((_req, res) => {
        json(res, { carbonFootprint: '1.23' })
      })
      expect(await carbonFootprint({
        baseUrl: getBaseUrl(server),
        country: 'USA',
        fuel: {
          amount: 456,
          unit: 'gallons',
          type: 'jetFuel'
        }
      })).toEqual(1.23)
    })

    it('sends the right query parameters', async () => {
      const server = await createFakeServer((req, res) => {
        const searchParams = parseUrlParams(req)
        expect(searchParams.get('activity')).toEqual('456')
        expect(searchParams.get('activityType')).toEqual('fuel')
        expect(searchParams.get('fuelType')).toEqual('jetFuel')
        expect(searchParams.get('country')).toEqual('gbr')
        expect(searchParams.has('mode')).toBeFalsy()

        json(res, { carbonFootprint: '1.23' })
      })

      await carbonFootprint({
        baseUrl: getBaseUrl(server),
        country: 'GBR',
        fuel: {
          amount: 456,
          unit: 'gallons',
          type: 'jetFuel'
        }
      })
    })
  })
})
