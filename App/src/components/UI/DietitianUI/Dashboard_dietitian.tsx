import { Container, Flex, useMediaQuery } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

import Banner from "../Banner";
import DietitianNav from "./Dietitian_Nav";
import DietitianNavLinks from "./Dietitian_nav_links";

export default function DashBoardDietitian() {
  const [isSmallerThan600] = useMediaQuery("(max-width: 600px)");
  return (
    <>
      <Banner element={<DietitianNavLinks />} />
      <Container
        minW={"100%"}
        display="flex"
        flexDirection="row"
        justifyContent={"center"}
      >
        <DietitianNav />
        <Flex
          height="88vh"
          flex="8"
          p="2"
          borderRadius="2xl"
          overflow={"auto"}
          flexWrap={"wrap"}
          maxW={"1500px"}
          maxH={isSmallerThan600 ? "100%" : "850px"}
          justifyContent={"center"}
        >
          <Outlet />
        </Flex>
      </Container>
    </>
  );
}
