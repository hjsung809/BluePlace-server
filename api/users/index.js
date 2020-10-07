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
  res.json({ userData: 'this is user data.' })
})

router.post('/', function (req, res) {
  const userEmail = req.body.userEmail
  const userPassword = req.body.userPassword
  const userPhoneNumber = req.body.userPhoneNumber

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
        userEmail,
        userPassword: password.toString('base64'),
        salt: salt.toString('base64'),
        userPhoneNumber,
      })
      res.status(201).end()
      return
    } catch (e) {
      console.log(e)
    }
    res.status(400).json({
      errorMessage,
    })
  })()
})

router.post('/auth', function (req, res) {
  res.json({ metaData: 'this is user data.' })
})

router.post('/login', function (req, res) {
  const userEmail = req.body.userEmail
  const userPassword = req.body.userPassword

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
        // 세션 발급.
        const sessionKey = uuid4()
        const session = await db.Session.create({
          key: sessionKey,
        })
        session.setUser(user)

        // 쿠키 지정.
        res.cookie('SKEY', sessionKey)
        res.status(200).json({
          errorMessage: '로그인에 성공 했습니다.',
        })
        return
      } else {
        errorMessage = '비밀번호가 일치하지 않습니다.'
        throw new Error('password invalid')
      }
    } catch (e) {
      // console.log(e)
    }

    res.status(400).json({
      errorMessage,
    })
  })()
})

router.put('/', function (req, res) {
  res.json({ metaData: 'this is user data.' })
})

router.delete('/', function (req, res) {
  res.json({ metaData: 'this is user data.' })
})

export default router
