import { FC, useCallback } from "react";
import routes from "./routes";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { IOrderCloudErrorContext, OrderCloudProvider } from "@rwatt451/ordercloud-react";
import {
  ALLOW_ANONYMOUS,
  BASE_API_URL,
  CLIENT_ID,
  CUSTOM_SCOPE,
  SCOPE,
} from "./constants";
import { useToast } from "@chakra-ui/react";
import { ApiRole, OrderCloudError } from "ordercloud-javascript-sdk";
import GlobalLoadingIndicator from "./components/GlobalLoadingIndicator";
import OcProvider from "./redux/ocProvider";
import { OcConfig } from "./redux/ocConfig";

const basename = import.meta.env.VITE_APP_CONFIG_BASE;

const router = createBrowserRouter(routes, { basename });

const AppProvider: FC = () => {
  const toast = useToast();

  const defaultErrorHandler = useCallback((error: OrderCloudError, {logout}:IOrderCloudErrorContext) => {
    if (error.status === 401) {
      console.log('DEFAULT ERROR HANDLER', 401)
      return logout()
    }
    if (!toast.isActive(error.errorCode)) {
      toast({ id: error.errorCode, title: error.status === 403 ? 'Permission denied' : error.message, status: "error" });
    }
  }, [toast])

  const ocConfig: OcConfig = {
    clientId: '950A1DA4-0505-4433-BA1A-5B6CC6561DC8' /* This is the client ID of your seeded OrderCloud organization  ORDER CLOUD MARKETPLACE */,
    baseApiUrl:
      'https://australiaeast-sandbox.ordercloud.io' /* API Url, leave as is for Sandbox */,
    isPreviewing: true,
    scope:
      ([
        'FullAccess',
        'Shopper',
        'MeAddressAdmin',
        'OrderAdmin',
        'OverrideShipping',
        'SpendingAccountAdmin',
      ] as ApiRole[]) /* Default user role */,
    allowAnonymous: true
  }

  return (
    <OrderCloudProvider
      baseApiUrl={BASE_API_URL}
      clientId={CLIENT_ID}
      scope={SCOPE}
      customScope={CUSTOM_SCOPE}
      allowAnonymous={ALLOW_ANONYMOUS}
      defaultErrorHandler={defaultErrorHandler}
    >
      <OcProvider config={ocConfig}>
      <RouterProvider router={router} />
      </OcProvider>
      <GlobalLoadingIndicator/>
    </OrderCloudProvider>
  );
};

export default AppProvider;
