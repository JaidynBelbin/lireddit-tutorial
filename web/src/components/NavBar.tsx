import { Box, Link, Flex, Button } from "@chakra-ui/react";
import NextLink from "next/link"; // next/link gives client side routing, which is better than regular anchor tags
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  // Will not run the meQuery if we are on the server, because there is nothing
  // to fetch until the user has logged in, which happens once we are back
  // on the client-side.
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  let body = null;
  // data loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={3}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
    // user logged in
  } else {
    body = (
      <>
        <Box mr={2}>Welcome {data.me.username}!</Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant="link"
          color="white"
        >
          Logout
        </Button>
      </>
    );
  }
  return (
    <Flex bg="#ED8936" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
