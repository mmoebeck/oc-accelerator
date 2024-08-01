import {
  Button,
  Container,
  GridItem,
  HStack,
  Heading,
  Icon,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@rwatt451/ordercloud-react";
import { FC, useEffect } from "react";
import { TbShoppingCart } from "react-icons/tb";
import {
  Link,
  Outlet,
  Link as RouterLink,
  useLocation,
} from "react-router-dom";
import { APP_NAME } from "../constants";
import { useCurrentUser } from "../hooks/currentUser";
import LoginModal from "./LoginModal";

const Layout: FC = () => {
  const { data: user } = useCurrentUser();
  const location = useLocation();
  const { pathname } = useLocation();
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
        w="full"
        h="100dvh"
        sx={{ "&>*": { width: "full" } }}
      >
        <GridItem
          area={"header"}
          zIndex={2}
          bgColor="chakra-body-bg"
          shadow="md"
          py={2}
        >
          <Container h="100%" maxW="full">
            <HStack h="100%" justify="flex-start" alignItems="center">
              <Heading size="md">{APP_NAME}</Heading>
              <HStack as="nav" flexGrow="1" ml={3}>
                <Button
                  as={RouterLink}
                  isActive={location.pathname === "/products"}
                  _active={{ bgColor: "primary.50" }}
                  to="/products"
                  size="sm"
                  variant="ghost"
                >
                  Shop All Products
                </Button>
                <Button
                  as={RouterLink}
                  isActive={location.pathname === "/catch-catalog"}
                  _active={{ bgColor: "primary.50" }}
                  to="/catch-catalog"
                  size="sm"
                  variant="ghost"
                >
                  Shop Catch Products
                </Button>
                <Button
                  as={RouterLink}
                  isActive={location.pathname === "/bunnings-catalog"}
                  _active={{ bgColor: "primary.50" }}
                  to="/bunnings-catalog"
                  size="sm"
                  variant="ghost"
                >
                  Shop Bunnings Products
                </Button>
              </HStack>
              <HStack>
                <Heading size="sm">
                  {isLoggedIn
                    ? `Welcome, ${user?.FirstName} ${user?.LastName}`
                    : "Welcome"}
                </Heading>
                <Button
                  as={Link}
                  to="/cart"
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon as={TbShoppingCart} />}
                  aria-label={`Link to cart`}
                >
                  Cart
                </Button>
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
        <Container
          maxW={pathname === "/cart" ? "full" : "container.2xl"}
          px={pathname === "/cart" ? 0 : "unset"}
          my={pathname === "/cart" ? 0 : 8}
          as="main"
          flex="1"
        >
          <Outlet />
        </Container>
        <HStack
          alignItems="center"
          justifyContent="center"
          as="footer"
          py={3}
          zIndex="12"
          bg="gray.50"
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
