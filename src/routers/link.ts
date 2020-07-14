import * as Router from 'koa-router'
import { Context } from 'koa'
import { ResolvedGraph } from 'resolved-graph'
import { EventStoreNodeConnection, createJsonEventData, expectedVersion } from 'node-eventstore-client'
import { v4 } from 'uuid'

export const getLinkRouter = (graph: ResolvedGraph, connection: EventStoreNodeConnection): Router => {
  const router = new Router()

  router.get('/link', async (ctx: Context) => {
    ctx.body = graph.findLinks(ctx.request.body)
  })

  router.get('/link/:id', async (ctx: Context) => {
    ctx.body = graph.link(ctx.params.id)
  })

  router.put('/link', async (ctx: Context) => {
    graph.mergeLink(ctx.request.body)
    connection.appendToStream(
      process.env.GRAPH_STREAM_NAME,
      ctx.query.expectedVersion || expectedVersion.any,
      createJsonEventData(v4(), { links: [ctx.body] }, 'mergeLink'),
    )
  })

  return router
}
