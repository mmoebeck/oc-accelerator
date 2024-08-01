import { SimpleGrid } from "@chakra-ui/react";
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
}

const ProductList: FunctionComponent<ProductListProps> = ({ renderItem }) => {
  const [products, setProducts] = useState<BuyerProduct[]>();

  const getProducts = useCallback(async () => {
    const result = await Me.ListProducts({
      filters: { "xp.Images": "*", SpecCount: 0, "xp.Brand": "*" },
    }); // do we need to support specs?
    setProducts(result?.Items);
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
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
  );
};

export default ProductList;
