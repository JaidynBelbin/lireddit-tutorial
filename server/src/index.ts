import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, _prod_ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
  // Initialising the ORM, loading entity metadata, creating the EM and connecting
  // to the db.
  const orm = await MikroORM.init(microConfig);

  // Getting all the migrations on app startup
  await orm.getMigrator().up();

  // Creating a new Express app
  const app = express();

  // Setting up redis
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  // To fix this error: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSNotSupportingCredentials
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  // Important that the redis middleware is applied before the Apollo middleware, because
  // the order they are added to app is the order they are run in, and we need to access
  // redis from within our Apollo server.

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // keep cookie for 10 years
        httpOnly: true,
        sameSite: "lax", // protects against CSRF attacks
        secure: _prod_, // cookie only sent over HTTPS when in production (more secure)
      },
      saveUninitialized: false,
      secret: "asdkjasfjekslqieulflio",
      resave: false,
    })
  );

  // Creating our Apollo graphql server
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),

    // A special object accessible by all the resolvers, so put the EntityManager here,
    // since we need it to query the Posts.
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  // Applying the Express middleware to our Apollo Server, creating a graphql endpoint
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // Telling our Express server to listen for connections on port 4000
  app.listen(4000, () => {
    console.log("Express server started on localhost:4000");
  });
};

main();
