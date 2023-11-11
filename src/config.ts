import { config } from 'dotenv-flow'

config()

interface Config {
  LOG_LEVEL: string | undefined
  SENTRY_DSN: string | undefined
}

const getConfig = (): Config => {
  return {
    LOG_LEVEL: process.env.LOG_LEVEL,
    SENTRY_DSN: process.env.SENTRY_DSN
  }
}

const parsedConfig = getConfig()
export default parsedConfig
