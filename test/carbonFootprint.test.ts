import { carbonFootprint } from '../trip-to-carbon'
import express, { Request, Response } from 'express'
import getPort from 'get-port'
import http, { Server } from 'http'

describe('carbonFootprint', () => {
  const fakeServers: Server[] = []

  function createFakeServer (requestListener: (req: Request, res: Response) => void): Promise<Server> {
    const app = express()
    app.get('/v1/footprint', requestListener)

    const result = http.createServer(app)

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

  it('makes distance requests', async () => {
    const server = await createFakeServer((req, res) => {
      expect(req.query.activity).toEqual('10')
      expect(req.query.activityType).toEqual('miles')
      expect(req.query.mode).toEqual('taxi')
      expect(req.query.country).toEqual('usa')
      expect(req.query.fuelType).toBeFalsy()

      res.json({ carbonFootprint: '1.23' })
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

  it('makes fuel requests', async () => {
    const server = await createFakeServer((req, res) => {
      expect(req.query.activity).toEqual('456')
      expect(req.query.activityType).toEqual('fuel')
      expect(req.query.fuelType).toEqual('jetFuel')
      expect(req.query.country).toEqual('gbr')
      expect(req.query.mode).toBeFalsy()

      res.json({ carbonFootprint: '1.23' })
    })

    expect(await carbonFootprint({
      baseUrl: getBaseUrl(server),
      country: 'GBR',
      fuel: {
        amount: 456,
        unit: 'gallons',
        type: 'jetFuel'
      }
    })).toEqual(1.23)
  })

  it('handles errors from the API', async () => {
    const server = await createFakeServer((_req, res) => {
      res.json({ errorMessage: 'bing bong' })
    })

    await expect(carbonFootprint({
      baseUrl: getBaseUrl(server),
      country: 'USA',
      distance: {
        amount: 10,
        unit: 'miles',
        mode: 'taxi'
      }
    })).rejects.toThrow('bing bong')
  })
})
