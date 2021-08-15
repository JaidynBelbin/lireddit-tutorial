import {
  Box,
  Button,
  CircularProgress,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

/// Our web home page
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  // Now our data is fetched using PostsQuery, and we now have to provide it a limit
  // and an optional cursor
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  function Post(id: number, title: String, textSnippet: String) {
    return (
      <Box key={id} p={5} shadow="md" borderWidth="1px">
        <Heading fontSize="xl">{title}</Heading>
        <Text marginTop={5}>{textSnippet}</Text>
      </Box>
    );
  }

  if (!data && !fetching) {
    return <div>No data could be found for some reason</div>;
  }

  return (
    <Layout>
      <Flex>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Button ml="auto" colorScheme="teal" variant="link">
            Create a post
          </Button>
        </NextLink>
      </Flex>

      <br />
      {!data && fetching ? (
        // Not sure we will ever see this, but its here just in case
        <CircularProgress size="100px" color="orange" capIsRound={true} />
      ) : (
        <Stack spacing={10}>
          {data!.posts.posts.map((p) => Post(p.id, p.title, p.textSnippet))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                // The limit of posts to fetch stays the same, but
                // the cursor says that
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
            colorScheme="teal"
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

// Server-side rendering will render all the data on the server and deliver it to the page when its
// done, so you don't see any loading. Better for SEO, because the page source will contain all of the
// data.
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
