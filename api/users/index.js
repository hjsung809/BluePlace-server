import crypto from 'crypto'
import express from 'express'
import uuid4 from 'uuid4'
// import { Op } from 'sequelize'
import db from '../../database'

const router = express.Router()

const makeRandomBytes = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) {
        reject(new Error(err))
      }
      resolve(buf)
    })
  })

const convertPassword = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 128529, 64, 'sha512', (err, key) => {
      if (err) {
        reject(err)
      }
      // password = key.toString('base64')
      resolve(key)
    })
  })

// try {
// } catch (e) {
//   console.log(e)
//   res.status(400).json({
//     errorMessage: '아이디 생성에 실패했습니다.',
//   })
// }

router.get('/', function (req, res) {
  
  // Get Parameters
  const phoneNumber = req.query.phonenumber
  const email = req.query.email
  const name = req.query.name
  const id = req.query.id


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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname']
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        if(!phoneNumber && !email && !name && !id){
          errorMessage = 'Email이나 PhoneNumber가 없습니다.'
          throw new Error('session invalid')
        }

        let searchedUser
        if(phoneNumber){
          searchedUser = await db.User.findAll({
            where: {
              userPhoneNumber: phoneNumber,
            },
            attributes: [
              'Id', 'userEmail', 'userPhoneNumber', 'userNickname', 'createdAt'
            ]
          })
        }else if(email) {
          searchedUser = await db.User.findAll({
            where: {
              userEmail: email,
            },
            attributes: [
              'Id', 'userEmail', 'userPhoneNumber', 'userNickname', 'createdAt'
            ]
          })
        }else if(name) {
          searchedUser = await db.User.findAll({
            where: {
              userName: name,
            },
            attributes: [
              'Id', 'userEmail', 'userPhoneNumber', 'userNickname', 'createdAt'
            ]
          })
        }else if(id) {
          searchedUser = await db.User.findAll({
            where: {
              Id: id,
            },
            attributes: [
              'Id', 'userEmail', 'userPhoneNumber', 'userNickname', 'createdAt'
            ]
          })
        }

        if(!searchedUser) {
          errorMessage = '유저 검색 결과가 없습니다.'
          throw new Error('Query result is empty')
        }

        res.status(200).json(
          searchedUser
        )

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

router.get('/relatedusers', function (req, res) {
  
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname']
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        let searchedUser = await db.User.findOne({
          where: {
            Id: session.User.Id,
          },
          attributes: ['Id'],
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
              on: {
                active: 1,
              },
              as: 'RelatedUser',
            },
            {
              model: db.Clique,
              as: 'CliqueMember',
              attributes: ['Id', 'cliqueName', 'cliqueNameEn', 'cliqueTypeId'],
              include: [
                {
                  model: db.CliqueType,
                },
                {
                  model: db.User,
                  attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
                  on: {
                    Id: {ne: session.User.Id},
                  },
                  as: 'CliqueMember',
                }
              ]
            },
            {
              model: db.Region,
              include: [
                {
                  model: db.User,
                  attributes: ['Id', 'userEmail', 'userPhoneNumber', 'userNickname'],
                  on: {
                    Id: {ne: session.User.Id},
                  }
                },
              ],
            }
          ]
        })
        

        if(!searchedUser) {
          errorMessage = '유저 검색 결과가 없습니다.'
          throw new Error('Query result is empty')
        }

        res.status(200).json(
          searchedUser
        )

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

router.post('/session', function (req, res) {
  ;(async () => {
    const errorMessage = ''
    try {
      if (req.cookies.BPSID) {
        const session = await db.Session.findOne({
          where: {
            Id: req.cookies.BPSID,
          },
          include: [
            {
              model: db.User,
              attributes: ['Id', 'userEmail', 'userPhoneNumber']
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        res.status(200).json(
          '유효한 세션입니다.'
        )

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

// 회원 가입
router.post('/', function (req, res) {
  const userEmail = req.body.userEmail
  const userPassword = req.body.userPassword
  const userPhoneNumber = req.body.userPhoneNumber
  const userNickname = req.body.userNickname

  ;(async () => {
    let errorMessage = ''

    try {
      // console.log('userEmail', userEmail)
      if (!userEmail || !userPassword) {
        errorMessage = '비밀번호 혹은 ID가 비었습니다.'
        throw new Error('id or pw is empty')
      }

      const sameIdUser = await db.User.findOne({
        where: {
          userEmail,
        },
      })
      // console.log('sameIdUser', sameIdUser)
      if (sameIdUser) {
        errorMessage = '이미 존재하는 사용자 이름입니다.'
        throw new Error('id aleady exist.')
      }

      // 비밀번호 암호화.
      const salt = await makeRandomBytes()
      // console.log('salt', salt, salt.length)
      const password = await convertPassword(userPassword, salt)
      // console.log('암호화 비밀번호', password, password.length)

      await db.User.create({
        userNickname,
        userEmail,
        userPassword: password.toString('base64'),
        salt: salt.toString('base64'),
        userPhoneNumber
      })
      res.status(201).end()
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

router.post('/auth', function (req, res) {
  res.json({ metaData: 'this is user data.' })
})

router.post('/login', function (req, res) {
  const userEmail = req.body.userEmail
  const userPassword = req.body.userPassword

  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  // console.log('Signed Cookies: ', req.signedCookies)
  ;(async () => {
    let errorMessage = ''
    try {
      if (!userEmail || !userPassword) {
        errorMessage = '비밀번호 혹은 ID가 입력되지 않습니다.'
        throw new Error('id or pw is empty.')
      }

      const user = await db.User.findOne({
        where: {
          userEmail,
        },
      })

      if (user === null) {
        errorMessage = 'ID가 유효하지 않습니다.'
        throw new Error('user not found.')
      }

      const password = await convertPassword(
        userPassword,
        Buffer.from(user.salt, 'base64')
      )
      // console.log('password', password)

      if (user.userPassword === password.toString('base64')) {
        // 기존 세션 삭제.
        if (req.cookies.BPSID) {
          const previousSession = await db.Session.findOne({
            where: {
              Id: req.cookies.BPSID,
            },
          })
          if(previousSession){
            const sessions = await db.Session.findAll({
              where: {
                UserId: previousSession.UserId,
              },
            })
  
            if (sessions) {
              for(let i = 0; i < sessions.length; i ++){
                await sessions[i].destroy()
              }
            }
          }
        }

        // 세션 발급.
        const sessionId = uuid4()
        const session = await db.Session.create({
          Id: sessionId,
        })
        session.setUser(user)

        // 쿠키 지정.
        res.cookie('BPSID', sessionId)
        res.status(200).json({
          Id: user.Id, 
          email: user.userEmail, 
          phoneNumber: user.userPhoneNumber,
          userNickname: user.userNickname
        })
      } else {
        errorMessage = '비밀번호가 일치하지 않습니다.'
        throw new Error('password invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

// 사용자 감염시
router.post('/infect', function (req, res) {
  // const userEmail = req.body.userEmail
  // const userPassword = req.body.userPassword

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
        // console.log(session)
        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        const pIUser = await db.InfectedUser.findOne({
          where: {
            UserID: session.User.Id,
          },
        })

        if (pIUser) {
          errorMessage = '이미 감염 등록된 사용자 입니다.'
          throw new Error('aleady infected user.')
        }
        // 추후에 추가 정보 정의.
        const iUser = await db.InfectedUser.create()
        // console.log(iUser)
        iUser.setUser(session.User)
        res.status(201).json({
          message: '감염 등록에 성공하였습니다.',
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

router.put('/', function (req, res) {
  res.json({ metaData: 'this is user data.' })
})

router.delete('/', function (req, res) {
  const userEmail = req.body.userEmail
  const userPassword = req.body.userPassword

  ;(async () => {
    let errorMessage = ''
    try {
      // 세션이 없을 때.
      if (!req.cookies.BPSID) {
        errorMessage = '삭제 전에 로그인 부터 해야합니다.'
        throw new Error('before delete user, login first.')
      }
      // 세션 찾기
      const session = await db.Session.findOne({
        where: {
          Id: req.cookies.BPSID,
        },
      })
      // 해당 세션이 없을 때.
      if (!session) {
        errorMessage = '유효하지 않은 세션입니다.'
        throw new Error('Invalid Session.')
      }
      // 이메일 및 비밀번호가 입력되지 않았을 때.
      if (!userEmail || !userPassword) {
        errorMessage = '비밀번호 혹은 이메일이 입력되지 않습니다.'
        throw new Error('Email or password is empty.')
      }

      // 해당 유저 찾기.
      const user = await db.User.findOne({
        where: {
          userEmail,
        },
      })
      // 유저가 없을 때
      if (user === null) {
        errorMessage = 'Email이 유효하지 않습니다.'
        throw new Error('user not found.')
      }
      // 해당 세션의 유저가 입력된 유저와 다를 때
      if (session.UserId !== user.Id) {
        errorMessage = '삭제할 수 없는 유저입니다.'
        throw new Error('Invalid target user.')
      }

      const password = await convertPassword(
        userPassword,
        Buffer.from(user.salt, 'base64')
      )

      if (user.userPassword === password.toString('base64')) {
        await session.destroy()
        await user.destroy()

        res.status(200).json({
          errorMessage: '회원 탈퇴에 성공 했습니다.',
        })
      } else {
        errorMessage = '비밀번호가 일치하지 않습니다.'
        throw new Error('password invalid')
      }
    } catch (e) {
      console.log(e)
      res.status(400).json({
        errorMessage,
      })
    }
  })()
})

router.post('/close-user', function (req, res) {
  // const userEmail = req.body.userEmail
  // const userPassword = req.body.userPassword

  // 수정 되어야함.
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
        // console.log(session)
        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        const pIUser = await db.InfectedUser.findOne({
          where: {
            UserID: session.User.Id,
          },
        })

        if (pIUser) {
          errorMessage = '이미 감염 등록된 사용자 입니다.'
          throw new Error('aleady infected user.')
        }
        // 추후에 추가 정보 정의.
        const iUser = await db.InfectedUser.create()
        // console.log(iUser)
        iUser.setUser(session.User)
        res.status(201).json({
          message: '감염 등록에 성공하였습니다.',
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
// close user 구현해야함.

export default router
