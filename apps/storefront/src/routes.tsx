import { RouteObject } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import { ShoppingCart } from "./components/ShoppingCart";
import { OrderSummary } from "./components/OrderSummary";

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
      {path: '/order-summary', element: <OrderSummary />}
    ],
  },
];

export default routes;
