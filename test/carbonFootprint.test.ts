import {carbonFootprint} from '../trip-to-carbon'
import getPort from 'get-port'
import http, { ServerResponse, RequestListener, Server } from 'http';

describe('carbonFootprint',()=>{
  const fakeServers: Server[] = []

  function createFakeServer(requestListener: RequestListener): Promise<Server> {
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

  function getBaseUrl(server: Server): string {
    const address = server.address()
    if (!address || (typeof address !== 'object')) {
      throw new Error('Expected the server to have an object address')
    }
    return `http://localhost:${address.port}`
  }

  function json(res: ServerResponse, toWrite: unknown): void {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(toWrite))
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

  it('fetches a carbon footprint', async () => {
    const server = await createFakeServer((_req, res) => {
      json(res, {carbonFootprint: '1.23'})
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
})