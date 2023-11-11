import WAWebJS, {Client, LocalAuth} from 'whatsapp-web.js'
import winston, {format} from 'winston'
import Sentry from 'winston-sentry-log'
import config from './config'

const options = {
  config: {
    dsn: config.SENTRY_DSN
  },
  level: 'warn'
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL ?? 'info',
  format: format.combine(
    format.timestamp(),
    format.ms(),
    format.splat(),
    format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new Sentry(options)
  ]
})

const clientMap: Map<string, WAWebJS.Client> = new Map()

const getWAClient = (sessionId: string): WAWebJS.Client => {
  const client = clientMap.get(sessionId)
  if (client !== undefined) {
    logger.info(`User ${sessionId} reconnected`)
    return client
  } else {
    logger.info(`New user ${sessionId} connected`)
    const newClient = new Client({
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--no-first-run',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
          '--disable-infobars',
          '--disable-notifications',
          '--mute-audio'
        ]
      },
      authStrategy: new LocalAuth({ clientId: sessionId })
    })
    clientMap.set(sessionId, newClient)
    return newClient
  }
}

try {
  logger.info('Server started.')
} catch (e) {
  logger.error(e)
}
