
import {Post} from '../entities/Post';
import {Arg, Ctx, Mutation, Query, Resolver} from 'type-graphql';
import {MyContext} from '../types';

// A Resolver is a function that populates the data for a single field in our schema
// so our ApolloServer can respond to requests for that data.
@Resolver()
export class PostResolver {

    // 'posts' find All the Posts
    @Query(() => [Post]) 
    posts(@Ctx() { em }: MyContext): Promise<Post[]> {
        return em.find(Post, {})
    }

    // 'post' finds just one Post with a given id
    @Query(() => Post, {nullable: true})
    post (@Arg('id') id: number, @Ctx() {em}: MyContext): Promise<Post | null> {
        return em.findOne(Post, { id });
    }

    // CREATE
    @Mutation(() => Post)
    async createPost (
        @Arg('title') title: string, 
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    }

    // UPDATE
    @Mutation(() => Post, {nullable: true})
    async updatePost (
        @Arg('id') id: number,
        @Arg('title', () => String, {nullable: true}) title: string,
        @Ctx() {em}: MyContext
    ): Promise<Post | null> {
        const post = await em.findOne(Post, {id});
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await em.persistAndFlush(post);
        }

        return post;
    }

    // DELETE
    @Mutation(() => Boolean)
    async deletePost (
        @Arg('id') id: number,
        @Ctx() {em}: MyContext
    ): Promise<boolean> {
        await em.nativeDelete(Post, {id});
        return true;
    }
};
