import 'dotenv/config'

import express from 'express'
import path from 'path'
import Youch from 'youch'

import * as Sentry from '@sentry/node'
import sentryConfig from './config/sentry'

import 'express-async-errors'

import routes from './routes'
import './database'

class App {
  constructor () {
    this.server = express()

    Sentry.init(sentryConfig)

    this.middlewares()
    this.routes()
    this.exceptionsHandler()
  }

  middlewares () {
    this.server.use(Sentry.Handlers.requestHandler())
    this.server.use(express.json())
    this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
  }

  routes () {
    this.server.use(routes)
    this.server.use(Sentry.Handlers.errorHandler())
  }

  exceptionsHandler () {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV !== 'development') return res.status(500).json({ error: 'Internal server error ' })

      const errors = await new Youch(err, req).toJSON()
      return res.status(500).json(errors)
    })
  }
}

export default new App().server
