import 'reflect-metadata'
import { __prod__ } from '././constants'
import { MikroORM } from '@mikro-orm/core'
import mikroConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import session from 'express-session'
import * as redis from 'redis'
import { MyContext } from './types'
import cors from 'cors'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig)
  await orm.getMigrator().up()
  const app = express()

  const RedisStore = require('connect-redis')(session)
  const redisClient = redis.createClient({ legacyMode: true })
  redisClient.connect()

 
  app.set('trust proxy', 1)
  app.use(
    cors({
      credentials: true,
      origin:['https://studio.apollographql.com','http://localhost:3000']
    })
  )

  app.use(
    session({
      name: 'qid',
      saveUninitialized: false,
      secret: 'randomtext',
      resave: false,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: false,
        sameSite: 'lax',
        secure: false,
      },
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false,
  })
  app.listen(4000, () => {
    console.log('server started')
  })
}

main()
