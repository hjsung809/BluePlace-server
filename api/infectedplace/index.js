import express from 'express'
import db from '../../database'

const router = express.Router()

router.get('/', function (req, res) {
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
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
              include: [
                {
                  model: db.Region,
                  attributes: ['Id', 'regionName', "regionNameEn"]
                }
              ]
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        console.log(session.User.Id)
        

        // raw query 

        // const queryString = `
        //   SELECT ip.* FROM infectedplace as ip
        //   join (SELECT iu.Id FROM infecteduser as iu 
        //   join (SELECT uc.RelatedUserId as UserId FROM userclose as uc WHERE uc.active = 1 AND uc.UserId = :userId
        //   UNION
        //   SELECT uclq1.UserId FROM userclique as uclq1 
        //   join (SELECT uclq2.CliqueId FROM userclique as uclq2
        //   join (SELECT uclq3.CliqueId FROM (userclique as uclq3, user as u2) 
        //   where uclq3.active = 1 and uclq3.UserId = u2.Id and u2.Id = :userId) as sq 
        //   on uclq2.CliqueId = sq.CliqueId GROUP BY CliqueId) as sq2
        //   on sq2.CliqueId = uclq1.CliqueId GROUP BY UserId
        //   UNION
        //   SELECT urg1.UserId FROM userregion as urg1 
        //   join (SELECT urg2.RegionId FROM userregion as urg2
        //   join (SELECT urg3.RegionId FROM (userregion as urg3, user as u2) 
        //   where urg3.UserId = u2.Id and u2.Id = :userId) as sq 
        //   on urg2.RegionId = sq.RegionId GROUP BY RegionId) as sq2
        //   on sq2.RegionId = urg1.RegionId GROUP BY UserId
        //   ) as sq3 on sq3.UserId = iu.UserId AND sq3.UserId != :userId
        //   ) as sq4 on ip.InfectedUserId = sq4.Id;
        // `
        // const infectedplaces = await db.sql.query(queryString, 
        //   { replacements: {userId: session.User.Id}, type: db.sql.QueryTypes.SELECT }
        // )


        // use blueplace_server_test;
        // set @userId := 1;

        // SELECT ip.* FROM infectedplace as ip
        // join (SELECT iu.Id FROM infecteduser as iu 
        // join (SELECT uc.RelatedUserId as UserId FROM userclose as uc WHERE uc.active = 1 AND uc.UserId = @userId
        // UNION
        // SELECT uclq1.UserId FROM userclique as uclq1 
        // join (SELECT uclq2.CliqueId FROM userclique as uclq2
        // join (SELECT uclq3.CliqueId FROM (userclique as uclq3, `user` as u2) 
        // where uclq3.active = 1 and uclq3.UserId = u2.Id and u2.Id = @userId) as sq 
        // on uclq2.CliqueId = sq.CliqueId GROUP BY CliqueId) as sq2
        // on sq2.CliqueId = uclq1.CliqueId GROUP BY UserId
        // UNION
        // SELECT urg1.UserId FROM userregion as urg1 
        // join (SELECT urg2.RegionId FROM userregion as urg2
        // join (SELECT urg3.RegionId FROM (userregion as urg3, `user` as u2) 
        // where urg3.UserId = u2.Id and u2.Id = @userId) as sq 
        // on urg2.RegionId = sq.RegionId GROUP BY RegionId) as sq2
        // on sq2.RegionId = urg1.RegionId GROUP BY UserId
        // ) as sq3 on sq3.UserId = iu.UserId AND sq3.UserId != @userId
        // ) as sq4 on ip.InfectedUserId = sq4.Id;


        const infectedPlaces = await db.User.findOne({
          where: {
            Id: session.User.Id,
          },
          attributes: ['Id'],
          include: [
            {
              model: db.User,
              attributes: ['Id'],
              through: { 
                attributes: ['active'], 
                where:{
                  active: 1,
                }
              },
              as: 'SelfUser',
              include: [
                {
                  model: db.InfectedUser,
                  attributes: ['Id'],
                  include: [
                    {
                      model: db.InfectedPlace,
                    }
                  ]
                },
              ]
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
                  attributes: ['Id'],
                  as: 'CliqueMember',
                  where:{
                    Id: {[db.Sequelize.Op.ne]: session.User.Id},
                  },
                  include:[
                    {
                      model: db.InfectedUser,
                      attributes: ['Id','UserId'],
                      include: [
                        {
                          model: db.InfectedPlace,
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              model: db.Region,
              include: [
                {
                  model: db.User,
                  attributes: ['Id'],
                  include:[
                    {
                      model: db.InfectedUser,
                      attributes: ['Id'],
                      where:{
                        UserId: {[db.Sequelize.Op.ne]: session.User.Id},
                      },
                      include: [
                        {
                          model: db.InfectedPlace,
                        }
                      ]
                    }
                  ]
                }
              ],
            }
          ]
        })

        res.status(200).json(infectedPlaces)
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


// CREATE infectedplace

router.post('/', function (req, res) {

  // Get Parameters
  const infectedplaces = req.body.infectedplaces
  
  // test infectedplaces
  // [
  //   {
  //       infectedPlaceName: '',
  //       adress: '',
  //       longitude: 126,
  //       latitude: 35,
  //       size: 30,
  //   },
  // ]
  

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
              attributes: ['Id', 'userEmail', 'userPhoneNumber'],
              include: [
                {
                  model: db.Region,
                  attributes: ['Id', 'regionName', "regionNameEn"]
                }
              ]
            }
          ]
        })

        if (!session) {
          errorMessage = '유효하지 않은 세션입니다.'
          throw new Error('session invalid')
        }

        const infectedUser = await db.InfectedUser.findOrCreate({
          where: {
            UserId: session.User.Id
          }
        })

        // console.log(session.User.Id)
        
        infectedplaces.forEach(async place => {
          console.log(place)
          const infectedplaces = await db.InfectedPlace.create(place)
          infectedplaces.setInfectedUser(infectedUser[0])
        })

        res.status(200).json(infectedplaces)
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

export default router