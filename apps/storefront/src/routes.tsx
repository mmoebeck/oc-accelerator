import { RouteObject } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import { ShoppingCart } from "./components/cart/ShoppingCart";
import { OrderSummary } from "./components/cart/OrderSummary";
import ProductList from "./components/product/ProductList";
import ProductDetailWrapper from "./components/product/ProductDetailWrapper";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/cart",
        element: <ShoppingCart />,
      },
      { path: "/order-summary", element: <OrderSummary /> },
      {
        path: "/products",
        element: <ProductList />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetailWrapper />,
      },
    ],
  },
];

export default routes;
