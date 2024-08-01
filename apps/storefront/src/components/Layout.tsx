import {
  Button,
  Container,
  GridItem,
  HStack,
  Heading,
  Icon,
  IconButton,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@rwatt451/ordercloud-react";
import { FC, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import LoginModal from "./LoginModal";
import { APP_NAME } from "../constants";
import { useCurrentUser } from "../hooks/currentUser";
import { TbLink, TbShoppingCart } from "react-icons/tb";

const Layout: FC = () => {
  const { data: user } = useCurrentUser();

  const { allowAnonymous, isAuthenticated, isLoggedIn, logout } =
    useOrderCloudContext();

  const loginDisclosure = useDisclosure();

  useEffect(() => {
    if (!allowAnonymous && !isAuthenticated) {
      loginDisclosure.onOpen();
    } else if (loginDisclosure.isOpen && isLoggedIn) {
      loginDisclosure.onClose();
    }
  }, [loginDisclosure, allowAnonymous, isAuthenticated, isLoggedIn]);

  return (
    <>
      <LoginModal disclosure={loginDisclosure} />
      <VStack
        alignItems="flex-start"
        w="100dvw"
        h="100dvh"
        sx={{ "&>*": { width: "full" } }}
      >
        <GridItem area={"header"} zIndex={2} shadow="md">
          <Container h="100%" maxW="full">
            <HStack h="100%" justify="space-between" alignItems="center">
              <Heading size="md">{APP_NAME}</Heading>
              <HStack>
                <Heading size="sm">
                  {isLoggedIn
                    ? `Welcome, ${user?.FirstName} ${user?.LastName}`
                    : "Welcome"}
                </Heading>
                <Link to={"/cart"}>
                  <IconButton
                  size="lg"
                    icon={<Icon as={TbShoppingCart} />}
                    variant="unstyled"
                    aria-label={`Link to cart`}
                  />
                </Link>
                {isLoggedIn ? (
                  <Button size="sm" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Button size="sm" onClick={loginDisclosure.onOpen}>
                    Login
                  </Button>
                )}
              </HStack>
            </HStack>
          </Container>
          </GridItem>
        {/* </HStack> */}
        <Container maxW="container.2xl" py={8} as="main" flex="1">
          <Outlet />
        </Container>
        <HStack
          alignItems="center"
          justifyContent="center"
          as="footer"
          py={3}
          bg="blackAlpha.50"
        >
          <Text fontWeight="normal" fontSize="sm">
            © Sitcore Inc. 2024
          </Text>
        </HStack>
      </VStack>
    </>
  );
};

export default Layout;
