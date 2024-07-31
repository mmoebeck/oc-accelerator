/* eslint-disable @typescript-eslint/no-unused-vars */

import { Box, Heading, Text, VStack } from "@chakra-ui/react";

import { LineItem } from "ordercloud-javascript-sdk";
import React, { FunctionComponent, useMemo } from "react";
import OcLineItemCard from "./OcLineItemCard";
import _ from "lodash";

interface OcLineItemListProps {
  emptyMessage?: string;
  editable?: boolean;
  lineItems?: LineItem[];
}

const OcLineItemList: FunctionComponent<OcLineItemListProps> = ({
  emptyMessage,
  editable,
  lineItems,
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
            <Heading as="h4" size="md">
              {brand}
            </Heading>
            <Box padding={5}>
              {lineItems
                ?.filter((li) => li.Product?.xp.Brand == brand)
                .map((li) => (
                  <React.Fragment key={li.ID}>
                    <OcLineItemCard lineItem={li} editable={editable} />
                  </React.Fragment>
                ))}
            </Box>
          </>
        );
      })}
    </VStack>
  ) : (
    <Text alignSelf="flex-start">{emptyMessage}</Text>
  );
};

export default OcLineItemList;
