import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { MikroORM } from "@mikro-orm/core";
import path from "path";

// Everything needed to initialise the ORM
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  debug: !_prod_, // Want to be in debugging mode only when not in production
} as Parameters<typeof MikroORM.init>[0]; // Getting the specific types that MikroORM.init expects
