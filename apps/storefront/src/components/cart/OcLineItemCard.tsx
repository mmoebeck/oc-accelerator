import {
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Heading,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FunctionComponent, useMemo, useState } from "react";
import { LineItem } from "ordercloud-javascript-sdk";
import React from "react";
import formatPrice from "../../utils/formatPrice";
import OcQuantityInput from "./OcQuantityInput";

interface OcLineItemCardProps {
  lineItem: LineItem;
  editable?: boolean;
}

const OcLineItemCard: FunctionComponent<OcLineItemCardProps> = ({
  lineItem,
  editable,
}) => {
  const [quantity, _setQuantity] = useState(lineItem.Quantity);
  const product = useMemo(() => lineItem.Product, [lineItem]);
  const [isDeliveryInstructionsModalOpen, setIsDeliveryInstructionsModalOpen] =
    useState(false);

  return (
    <>
      <HStack
        id="lineItemRow"
        flexWrap="wrap"
        p={{ base: 3, md: "unset" }}
        gap={9}
        w="full"
      >
        <Image
          boxSize="100px"
          objectFit="cover"
          aspectRatio="1 / 1"
          shadow="sm"
          borderRadius="sm"
          src={lineItem?.Product?.xp?.Images?.[0].Url}
        />
        <VStack alignItems="flex-start" gap={3} flexGrow="1">
          <Link as={RouterLink} to={`/products/${lineItem?.Product?.ID}`}>
            <Text fontSize="xl" display="inline-block" maxW="md">
              {lineItem.Product.Name}
            </Text>
          </Link>
          <HStack alignItems="center" color="chakra-subtle-text" mt={-2}>
            <Text fontSize="xs">
              <Text fontWeight="600" display="inline">
                Item number:{" "}
              </Text>
              {lineItem.Product.ID}
            </Text>
            <Text color="chakra-placeholder-color" fontWeight="thin">
              |
            </Text>
            <Text fontSize="xs">
              <Text fontWeight="600" display="inline">
                Brand:{" "}
              </Text>
              {lineItem.Product?.xp?.Brand}
            </Text>
          </HStack>
          {lineItem?.Specs.map((spec) => (
            <React.Fragment key={spec.SpecID}>
              <Text mt={-3} fontSize="xs" color="chakra-subtle-text">
                <Text fontWeight="600" display="inline">
                  {spec.Name}:
                </Text>{" "}
                {spec.Value}
              </Text>
            </React.Fragment>
          ))}

          <ButtonGroup spacing="3" alignItems="center"></ButtonGroup>
        </VStack>
        {editable ? (
          <>
            {console.log(lineItem)}
            {product && (
              <OcQuantityInput
                controlId="addToCart"
                priceSchedule={lineItem.PriceScheduleID}
                quantity={Number(quantity)}
                onChange={_setQuantity}
              />
            )}
          </>
        ) : (
          <Text ml="auto">Qty: {lineItem.Quantity}</Text>
        )}
        <VStack minW="85px" alignItems="flex-end">
          <Text fontWeight="600" fontSize="lg">
            {formatPrice(lineItem.LineSubtotal)}
          </Text>
          <Text fontSize=".7em" color="chakra-subtle-text">
            ({formatPrice(lineItem.UnitPrice)} each)
          </Text>
        </VStack>
      </HStack>

      <Modal
        isOpen={isDeliveryInstructionsModalOpen}
        onClose={() => setIsDeliveryInstructionsModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent width="full" w="100%" maxWidth="800px">
          <ModalHeader>
            <Heading>Add Delivery Instructions</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Textarea placeholder="Delivery instructions" height="175px" />
              <HStack
                w="100%"
                width="full"
                justifyItems="space-between"
                justifyContent="space-between"
                mb={6}
              >
                <Button
                  type="button"
                  aria-describedby="ae-checkout-tip"
                  border="1px"
                  borderColor="gray.300"
                  variant="primaryButton"
                  height="50px"
                  onClick={() => setIsDeliveryInstructionsModalOpen(false)}
                >
                  <Text fontSize="18px">Add Delivery Instructions</Text>
                </Button>

                <Button
                  type="button"
                  aria-describedby="ae-checkout-tip"
                  border="1px"
                  borderColor="gray.300"
                  variant="secondaryButton"
                  height="50px"
                  onClick={() => setIsDeliveryInstructionsModalOpen(false)}
                >
                  <Text fontSize="18px">Cancel</Text>
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OcLineItemCard;
