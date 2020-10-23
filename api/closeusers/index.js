import express from 'express'
import db from '../../database'

const router = express.Router()

// Request CloseUser
router.post('/request', function (req, res) {

  // Get Parameters
  const relatedUserId = req.body.relatedUserId

  ;(async () => {
    let errorMessage = ''
    try {
      // Check Session
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        if (!relatedUserId) {
          errorMessage = '주변인 Id가 입력되지 않았습니다.'
          throw new Error('relatedUserId value not exists')
        }

        // Data Redundancy Check
        const closeuserCheck = await db.UserClose.findOne({
          where: {
            UserId: session.User.Id,
            RelatedUserId: relatedUserId,
          },
        })

        if(closeuserCheck) {
          errorMessage = '주변인 관계가 이미 있습니다.'
          throw new Error("Data Redundancy Error: UserClose already exists.")
        }

        // Check another side request
        const closeuserCheck2 = await db.UserClose.findOne({
          where: {
            UserId: relatedUserId,
            RelatedUserId: session.User.Id,
            active: 0
          },
        })
        
        
        if(!closeuserCheck2){
          // Create UserClose object
          const closeuser = await db.UserClose.create({
            active: 0,
            UserId: session.User.Id,
            RelatedUserId: relatedUserId,
          })

          res.status(201).json({
            message: '주변인 요청에 성공하였습니다.',
          })
        } else {
          // If another side request exists, accept requests.
          closeuserCheck2.active = 1
          closeuserCheck2.save()

          // Create UserClose object
          const closeuser = await db.UserClose.create({
            active: 1,
            UserId: session.User.Id,
            RelatedUserId: relatedUserId,
          })

          res.status(201).json({
            message: '주변인 등록하였습니다.',
          })
        }
        
      } else {
        errorMessage = '로그인에 실패했습니다.'
        throw new Error('session invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

// Response CloseUser Request
router.delete('/request', function (req, res) {

  // Get Parameters
  const relatedUserId = req.body.relatedUserId
  const permit = req.body.permit

  ;(async () => {
    let errorMessage = ''
    try {
      // Check Session
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        if (!relatedUserId) {
          errorMessage = '주변인 Id가 입력되지 않았습니다.'
          throw new Error('relatedUserId value not exists')
        }

        if (!permit) {
          errorMessage = '허가 값이 없습니다.'
          throw new Error('permit value not exists.')
        }

        // Get closeuser
        const closeuser = await db.UserClose.findOne({
          where: {
            UserId: relatedUserId,
            RelatedUserId: session.User.Id,
            active: 0
          },
        })

        if(!closeuser) {
          errorMessage = '주변인 관계 요청이 없습니다.'
          throw new Error("Data Redundancy Error: UserClose request not exists.");
        }

        if (permit == 0) {
          await closeuser.destroy()
        } else {
          closeuser.active = 1
          closeuser.save()
          // Create UserClose object
          const closeuser2 = await db.UserClose.create({
            active: 1,
            UserId: session.User.Id,
            RelatedUserId: relatedUserId,
          })
        }

        res.status(201).json({
          message: permit == 1? '주변인 등록 요청을 허가하였습니다.' : '주변인 등록 요청 취소하였습니다.',
        })
        
      } else {
        errorMessage = '로그인에 실패했습니다.'
        throw new Error('session invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

// Delete CloseUser
router.delete('/', function (req, res) {
  
  // Get Parameters
  const relatedUserId = req.body.relatedUserId

  ;(async () => {
    let errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        if (!relatedUserId) {
          errorMessage = '주변인 Id가 입력되지 않았습니다.'
          throw new Error('relatedUserId value not exists')
        }

        // Data Redundancy Check
        const closeuser = await db.UserClose.findOne({
          where: {
            UserId: session.User.Id,
            RelatedUserId: relatedUserId,
            active: 1,
          },
        })
        
        if(!closeuser) {
          errorMessage = '주변인 관계가 아닙니다.'
          throw new Error("Data Redundancy Error: UserClose already exists.");
        }

        await closeuser.destroy()

        const closeuser2 = await db.UserClose.findOne({
          where: {
            UserId: relatedUserId,
            RelatedUserId: session.User.Id,
            active: 1,
          },
        })

        if(closeuser2) {
          await closeuser2.destroy()
        }


        res.status(201).json({
          message: '주변인 관계를 취소하였습니다.',
        })
      } else {
        errorMessage = '로그인이 되지않았습니다.'
        throw new Error('session invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

// Get CloseUser
router.get('/', function (req, res) {

  ;(async () => {
    let errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }
        const closeuserInfo = await db.User.findOne({
          where: {
            Id: session.User.Id,
          },
          attributes: ['Id', 'userEmail', 'userPhoneNumber'],
          include: [
            {
              model: db.User,
              on: {
                active: 1,
              },
              as: 'RelatedUser',
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            },
          ],
        })
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(closeuserInfo)
      } else {
        errorMessage = '로그인이 되지않았습니다.'
        throw new Error('session invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

// Get CloseUser Request
router.get('/request', function (req, res) {
  
  // Get Parameters
  const flag = req.query.flag // 'receive'|'send' = 내가 요청 받은 것 | 내가 요청 보낸 것

  ;(async () => {
    let errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }
        let closeuserInfo
        if(flag == 'send') {
          // 내가 요청 보낸 것
          closeuserInfo = await db.User.findOne({
            where: {
              Id: session.User.Id,
            },
            attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            include: [
              {
                model: db.User,
                as: 'SelfUser',
                through: {
                  where: {
                    active: 0,
                  },
                  attributes: ['UserId', 'RelatedUserId', 'active']
                },
                attributes: ['Id', 'userEmail', 'userPhoneNumber'],
              },
            ],
          })
        } else {
          // 내가 요청 받은 것
          closeuserInfo = await db.User.findOne({
            where: {
              Id: session.User.Id,
            },
            attributes: ['Id', 'userEmail', 'userPhoneNumber'],
            include: [
              {
                model: db.User,
                as: 'RelatedUser',
                through: {
                  where: {
                    active: 0,
                  },
                  attributes: ['UserId', 'RelatedUserId', 'active']
                },
                attributes: ['Id', 'userEmail', 'userPhoneNumber'],
              },
            ],
          })
        }
        

        res.status(200).json(closeuserInfo)
      } else {
        errorMessage = '로그인이 되지않았습니다.'
        throw new Error('session invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})


export default router