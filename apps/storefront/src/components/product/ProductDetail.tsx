import {
  Button,
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
  Me,
  OrderCloudError,
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

const ProductDetail: React.FC<ProductDetailProps> = ({ productId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState<BuyerProduct>();
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(
    product ? product.PriceSchedule.MinQuantity : 1
  );

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

  useEffect(() => {
    getProduct();
  }, [getProduct]);

  const handleAddToCart = useCallback(async () => {
    if (product) {
      try {
        setAddingToCart(true);
        await Cart.CreateLineItem({ ProductID: productId, Quantity: quantity });
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
    }
  }, [product, productId, quantity, navigate, toast]);

  return loading ? (
    <Spinner />
  ) : product ? (
    <SimpleGrid gridTemplateColumns="1fr 3fr" gap={8}>
      <Center bgColor="chakra-subtle-bg" aspectRatio="1 / 1" objectFit="cover">
        {product.xp?.Images ? (
          <Image
            boxSize="full"
            objectFit="cover"
            src={product.xp?.Images[0]?.Url}
          />
        ) : (
          <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
        )}
      </Center>
      <VStack alignItems="flex-start" maxW="4xl" gap={4}>
        <Text fontSize="xs" color="chakra-subtle-text">
          {product.ID}
        </Text>
        <Heading size="lg" mt={-2}>
          {product.Name}
        </Heading>
        <Text maxW="prose">{product.Description}</Text>
        {product.xp?.Brand && (
          <Text fontWeight="normal" fontSize="sm">
            Brand: {product.xp?.Brand}
          </Text>
        )}
        <Text fontSize="xl">
          {formatPrice(product.PriceSchedule?.PriceBreaks[0]?.Price)}
        </Text>
        <HStack alignItems="center" gap={4}>
          <Button
            colorScheme="primary"
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            Add To Cart
          </Button>
          <OcQuantityInput
            controlId="addToCart"
            priceSchedule={product.PriceSchedule}
            quantity={quantity}
            onChange={setQuantity}
          />
          {product.Inventory.Enabled && (
            <Text>
              Quantity Available: {product.Inventory.QuantityAvailable}
            </Text>
          )}
        </HStack>
      </VStack>
    </SimpleGrid>
  ) : (
    <div>Product not found for ID: {productId}</div>
  );
};

export default ProductDetail;
