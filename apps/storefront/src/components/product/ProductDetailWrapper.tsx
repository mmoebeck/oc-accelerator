import { useParams } from "react-router-dom";
import ProductDetail from "./ProductDetail";

const ProductDetailWrapper = () => {
  const { productId } = useParams<{ productId: string }>();
  console.log("🚀 ~ ProductDetailWrapper ~ productId:", productId);
  return <ProductDetail productId={productId || ""} />;
};

export default ProductDetailWrapper;
