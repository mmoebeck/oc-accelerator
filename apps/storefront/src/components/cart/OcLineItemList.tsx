/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, CardBody, Text, VStack } from "@chakra-ui/react";
import { LineItem } from "ordercloud-javascript-sdk";
import React, { FunctionComponent, useMemo } from "react";
import { BunningsLogo, CatchLogo } from "../../../public/Icons";
import OcLineItemCard from "./OcLineItemCard";

interface OcLineItemListProps {
  emptyMessage?: string;
  editable?: boolean;
  lineItems?: LineItem[];
  onChange: (newLineItem: LineItem) => void;
}

const brandLogoMap: { [key: string]: FunctionComponent } = {
  bunnings: BunningsLogo,
  catch: CatchLogo,
  //TODO: Add the rest of their brands later (i have them somewhere in a branch from a previous demo)
};

const OcLineItemList: FunctionComponent<OcLineItemListProps> = ({
  emptyMessage,
  editable,
  lineItems,
  onChange,
}) => {
  const brands = useMemo(() => {
    return lineItems
      ?.map((item) => item.Product?.DefaultSupplierID)
      .filter((value, index, self) => value && self.indexOf(value) === index);
  }, [lineItems]);

  return lineItems && lineItems.length ? (
    <VStack gap={6} alignItems="flex-start" w="full">
      {brands?.map((brand) => {
        const DefaultSupplierIDLogo = brandLogoMap[brand] || null;
        return (
          <React.Fragment key={brand}>
            {DefaultSupplierIDLogo ? <DefaultSupplierIDLogo h="50px" /> : brand}
            <Card variant="outline" w="full" mt={-4} rounded="none">
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
