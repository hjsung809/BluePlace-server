import express from 'express'
import db from '../../database'

const router = express.Router()

// 사용자 그룹 생성
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
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

// // 자기가 만든 그룹 삭제.
router.delete('/', function (req, res) {
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        // 해당 유저가 가진 CliqueOwner
        const clique = await db.Clique.findOne({
          where: {
            Id: CliqueId,
            CliqueOwnerId: session.User.Id,
          },
        })

        if (!clique) {
          errorMessage = '해당 그룹을 삭제할 수 없습니다.'
          throw new Error('only owner can remove clique.')
        }
        // console.log(clique)
        await clique.destroy()
        // await db.Clique.delete({
        //   where: {
        //     Id: clique.Id,
        //   },
        // })

        res.status(201).json({
          message: '해당 그룹을 삭제하였습니다.',
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
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
          } 
          // tmp active 1로
          // else {
          //   errorMessage = '이미 가입 요청을 보낸 그룹입니다.'
          //   throw new Error('already join request sended.')
          // }
        }

        // 관계를 만들고, 허가를 기다림.
        // tmp active 1로
        await db.UserClique.create({
          active: 1,
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

// 가입했거나 가입 신청한 그룹 탈퇴.
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }
        const clique = await db.Clique.findOne({
          where: {
            Id: CliqueId,
            CliqueOwnerId: session.User.Id,
          },
        })
        if(clique) {

          // 해당 유저가 가진 Clique
          

          if (!clique) {
            errorMessage = '해당 그룹을 삭제할 수 없습니다.'
            throw new Error('only owner can remove clique.')
          }

          await clique.destroy()

          res.status(201).json({
            message: '그룹 삭제에 성공하였습니다.',
          })
        }else{
          const userClique = await db.UserClique.findOne({
            where: {
              UserId: session.User.Id,
              CliqueId,
            }
          })
  
          if (!userClique) {
            errorMessage = '이미 관계없는 그룹입니다.'
            throw new Error('already withdrawn group.')
          }
  
          await userClique.destroy()
  
          res.status(201).json({
            message: '그룹 탈퇴에 성공하였습니다.',
          })
        }

        
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

// 자기가 가입한 그룹 리스트업.
router.get('/', function (req, res) {
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
              // 세션으로 부터 유저 찾기.
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
              include: [
                {
                  // 해당 유저가 멤버인 그룹 찾기.
                  model: db.Clique,
                  as: 'CliqueMember',
                  include: [
                    {
                      // 해당 그룹 생성 유저 찾기.
                      model: db.User,
                      as: 'CliqueOwner',
                      attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
                    },
                    {
                      // 해당 그룹에 관계된 유저 찾기.
                      model: db.User,
                      as: 'CliqueMember',
                      attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
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
              // 세션으로 부터 유저 찾기.
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
              include: [
                {
                  // 해당 유저가 Owner인 그룹 찾기.
                  model: db.Clique,
                  as: 'CliqueOwner',
                  include: [
                    {
                      // 해당 그룹에 관계된 유저 찾기.
                      model: db.User,
                      attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
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

// 검색.
router.get('/search', function (req, res) {

  // Get Parameters
  const cliqueName = req.query.cliqueName
  ;(async () => {
    let errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          attributes: ['createdAt', 'updatedAt', 'UserId'],
          include: [
            {
              // 세션으로 부터 유저 찾기.
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            },
          ]
        })

        if (!session) {
          errorMessage = '세션이 유효하지 않습니다.'
          throw new Error('session invalid')
        }
        
        const cliques = await db.Clique.findAll({
          where: {
            cliqueName: {
              [db.Sequelize.Op.like]: '%' + cliqueName + '%'
            }
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
              as: 'CliqueOwner',
            },
            {
              model: db.User,
              as: 'CliqueMember',
              through: {
                where: {
                  UserId: session.User.Id,
                },
                attributes: ['UserId', 'CliqueId', 'active']
              },
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            }
          ]
        })
        console.log(cliques)
        res.status(200).json(cliques)
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

router.post('/management/banish', function (req, res) {
  const CliqueId = req.body.CliqueId
  const UserId = req.body.UserId // 추방시킬 유저의 아이디.

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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        if (session.User.Id === UserId) {
          errorMessage = '소유자는 그룹을 탈퇴할 수 없습니다.'
          throw new Error('owner cant leave clique.')
        }

        const clique = await db.Clique.findOne({
          where: {
            Id: CliqueId,
            CliqueOwnerId: session.User.Id,
          },
        })

        if (!clique) {
          errorMessage = '관리할 수 없는 그룹입니다.'
          throw new Error('clique invalid')
        }

        const userClique = await db.UserClique.findOne({
          where: {
            CliqueId: clique.Id,
            UserId,
          },
        })

        if (!userClique) {
          errorMessage = '해당 유저는 그룹에 포함되어 있지 않습니다.'
          throw new Error('already banished user.')
        }
        await userClique.destroy()

        res.status(201).json({
          message: '유저를 그룹에서 추방시켰습니다.',
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
  const UserId = req.body.UserId // 가입 시킬 유저의 아이디.

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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
            },
          ],
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }
        // 요청 보낸 사람 소유의 해당 clique 찾기.
        const clique = await db.Clique.findOne({
          where: {
            Id: CliqueId,
            CliqueOwnerId: session.User.Id,
          },
        })

        if (!clique) {
          errorMessage = '관리할 수 없는 그룹입니다.'
          throw new Error('clique invalid')
        }
        // console.log(clique)

        const userClique = await db.UserClique.findOne({
          where: {
            CliqueId: clique.Id,
            UserId,
          },
        })

        if (!userClique) {
          errorMessage = '해당 유저는 그룹과 관계 없습니다.'
          throw new Error('user did not send join request')
        }

        if (userClique.active) {
          errorMessage = '해당 유저는 이미 그룹에 포함되어 있습니다.'
          throw new Error('already banished user.')
        }

        userClique.active = 1
        await userClique.save()

        res.status(201).json({
          message: '유저를 그룹에서 가입 시켰습니다.',
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
