import * as Router from 'koa-router'
import { Context } from 'koa'
import { ResolvedGraph } from 'resolved-graph'
import { EventStoreNodeConnection, createJsonEventData, expectedVersion } from 'node-eventstore-client'
import { v4 } from 'uuid'

export const getNodeRouter = (graph: ResolvedGraph, connection: EventStoreNodeConnection): Router => {
  const router = new Router()

  router.get('/node', async (ctx: Context) => {
    ctx.body = graph.findNodes(ctx.request.body)
  })

  router.get('/node/:id', async (ctx: Context) => {
    ctx.body = graph.node(ctx.params.id)
  })

  router.put('/node', async (ctx: Context) => {
    graph.mergeNode(ctx.request.body)
    connection.appendToStream(
      process.env.GRAPH_STREAM_NAME,
      ctx.query.expectedVersion || expectedVersion.any,
      createJsonEventData(v4(), { nodes: [ctx.body] }, 'mergeNode'),
    )
  })

  return router
}
