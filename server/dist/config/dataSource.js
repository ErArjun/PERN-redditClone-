"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
exports.dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'reddit2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: ["dist/entities/*.js"],
    migrations: ["dist/migrations/*.js"],
});
//# sourceMappingURL=dataSource.js.map