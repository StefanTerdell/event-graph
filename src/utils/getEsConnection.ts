import * as esClient from 'node-eventstore-client'

const getEsConnection = (subscriptions: {
  [streamName: string]: {
    (subscription: esClient.EventStoreCatchUpSubscription, event: esClient.ResolvedEvent): void | Promise<void>
  }
}) => {
  const subscriptionClosed = (subscription, errorType, error) =>
    console[error ? 'error' : 'log'](`Closing subscription to stream ${subscription._streamId}. Error type: ${errorType}`, error)
  const subscriptionCaughtUp = (subscription) => console.log('Caught up to stream', subscription._streamId)

  const esCredentials = new esClient.UserCredentials(process.env.EVENTSTORE_USERNAME, process.env.EVENTSTORE_PASSWORD)
  const esConnection = esClient.createConnection({}, `${process.env.EVENTSTORE_HOST}:${process.env.EVENTSTORE_PORT}`)

  esConnection.connect().catch((err) => console.log(err))
  esConnection.once('connected', (tcpEndPoint) => {
    console.log(`Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`)
    for (const [streamName, callback] of Object.entries(subscriptions)) {
      esConnection.subscribeToStreamFrom(streamName, -1, true, callback, subscriptionCaughtUp, subscriptionClosed, esCredentials)
    }
  })

  esConnection.on('error', (error) => console.error(`Error occurred on connection: ${error}`))
  esConnection.on('closed', (reason) => console.log(`Connection closed, reason: ${reason}`))
  return esConnection
}

export { getEsConnection }
