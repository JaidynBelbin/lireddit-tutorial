import {Query, Resolver} from 'type-graphql';

// A Resolver is a function that populates the data for a single field in our schema
// so our ApolloServer can respond to requests for that data.
@Resolver()
export class HelloResolver {
    @Query(() => String)
    hello() {
        return "Hello world!"
    }
};
