import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Center,
  Show,
  Button,
  Switch,
  useColorMode,
  Text,
  Hide,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useMediaQuery,
  Image,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Link as ReactLink, useNavigate } from "react-router-dom";
import { IRootState } from "../../redux/store";

export default function Banner(props: { element: any }) {
  const navigate = useNavigate();
  const { toggleColorMode } = useColorMode();
  const [isLargerThan1700] = useMediaQuery("(min-width: 1700px)");
  const [isSmallerThan800] = useMediaQuery("(max-width: 800px)");
  const user = useSelector((state: IRootState) => state.user.user);
  const dietitian = useSelector((state: IRootState) => state.user.dietitian);
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  // If the role is dietitian render a different route for account
  const accountDir = "/dashboard/account";
  //   state.role === "dietitian" ? "/dietitian/account" : "/dashboard/account";

  const logout = async () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.location.href = "http://localhost:3000";
  };

  function MobileNav() {
    return (
      <Drawer placement="top" onClose={onDrawerClose} isOpen={isDrawerOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Center flex="8">
              <Text>NutriPOD</Text>
            </Center>
          </DrawerHeader>
          <DrawerBody>
            <Center>
              {/* If the role is dietitian render a different mobile nav */}
              {props.element}
            </Center>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Center
      height={isLargerThan1700 ? 40 : 20}
      p={"10"}
      mb={isLargerThan1700 ? 10 : 2}
      pos={"sticky"}
      top={0}
      zIndex={100}
    >
      <Center flex="2" display="flex" justifyContent="start">
        <Show above="md"></Show>
        <Hide above="1200px">
          <Button size="sm" onClick={onDrawerOpen}>
            <HamburgerIcon />
          </Button>
        </Hide>
      </Center>
      <Center flex="8" flexDir={"row"}>
        <Image
          src="/logo.png"
          boxSize={
            isSmallerThan800 ? "40px" : isLargerThan1700 ? "100px" : "60px"
          }
          mx={2}
        />
        <Text fontSize={isLargerThan1700 ? "6xl" : "2xl"} as="b">
          NutriPOD
        </Text>
      </Center>
      <Center flex="2" justifyContent="end" flexDirection="row">
        <Show above="md">
          <Text
            mx={4}
            fontSize={isLargerThan1700 ? "xl" : "md"}
            fontWeight="extrabold"
          >
            你好, {user[0].last_name || dietitian[0].last_name}
          </Text>
        </Show>
        <Menu>
          <MenuButton
            p={1}
            w={14}
            h={14}
            rounded="full"
            _hover={{ bg: "gray.400" }}
            _expanded={{ bg: "blue.400" }}
          >
            <Avatar />
          </MenuButton>
          <MenuList>
            <MenuItem
              fontWeight="bold"
              fontSize={isLargerThan1700 ? "xl" : "md"}
            >
              外觀：
              <Switch
                marginRight="1"
                size="md"
                onChange={() => toggleColorMode()}
              />
            </MenuItem>
            <Link as={ReactLink} to={accountDir}>
              <MenuItem
                fontWeight="bold"
                fontSize={isLargerThan1700 ? "xl" : "md"}
              >
                帳戶
              </MenuItem>
            </Link>

            <Link>
              <MenuItem
                fontWeight="bold"
                fontSize={isLargerThan1700 ? "xl" : "md"}
                onClick={() => logout()}
              >
                登出
              </MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </Center>
      <MobileNav />
    </Center>
  );
}
