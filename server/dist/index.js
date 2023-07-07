"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("././constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = require("ioredis");
const cors_1 = __importDefault(require("cors"));
const dataSource_1 = require("./config/dataSource");
const main = async () => {
    await dataSource_1.dataSource.initialize();
    await dataSource_1.dataSource.runMigrations();
    const app = (0, express_1.default)();
    const RedisStore = require('connect-redis')(express_session_1.default);
    const redis = new ioredis_1.Redis();
    app.set('trust proxy', 1);
    app.use((0, cors_1.default)({
        credentials: true,
        origin: ['https://studio.apollographql.com', 'http://localhost:3000']
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
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
            sameSite: 'lax',
            secure: constants_1.__prod__,
        },
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(4000, () => {
        console.log('server started at 3000');
    });
};
main();
//# sourceMappingURL=index.js.map