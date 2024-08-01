/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  HStack,
  Heading,
  Hide,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Cart, LineItem, Order, RequiredDeep } from "ordercloud-javascript-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";
import OcCurrentOrderLineItemList from "./OcCurrentOrderLineItemList";

export const ShoppingCart = (): JSX.Element => {
  const [lineItems, setLineItems] = useState<LineItem[]>();
  const [order, setOrder] = useState<RequiredDeep<Order>>();
  const navigate = useNavigate();

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

  // Group line items by product ID and sum their quantities
  const mergedLineItems = useMemo(() => {
    const itemMap = new Map();

    lineItems?.forEach((item) => {
      const { ProductID } = item;
      if (itemMap.has(ProductID)) {
        itemMap.get(ProductID).Quantity += item.Quantity;
      } else {
        // Otherwise, add it to the map
        itemMap.set(ProductID, { ...item });
      }
    });

    // Convert the map back to an array
    return Array.from(itemMap.values());
  }, [lineItems]);

  return (
    <SimpleGrid
      gridTemplateColumns={lineItems && { lg: "3fr 1fr", xl: "4fr 1fr" }}
      width="full"
      gap={6}
    >
      <VStack alignItems="flex-start">
        <HStack
          w="full"
          justifyContent="space-between"
          alignItems="center"
          borderBottom="1px solid"
          borderColor="chakra-border-color"
          mb={3}
          pb={3}
        >
          <Heading
            as="h1"
            size="xl"
            color="chakra-placeholder-color"
            textTransform="uppercase"
            fontWeight="300"
          >
            Cart
          </Heading>
          {mergedLineItems.length !== 0 && (
            <Button
              type="button"
              onClick={deleteOrder}
              variant="outline"
              alignSelf="flex-end"
              size="xs"
            >
              Clear cart
            </Button>
          )}
        </HStack>
        {mergedLineItems.length !== 0 ? (
          <VStack gap={6} w="100%" width="full" alignItems="flex-end">
            <OcCurrentOrderLineItemList
              lineItems={mergedLineItems}
              emptyMessage="Your cart is empty"
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
          variant="unstyled"
          borderLeftWidth={{ lg: "1px" }}
          borderLeftColor="chakra-border-color"
          pl={{ lg: 6 }}
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
                  ?.map((li) => li?.Quantity)
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
            <ButtonGroup w="full" as={VStack} alignItems="flex-start">
              <Button
                onClick={submitOrder}
                size={{ base: "sm", lg: "lg" }}
                fontSize="lg"
                colorScheme="primary"
                w={{ lg: "full" }}
                _hover={{ textDecoration: "none" }}
              >
                Proceed to Checkout
              </Button>
            </ButtonGroup>
          </CardBody>
        </Card>
      )}
    </SimpleGrid>
  );
};
