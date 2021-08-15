import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsLoggedIn } from "../utils/useIsLoggedIn";

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter();
  useIsLoggedIn(); // Checking if they are logged in once they land on this page
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values }); // running the create post mutation with the provided values
          if (!error) {
            router.push("/"); // going back to the homepage after making a post
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="title"
              placeholder="Enter a title"
              label="Title"
            />
            <Box mt={5}>
              <InputField
                textarea
                name="text"
                placeholder="Enter some text"
                label="Text"
                type="Text"
              />
            </Box>

            <Button
              mt={5}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
