import { Heading, SimpleGrid } from "@chakra-ui/react";
import { BuyerProduct, Me } from "ordercloud-javascript-sdk";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import ProductCard from "./ProductCard";
export interface ProductListProps {
  renderItem?: (product: BuyerProduct) => JSX.Element;
  catalogId?: string;
}

const ProductList: FunctionComponent<ProductListProps> = ({ renderItem, catalogId }) => {
  const [products, setProducts] = useState<BuyerProduct[]>();

  const getProducts = useCallback(async () => {
    const result = await Me.ListProducts({
      catalogID: catalogId,
      filters: { "xp.Images": "*", SpecCount: 0 },
    }); // do we need to support specs?
    setProducts(result?.Items);
  }, [catalogId]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
    <>
      <Heading
        as="h1"
        size="xl"
        flexGrow="1"
        color="chakra-placeholder-color"
        textTransform="uppercase"
        fontWeight="300"
        mb={8}
        pb={2}
        borderBottom="1px solid"
        borderColor="chakra-border-color"
      >
        Shop all products
      </Heading>
      <SimpleGrid
        gridTemplateColumns="repeat(auto-fit, minmax(270px, 1fr))"
        spacing={4}
      >
        {products &&
          products?.map((p) => (
            <React.Fragment key={p.ID}>
              {renderItem ? renderItem(p) : <ProductCard product={p} />}
            </React.Fragment>
          ))}
      </SimpleGrid>
    </>
  );
};

export default ProductList;
