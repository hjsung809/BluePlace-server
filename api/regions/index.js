import express from 'express'
import db from '../../database'

const router = express.Router()

// return all regions
router.get('/', function (req, res) {
  // const userEmail = req.body.userEmail
  // const userPassword = req.body.userPassword
  // const userPhoneNumber = req.body.userPhoneNumber
  ;(async () => {
    const errorMessage = ''
    try {
      const regions = await db.Region.findAll()
      res.status(200).json(regions)
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

router.get('/:regionid/infected-place', function (req, res) {
  const RegionId = req.params.regionid
  // const userEmail = req.body.userEmail
  // const userPassword = req.body.userPassword
  // const userPhoneNumber = req.body.userPhoneNumber
  //   ;(async () => {
  //     const errorMessage = ''
  //     try {
  //       //   return
  //     } catch (e) {
  //       console.log(e)
  //     }
  //     res.status(400).json({
  //       errorMessage,
  //     })
  //   })()
  res.end(RegionId)
})

export default router
