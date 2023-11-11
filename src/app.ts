import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js'
import winston, { format } from 'winston'
import Sentry from 'winston-sentry-log'
import config from './config'
import qrcode from 'qrcode-terminal'

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
  const client = getWAClient('bot_session')
  client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    qrcode.generate(qr, {small: true});
  })

  client.on('ready', () => {
    console.log('Client is ready!')
  })

  client.on('message', msg => {
    if (msg.body == '!ping') {
      msg.forward('chatId')
    }
  })

  client.initialize()
} catch (e) {
  logger.error(e)
}
