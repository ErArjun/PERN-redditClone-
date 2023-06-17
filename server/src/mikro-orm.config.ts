import { MikroORM } from '@mikro-orm/postgresql';
import path from 'path';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { User } from './entities/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
  },
  entities: [Post, User],
  dbName: 'reddit',
  /*clientUrl:
    'postgresql://postgres:IOAOZchlVadfZsqph07C@containers-us-west-167.railway.app:6675/railway',*/
  user: 'postgres',
  password: 'postgres',
  type: 'postgresql',
  debug: !__prod__,
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
