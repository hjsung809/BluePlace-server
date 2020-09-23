import express from 'express'

const router = express.Router()

router.get('/', function (req, res) {
  res.json({ metaData: 'this is meta data.' })
})
