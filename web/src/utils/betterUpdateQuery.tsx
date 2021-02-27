import { Cache, QueryInput } from "@urql/exchange-graphcache";

// Helper function to cast the types we are receiving from our query,
// the default .updateQuery method from urql doesn't support types very well.
// Every time Login or RegisterMutation is called, this function takes the result
// of that query and updates the MeQuery with the user.id and .username so that
// the cache always pulls the updated version.
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
