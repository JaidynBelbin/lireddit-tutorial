import "reflect-metadata";
import { createConnection } from "typeorm";
import { COOKIE_NAME, _prod_ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
  // Initialising the ORM, loading entity metadata, creating the EM and connecting
  // to the db.
  const connection = await createConnection({
    type: "postgres",
    database: "lireddit-new",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  // Clearing the posts
  //await Post.delete({})

  // Creating a new Express app
  const app = express();

  // Setting up redis
  const RedisStore = connectRedis(session);
  const redis = new Redis();

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
        client: redis,
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
    context: ({ req, res }) => ({ req, res, redis }),
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
