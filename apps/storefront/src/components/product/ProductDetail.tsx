import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  BuyerProduct,
  Cart,
  InventoryRecord,
  ListPage,
  Me,
  OrderCloudError,
  RequiredDeep,
} from "ordercloud-javascript-sdk";
import React, { useCallback, useEffect, useState } from "react";
import { TbPhoto } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";
import OcQuantityInput from "../cart/OcQuantityInput";

export interface ProductDetailProps {
  productId: string;
  renderProductDetail?: (product: BuyerProduct) => JSX.Element;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  renderProductDetail,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState<BuyerProduct>();
  const [activeRecordId, setActiveRecordId] = useState<string>();
  const [inventoryRecords, setInventoryRecords] =
    useState<RequiredDeep<ListPage<InventoryRecord>>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(
    product?.PriceSchedule?.MinQuantity ?? 1
  );
  const outOfStock = product?.Inventory?.QuantityAvailable === 0;

  const getProduct = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Me.GetProduct(productId);
      setProduct(result);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }, [productId]);

  const getProductInventory = useCallback(async () => {
    try {
      const result = await Me.ListProductInventoryRecords(productId);
      setInventoryRecords(result);

      const availableRecord = result.Items.find(
        (item) => item.QuantityAvailable > 0
      );

      if (availableRecord) {
        setActiveRecordId(availableRecord.ID);
      }
    } catch (error) {
      console.error("Error fetching product inventory:", error);
    }
  }, [productId]);

  useEffect(() => {
    getProduct();
    getProductInventory();
  }, [getProduct, getProductInventory]);

  const handleAddToCart = useCallback(async () => {
    if (product && activeRecordId) {
      try {
        setAddingToCart(true);
        await Cart.CreateLineItem({
          ProductID: productId,
          Quantity: quantity,
          InventoryRecordID: activeRecordId,
        });
        setAddingToCart(false);
        navigate("/cart");
      } catch (error) {
        setAddingToCart(false);
        if (error instanceof OrderCloudError) {
          toast({
            title: "Error adding to cart",
            description:
              error.message ||
              "Please ensure all required specifications are filled out.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.error("Failed to add item to cart:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } else {
      toast({
        title: "No Inventory Available",
        description: "Please select a store with available inventory.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [product, productId, quantity, navigate, toast, activeRecordId]);

  if (!product) {
    console.warn("[ProductDetail.tsx] Product not found for ID:", productId);
    return <div>Product not found for ID: {productId}</div>;
  }

  return loading ? (<Spinner/>) : product ? (renderProductDetail ? (
    renderProductDetail(product)
  ) : (
    <SimpleGrid gridTemplateColumns={{ lg: "1fr 2fr" }} gap={12}>
      <Center
        bgColor="chakra-subtle-bg"
        aspectRatio="1 / 1"
        objectFit="cover"
        boxSize="100%"
        maxH="300px"
        borderTopRadius="md"
      >
        {product.xp?.Images && product.xp.Images[0]?.Url ? (
          <Image
            borderTopRadius="md"
            boxSize="full"
            objectFit="cover"
            src={product.xp.Images[0].Url}
            zIndex={1}
            onError={(e) => {
              e.currentTarget.src = ""; // Prevent the broken image from rendering
              e.currentTarget.style.display = "none"; // Hide the broken image
            }}
          />
        ) : (
          <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
        )}
        <Icon
          fontSize="5rem"
          color="gray.300"
          as={TbPhoto}
          position="absolute"
        />
      </Center>
      <VStack alignItems="flex-start" maxW="4xl" gap={4}>
        <HStack alignItems="center" color="chakra-subtle-text" fontSize="sm">
          <Text>{product.ID}</Text>
          <Text color="gray.200">|</Text>
          {product.xp?.Brand && (
            <Text>
              <Text as="span" fontWeight="semibold">
                Brand:
              </Text>{" "}
              {product.xp?.Brand}
            </Text>
          )}
        </HStack>
        <Heading size="lg">{product.Name}</Heading>
        <Text maxW="prose">{product.Description}</Text>
        <Text fontSize="xl" fontWeight="bold">
          {formatPrice(product?.PriceSchedule?.PriceBreaks?.[0].Price)}
        </Text>
        <HStack alignItems="center" gap={4} my={4}>
          <Button
            colorScheme="primary"
            type="button"
            onClick={handleAddToCart}
            isDisabled={
              addingToCart || product?.Inventory?.QuantityAvailable === 0
            }
          >
            {product?.Inventory?.QuantityAvailable === 0
              ? "Out of stock"
              : "Add To Cart"}
          </Button>
          <OcQuantityInput
            controlId="addToCart"
            priceSchedule={product.PriceSchedule}
            quantity={quantity}
            onChange={setQuantity}
          />
        </HStack>
        {!outOfStock && (
          <>
            <Heading size="sm" color="chakra-subtle-text">
              {outOfStock
                ? "No available stock"
                : `(${inventoryRecords?.Items.length}) locations with inventory`}
            </Heading>
            <HStack spacing={4}>
              {inventoryRecords?.Items.length &&
                inventoryRecords?.Items.map((item) => (
                  <Button
                    onClick={() => setActiveRecordId(item.ID)}
                    cursor="pointer"
                    variant="outline"
                    as={Card}
                    h="150px"
                    aspectRatio="1 / 1"
                    key={item.ID}
                    isDisabled={item.QuantityAvailable === 0}
                  >
                    <CardBody
                      fontSize="xs"
                      p={1}
                      display="flex"
                      alignItems="flext-start"
                      justifyContent="center"
                      flexFlow="column nowrap"
                    >
                      <Text fontSize="sm">{item.Address.AddressName}</Text>
                      <Text>{item.Address.Street1}</Text>
                      {item.Address.Street2 && (
                        <Text>{item.Address.Street2}</Text>
                      )}
                      <Text>Stock: {item.QuantityAvailable}</Text>
                    </CardBody>
                    <CardFooter py={2} fontSize="xs">
                      {item.QuantityAvailable === 0
                        ? "Out of stock"
                        : "Select This Store"}
                    </CardFooter>
                  </Button>
                ))}
            </HStack>
          </>
        )}
      </VStack>
    </SimpleGrid>
  )) : (
    <div>Product not found for ID: {productId}</div>
  );
};

export default ProductDetail;
