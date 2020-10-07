import express from 'express'
import meta from './meta'
import users from './users'

const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: false }))

app.use('/meta', meta)
app.use('/users', users)

export default app
