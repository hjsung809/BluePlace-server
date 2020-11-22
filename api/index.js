import express from 'express'
import cookieParser from 'cookie-parser'
import meta from './meta'
import region from './regions'
import cliques from './cliques'
import closeusers from './closeusers'
import users from './users'
import infectedplace from './infectedplace'


const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))
app.use(cookieParser())

app.use('/meta', meta)
app.use('/users', users)
app.use('/regions', region)
app.use('/cliques', cliques)
app.use('/closeusers', closeusers)
app.use('/infectedplaces', infectedplace)


export default app
