/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Card, CardBody, Heading, Text, VStack } from "@chakra-ui/react";

import { LineItem } from "ordercloud-javascript-sdk";
import React, { FunctionComponent, useMemo } from "react";
import OcLineItemCard from "./OcLineItemCard";
import _ from "lodash";

interface OcLineItemListProps {
  emptyMessage?: string;
  editable?: boolean;
  lineItems?: LineItem[];
  onChange: (liIndex:number) => (newLineItem:LineItem) => void
}

const OcLineItemList: FunctionComponent<OcLineItemListProps> = ({
  emptyMessage,
  editable,
  lineItems,
  onChange,
}) => {
  const brands = useMemo(() => {
    return lineItems
      ?.map((item) => item.Product?.xp?.Brand)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [lineItems]);

  return lineItems && lineItems.length ? (
    <VStack gap={6} alignItems="flex-start" w="full">
      {brands?.map((brand) => {
        return (
          <>
            <Heading size="sm">{brand}</Heading>
            <Card variant="outline" w="full" mt={-4} rounded="none">
              <CardBody>
                {lineItems
                  ?.filter((li) => li.Product?.xp.Brand == brand)
                  .map((li, i) => (
                    <React.Fragment key={li.ID}>
                      <OcLineItemCard lineItem={li} editable={editable} onChange={onChange(i)}/>
                    </React.Fragment>
                  ))}
              </CardBody>
            </Card>
          </>
        );
      })}
    </VStack>
  ) : (
    <Text alignSelf="flex-start">{emptyMessage}</Text>
  );
};

export default OcLineItemList;
