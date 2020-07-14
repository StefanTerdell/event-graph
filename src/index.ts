require('dotenv').config()
import { getEsConnection } from './utils/getEsConnection'
import { ResolvedGraph } from 'resolved-graph'
import * as Koa from 'koa'
import * as bodyParser from 'koa-bodyparser'
import * as koaCors from 'koa-cors'
import { getNodeRouter } from './routers/node'
import { getLinkRouter } from './routers/link'
import { getGraphRouter } from './routers/graph'
import { getQueryRouter } from './routers/query'
import { Document, loadDocumentSync } from 'swagger2'
import { ui, validate } from 'swagger2-koa'

const swaggerDocument = loadDocumentSync('./api.yaml') as Document

const graph = new ResolvedGraph()

const esConnection = getEsConnection({
  graph: (_, event) => graph.mergeGraph(JSON.parse(event.event.data.toString())),
})

const app = new Koa()

app.use(koaCors()).use(bodyParser()).use(ui(swaggerDocument, '/swagger')).use(validate(swaggerDocument))

for (const routerFactory of [getNodeRouter, getLinkRouter, getGraphRouter, getQueryRouter]) {
  const router = routerFactory(graph, esConnection)
  app.use(router.routes()).use(router.allowedMethods())
}

const port = process.env.SERVICE_PORT || 3000
const host = process.env.SERVICE_HOST || 'http://localhost'
app.listen(port)
console.log(`Graph API listening on ${host}:${port}`)
