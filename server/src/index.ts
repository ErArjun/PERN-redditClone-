import 'reflect-metadata'
import { COOKIE_NAME, __prod__ } from '././constants'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import session from 'express-session'
import {Redis} from 'ioredis'
import { MyContext } from './types'
import cors from 'cors'
import { dataSource } from './config/dataSource'


const main = async () => {
  await dataSource.initialize();

  await dataSource.runMigrations();


  const app = express()

  const RedisStore = require('connect-redis')(session)
  const redis = new Redis()
 
  app.set('trust proxy', 1)
  app.use(
    cors({
      credentials: true,
      origin:['https://studio.apollographql.com','http://localhost:3000']
    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      saveUninitialized: false,
      secret: 'randomtext',
      resave: false,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',   //csrf
        secure: __prod__, //secure true means cookies only work in https
      },
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({req, res,redis}),
  })

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: false,
  })
  app.listen(4000, () => {
    console.log('server started at 3000')
  })
}

main()
