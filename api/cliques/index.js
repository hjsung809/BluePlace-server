import express from 'express'
import db from '../../database'

const router = express.Router()

router.post('/', function (req, res) {
  const cliqueName = req.body.cliqueName
  const cliqueNameEn = req.body.cliqueNameEn

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

        if (!cliqueName) {
          errorMessage = '그룹 이름이 입력되지 않았습니다.'
          throw new Error('cliqueName invalid')
        }

        const clique = await db.Clique.create({
          cliqueName,
          cliqueNameEn,
        })
        clique.setCliqueOwner(session.User)

        // 본인이 만든 그룹에 본인이 속해있음.
        await db.UserClique.create({
          active: 1,
          UserId: session.User.Id,
          CliqueId: clique.Id,
        })

        res.status(201).json({
          message: '그룹 생성에 성공하였습니다.',
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

// 자기가 만든 그룹 리스트업.
router.get('/management', function (req, res) {
  ;(async () => {
    let errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const cliqueInfo = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          attributes: ['createdAt', 'updatedAt', 'UserId'],
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
              include: [
                {
                  model: db.Clique,
                  as: 'CliqueOwner',
                  include: [
                    {
                      model: db.User,
                      attributes: ['Id', 'userEmail', 'userPhoneNumber'],
                    },
                  ],
                },
              ],
            },
          ],
        })

        if (!cliqueInfo) {
          errorMessage = '세션이 유효하지 않습니다.'
          throw new Error('session invalid')
        }

        res.status(200).json(cliqueInfo)
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

// // 자기가 만든 그룹 삭제.
// router.delete('/management', function (req, res) {
//   ;(async () => {
//     let errorMessage = ''
//     try {
//       if (req.cookies.BPSID) {
//         const session = await db.Session.findOne({
//           where: {
//             Id: req.cookies.BPSID,
//           },
//           include: [
//             {
//               model: db.User,
//               attributes: ['Id', 'userEmail', 'userPhoneNumber'],
//             },
//           ],
//         })

//         if (!session) {
//           errorMessage = '유효하지 않은 세션입니다.'
//           throw new Error('session invalid')
//         }

//         const cliques = await db.Clique.findAll({
//           where: {

//           }
//         })

//         res.status(201).json({
//           message: '그룹 가입 요청이 성공하였습니다.',
//         })
//       } else {
//         errorMessage = '로그인이 되지않았습니다.'
//         throw new Error('session invalid')
//       }
//     } catch (e) {
//       console.log(e)
//       res.status(400).json({
//         errorMessage,
//       })
//     }
//   })()
// })

router.post('/management/banish', function (req, res) {
  const CliqueId = req.body.CliqueId

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

        const puc = await db.UserClique.findOne({
          where: {
            UserId: session.User.Id,
            CliqueId,
          },
        })

        if (puc) {
          if (puc.active) {
            errorMessage = '이미 가입된 그룹입니다.'
            throw new Error('already joined group.')
          } else {
            errorMessage = '이미 가입 요청을 보낸 그룹입니다.'
            throw new Error('already join request sended.')
          }
        }

        // 관계를 만들고, 허가를 기다림.
        await db.UserClique.create({
          active: 0,
          UserId: session.User.Id,
          CliqueId,
        })

        res.status(201).json({
          message: '그룹 가입 요청이 성공하였습니다.',
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

router.post('/management/approve', function (req, res) {
  const CliqueId = req.body.CliqueId

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

        const puc = await db.UserClique.findOne({
          where: {
            UserId: session.User.Id,
            CliqueId,
          },
        })

        if (puc) {
          if (puc.active) {
            errorMessage = '이미 가입된 그룹입니다.'
            throw new Error('already joined group.')
          } else {
            errorMessage = '이미 가입 요청을 보낸 그룹입니다.'
            throw new Error('already join request sended.')
          }
        }

        // 관계를 만들고, 허가를 기다림.
        await db.UserClique.create({
          active: 0,
          UserId: session.User.Id,
          CliqueId,
        })

        res.status(201).json({
          message: '그룹 가입 요청이 성공하였습니다.',
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

// 그룹 가입 요청.
router.post('/join', function (req, res) {
  const CliqueId = req.body.CliqueId

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

        const puc = await db.UserClique.findOne({
          where: {
            UserId: session.User.Id,
            CliqueId,
          },
        })

        if (puc) {
          if (puc.active) {
            errorMessage = '이미 가입된 그룹입니다.'
            throw new Error('already joined group.')
          } else {
            errorMessage = '이미 가입 요청을 보낸 그룹입니다.'
            throw new Error('already join request sended.')
          }
        }

        // 관계를 만들고, 허가를 기다림.
        await db.UserClique.create({
          active: 0,
          UserId: session.User.Id,
          CliqueId,
        })

        res.status(201).json({
          message: '그룹 가입 요청이 성공하였습니다.',
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

// 가입한 그룹 탈퇴.
router.post('/withdraw', function (req, res) {
  const CliqueId = req.body.CliqueId

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

        const puc = await db.UserClique.findOne({
          where: {
            UserId: session.User.Id,
            CliqueId,
          },
        })

        if (puc) {
          if (puc.active) {
            errorMessage = '이미 가입된 그룹입니다.'
            throw new Error('already joined group.')
          } else {
            errorMessage = '이미 가입 요청을 보낸 그룹입니다.'
            throw new Error('already join request sended.')
          }
        }

        // 관계를 만들고, 허가를 기다림.
        await db.UserClique.create({
          active: 0,
          UserId: session.User.Id,
          CliqueId,
        })

        res.status(201).json({
          message: '그룹 가입 요청이 성공하였습니다.',
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

export default router
