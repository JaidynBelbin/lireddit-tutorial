import React from "react";
import { NavBar } from "./NavBar";
import { Wrapper, WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

// A basic layout component for any page that we want a nav bar on, and custom content in.
export const Layout: React.FC<LayoutProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
