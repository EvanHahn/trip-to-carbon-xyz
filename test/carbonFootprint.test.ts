import { carbonFootprint } from '../trip-to-carbon'
import express, { Request, Response } from 'express'
import http from 'http'

const TEST_PORT = 3000

describe('carbonFootprint', () => {
  let requestHandler: ((req: Request, res: Response) => void)

  const testApp = express()
  testApp.get('/v1/footprint', (req, res) => {
    requestHandler(req, res)
  })
  const testServer = http.createServer(testApp)

  const baseUrl = `http://localhost:${TEST_PORT}`

  beforeAll(() => (
    new Promise((resolve, reject) => {
      testServer.on('listening', resolve)
      testServer.on('error', reject)
      testServer.listen(TEST_PORT)
    })
  ))

  beforeEach(() => {
    requestHandler = () => {
      throw new Error('Test request handler is not defined')
    }
  })

  afterAll(() => (
    new Promise<void>((resolve, reject) => {
      testServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  ))

  it('makes distance requests', async () => {
    requestHandler = (req, res) => {
      expect(req.query.activity).toEqual('10')
      expect(req.query.activityType).toEqual('miles')
      expect(req.query.mode).toEqual('taxi')
      expect(req.query.country).toEqual('usa')
      expect(req.query.fuelType).toBeFalsy()

      res.json({ carbonFootprint: '1.23' })
    }

    expect(await carbonFootprint({
      baseUrl,
      country: 'USA',
      distance: {
        amount: 10,
        unit: 'miles',
        mode: 'taxi'
      }
    })).toEqual(1.23)
  })

  it('makes fuel requests', async () => {
    requestHandler = (req, res) => {
      expect(req.query.activity).toEqual('456')
      expect(req.query.activityType).toEqual('fuel')
      expect(req.query.fuelType).toEqual('jetFuel')
      expect(req.query.country).toEqual('gbr')
      expect(req.query.mode).toBeFalsy()

      res.json({ carbonFootprint: '1.23' })
    }

    expect(await carbonFootprint({
      baseUrl,
      country: 'GBR',
      fuel: {
        amount: 456,
        unit: 'gallons',
        type: 'jetFuel'
      }
    })).toEqual(1.23)
  })

  it('allows a token', async () => {
    requestHandler = (req, res) => {
      expect(req.query.appTkn).toEqual('bingbong')

      res.json({ carbonFootprint: '1.23' })
    }

    expect(await carbonFootprint({
      token: 'bingbong',
      baseUrl,
      country: 'GBR',
      fuel: {
        amount: 456,
        unit: 'gallons',
        type: 'jetFuel'
      }
    })).toEqual(1.23)
  })

  it('handles errors from the API', async () => {
    requestHandler = (_req, res) => {
      res.json({ errorMessage: 'bing bong' })
    }

    let err: unknown
    try {
      await carbonFootprint({
        baseUrl,
        country: 'USA',
        distance: {
          amount: 10,
          unit: 'miles',
          mode: 'taxi'
        }
      })
    } catch (e) {
      err = e
    }

    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toContain('bing bong')
  })
})
