import express from 'express'
import cookieParser from 'cookie-parser'
import meta from './meta'
import region from './regions'
import cliques from './cliques'
import users from './users'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())

app.use('/meta', meta)
app.use('/users', users)
app.use('/region', region)
app.use('/cliques', cliques)

export default app
