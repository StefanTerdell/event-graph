import * as Router from 'koa-router'
import { Context } from 'koa'
import { ResolvedGraph } from 'resolved-graph'
import { EventStoreNodeConnection, createJsonEventData, expectedVersion } from 'node-eventstore-client'
import { decycle } from '../utils/cycle'
import { v4 } from 'uuid'

export const getGraphRouter = (graph: ResolvedGraph, connection: EventStoreNodeConnection): Router => {
  const router = new Router()

  router.get('/graph', async (ctx: Context) => {
    ctx.body = graph.dissolve()
  })

  router.get('/graph/decycle', async (ctx: Context) => {
    ctx.body = decycle(graph)
  })

  router.put('/graph', async (ctx: Context) => {
    graph.mergeGraph(ctx.body)
    connection.appendToStream(
      process.env.GRAPH_STREAM_NAME,
      ctx.query.expectedVersion || expectedVersion.any,
      createJsonEventData(v4(), ctx.body, 'mergeGraph'),
    )
  })

  return router
}
