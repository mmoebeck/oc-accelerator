import {
  Button,
  ButtonGroup,
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
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cart, LineItem } from "ordercloud-javascript-sdk";
import React from "react";
import formatPrice from "../../utils/formatPrice";
import OcQuantityInput from "./OcQuantityInput";
import useDebounce from "../../hooks/useDebounce";

interface OcLineItemCardProps {
  lineItem: LineItem;
  editable?: boolean;
  onChange?: (newLi: LineItem) => void;
}

const OcLineItemCard: FunctionComponent<OcLineItemCardProps> = ({
  lineItem,
  editable,
  onChange,
}) => {
  const [quantity, setQuantity] = useState(lineItem.Quantity);
  const debouncedQuantity = useDebounce(quantity, 300);
  const product = useMemo(() => lineItem.Product, [lineItem]);
  const [isDeliveryInstructionsModalOpen, setIsDeliveryInstructionsModalOpen] =
    useState(false);

  const updateLineItem = useCallback(
    async (quantity: number) => {
      if (quantity !== lineItem.Quantity) {
        const response = await Cart.PatchLineItem(lineItem.ID!, {
          Quantity: quantity,
        });
        if (onChange) {
          onChange(response);
        }
      }
    },
    [lineItem, onChange]
  );

  useEffect(() => {
    updateLineItem(debouncedQuantity);
  }, [debouncedQuantity, updateLineItem]);

  const lineSubtotal = useMemo(
    () => formatPrice(lineItem.LineSubtotal),
    [lineItem]
  );
  const unitPrice = useMemo(() => formatPrice(lineItem.UnitPrice), [lineItem]);

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
              {lineItem.Product?.Name}
            </Text>
          </Link>
          <HStack alignItems="center" color="chakra-subtle-text" mt={-2}>
            <Text fontSize="xs">
              <Text fontWeight="600" display="inline">
                Item number:{" "}
              </Text>
              {lineItem.Product?.ID}
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
          {lineItem?.Specs?.map((spec) => (
            <Text
              key={spec.SpecID}
              mt={-3}
              fontSize="xs"
              color="chakra-subtle-text"
            >
              <Text fontWeight="600" display="inline">
                {spec.Name}:
              </Text>{" "}
              {spec.Value}
            </Text>
          ))}
        </VStack>
        {editable ? (
          <OcQuantityInput
            controlId="addToCart"
            priceSchedule={lineItem.PriceScheduleID}
            quantity={Number(quantity)}
            onChange={setQuantity}
          />
        ) : (
          <Text ml="auto">Qty: {lineItem.Quantity}</Text>
        )}
        <VStack minW="85px" alignItems="flex-end">
          <Text fontWeight="600" fontSize="lg">
            {lineSubtotal}
          </Text>
          <Text fontSize=".7em" color="chakra-subtle-text">
            ({unitPrice} each)
          </Text>
        </VStack>
      </HStack>

      <Modal
        isOpen={isDeliveryInstructionsModalOpen}
        onClose={() => setIsDeliveryInstructionsModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent width="full" w="full" maxWidth="800px">
          <ModalHeader>
            <Heading>Add Delivery Instructions</Heading>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Textarea placeholder="Delivery instructions" height="175px" />
              <HStack
                w="full"
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
