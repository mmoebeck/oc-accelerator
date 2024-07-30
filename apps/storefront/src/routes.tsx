import { RouteObject } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import { ShoppingCart } from "./components/ShoppingCart";

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
    ],
  },
];

export default routes;
