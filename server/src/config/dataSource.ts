import { DataSource } from "typeorm";

export const dataSource =new DataSource({
    type:'postgres',
    database:'reddit2',
    username:'postgres',
    password:'postgres',
    logging:true,
    synchronize:true,
    //entities:[Post,User],
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
  })