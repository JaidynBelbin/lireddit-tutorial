import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link>Create a post</Link>
      </NextLink>
      <br></br>
      {!data ? null : data.posts.map((p) => <div key={p.id}>{p.title}</div>)}
    </Layout>
  );
};

// Server-side rendering will render all the data on the server and deliver it to the page when its
// done, so you don't see any loading. Better for SEO, because the page source will contain all of the
// data.
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
