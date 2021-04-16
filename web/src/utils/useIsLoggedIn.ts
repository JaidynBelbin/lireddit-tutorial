import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsLoggedIn = () => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery();

  // Checking whether the user is logged in, and if not, redirecting them to the login page.
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.route);
    }
  }, [fetching, data, router]);
};
