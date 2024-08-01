/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Card,
  CardBody,
  ComponentWithAs,
  IconProps,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LineItem } from "ordercloud-javascript-sdk";
import React, { FunctionComponent, useMemo } from "react";
import { BunningsLogo, CatchLogo } from "../../assets/Icons";
import OcLineItemCard from "./OcLineItemCard";

interface OcLineItemListProps {
  emptyMessage?: string;
  editable?: boolean;
  lineItems?: LineItem[];
  onChange: (newLineItem: LineItem) => void;
}

const brandLogoMap: { [key: string]: ComponentWithAs<"svg", IconProps> } = {
  bunnings: BunningsLogo,
  catch_supplier: CatchLogo,
  //TODO: Add the rest of their brands later (i have them somewhere in a branch from a previous demo)
};

const OcLineItemList: FunctionComponent<OcLineItemListProps> = ({
  emptyMessage,
  editable,
  lineItems,
  onChange,
}) => {
  const brands: string[] = useMemo(() => {
    const supplierIDs = lineItems
      ?.map((item) => item.Product?.DefaultSupplierID)
      .filter((id): id is string => !!id);

    return Array.from(new Set(supplierIDs));
  }, [lineItems]);

  return lineItems && lineItems.length ? (
    <VStack gap={6} alignItems="flex-start" w="full">
      {brands?.map((brand) => {
        const DefaultSupplierIDLogo = brandLogoMap[brand] || null;
        return (
          <React.Fragment key={brand}>
            {DefaultSupplierIDLogo ? <DefaultSupplierIDLogo h="50px" /> : brand}
            <Card
              variant="outline"
              w="full"
              mt={-4}
              rounded="none"
              bgColor="blackAlpha.100"
              borderColor="transparent"
            >
              <CardBody display="flex" flexDirection="column" gap={2}>
                {lineItems
                  ?.filter((li) => li.Product?.DefaultSupplierID === brand)
                  .map((li, idx) => (
                    <OcLineItemCard
                      key={idx}
                      lineItem={li}
                      editable={editable}
                      onChange={onChange}
                    />
                  ))}
              </CardBody>
            </Card>
          </React.Fragment>
        );
      })}
    </VStack>
  ) : (
    <Text alignSelf="flex-start">{emptyMessage}</Text>
  );
};

export default OcLineItemList;
