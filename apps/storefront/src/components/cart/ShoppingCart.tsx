/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Hide,
  SimpleGrid,
  SlideFade,
  Spinner,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Cart, LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";

export const ShoppingCart = (): JSX.Element => {
  const [lineItems, setLineItems] = useState<LineItem[]>();
  const [order, setOrder] = useState<RequiredDeep<Order>>();
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  const getOrder = useCallback(async () => {
    const result = await Cart.Get();
    setOrder(result);
  }, []);

  const getLineItems = useCallback(async () => {
    if (!order?.ID) return;
    const result = await Cart.ListLineItems();
    setLineItems(result.Items);
  }, [order]);

  const deleteOrder = useCallback(async () => {
    if (!order?.ID) return;
    await Cart.Delete();

    setOrder(undefined);
    setLineItems(undefined);
  }, [order]);

  const submitOrder = useCallback(async () => {
    if (!order?.ID) return;
    try {
      await Cart.Submit();
      navigate("/order-summary");
    } catch (err) {
      console.log(err);
    }
  }, [navigate, order?.ID]);

  useEffect(() => {
    getOrder();
  }, [getOrder]);

  useEffect(() => {
    getLineItems();
  }, [order, getLineItems]);

  const handleLineItemChange = useCallback(
    (newLi: LineItem) => {
      setLineItems((items) => {
        return items?.map((li) => {
          if (li.ID === newLi.ID) {
            return newLi;
          }
          return li;
        });
      });
    },
    [setLineItems]
  );

  return (
    <>
      <Button position="fixed" bottom="3" right="3" onClick={onToggle}>
        Open
      </Button>
      <SimpleGrid
        gridTemplateColumns={
          lineItems && (isOpen ? { lg: "1fr 3fr 1fr" } : { lg: "3fr 1fr" })
        }
        width="full"
        gap={6}
      >
        <Card
          in={isOpen}
          as={SlideFade}
          variant="outline"
          w="full"
          rounded="none"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontFamily="monospace"
        >
          IFRAME EMBED GOES HERE
        </Card>

        <VStack alignItems="flex-start">
          <HStack
            w="full"
            justifyContent="flex-start"
            alignItems="center"
            borderBottom="1px solid"
            borderColor="chakra-border-color"
            mb={3}
            pb={3}
            gap={4}
          >
            <Heading
              as="h1"
              size="xl"
              flexGrow="1"
              color="chakra-placeholder-color"
              textTransform="uppercase"
              fontWeight="300"
            >
              Cart
            </Heading>
            <Button variant="link" as={RouterLink} to="/products" size="xs">
              Continue shopping
            </Button>
            {lineItems?.length !== 0 && (
              <Button
                type="button"
                onClick={deleteOrder}
                variant="outline"
                size="xs"
              >
                Clear cart
              </Button>
            )}
          </HStack>
          {lineItems?.length !== 0 ? (
            <VStack gap={6} w="100%" width="full" alignItems="flex-end">
              <OcCurrentOrderLineItemList
                lineItems={lineItems}
                emptyMessage="Your cart is empty"
                onChange={handleLineItemChange}
                editable
              />
            </VStack>
          ) : (
            <Spinner />
          )}
        </VStack>
        {/* Cart Summary  */}
        {lineItems && (
          <Card
            order={{ base: -1, lg: 1 }}
            variant="outline"
            w="full"
            rounded="none"
          >
            <CardBody
              as={Stack}
              direction={{ base: "row", lg: "column" }}
              gap={6}
              w="full"
              alignItems={{ base: "center", lg: "flex-start" }}
            >
              <Hide below="md">
                <Heading
                  as="h2"
                  size="xl"
                  color="chakra-placeholder-color"
                  textTransform="uppercase"
                  fontWeight="300"
                >
                  Summary
                </Heading>
              </Hide>
              {order?.Subtotal && (
                <Heading as="h3" size="md" fontWeight="normal">
                  Subtotal (
                  {lineItems
                    ?.map((li) => li?.Quantity || 0)
                    .reduce(
                      (accumulator, currentValue) => accumulator + currentValue,
                      0
                    )}{" "}
                  items):
                  <Text fontWeight={700} display="inline">
                    {formatPrice(order.Subtotal)}
                  </Text>
                </Heading>
              )}
              <Button
                mt="auto"
                onClick={submitOrder}
                size={{ base: "sm", lg: "lg" }}
                fontSize="lg"
                colorScheme="primary"
                w={{ lg: "full" }}
                _hover={{ textDecoration: "none" }}
              >
                Submit Order
              </Button>
            </CardBody>
          </Card>
        )}
      </SimpleGrid>
    </>
  );
};
