import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

// A Resolver is a function that populates the data for a single field in our schema
// so our ApolloServer can respond to requests for that data.
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 75) + "...";
  }

  // 'posts' find All the Posts
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    // The maximum limit of posts to fetch.
    // If we get 21 posts, then we know there are more to get next Query,
    // but if we get less than that, we know that we have reached the end,
    // so we can remove the Load More button ahead of time.
    const maxLimit = Math.min(50, limit);
    const maxLimitPlusOne = maxLimit + 1;

    // Our querybuilder from TypeORM, sorting by createdAt (new)
    const queryBuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(maxLimitPlusOne);

    // The cursor is the point where we want to fetch new data from
    if (cursor) {
      queryBuilder.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const posts = await queryBuilder.getMany();

    // Returning only as many posts as they asked for, ie. 20, not 21.
    return {
      hasMore: posts.length === maxLimitPlusOne,
      posts: posts.slice(0, maxLimit),
    };
  }

  // 'post' finds just one Post with a given id
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // CREATE
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({
      ...input,
      creatorID: req.session.userId,
    }).save();
  }

  // UPDATE
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }

    return post;
  }

  // DELETE
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
