import * as Router from 'koa-router'
import { Context } from 'koa'
import { ResolvedGraph } from 'resolved-graph'
import { EventStoreNodeConnection } from 'node-eventstore-client'
import { matchQuery } from 'resolved-graph-query'

export const getQueryRouter = (graph: ResolvedGraph, connection: EventStoreNodeConnection): Router => {
  const router = new Router()

  router.post('/query', async (ctx: Context) => {
    return matchQuery(ctx.request.body, graph)
  })

  return router
}
