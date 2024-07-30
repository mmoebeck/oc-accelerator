/* eslint-disable @typescript-eslint/no-unused-vars */

import { Button, Heading, Image, Link, Text, VStack } from "@chakra-ui/react";

import { Category } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { Link as RouterLink } from "react-router-dom";
import Card from "../../components/shared/card/Card";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: FunctionComponent<CategoryCardProps> = ({ category }) => {
  return (
    <Card variant="">
      <VStack h="full" justifyContent="space-between" p={2} alignSelf="stretch">
        <Image
          src={category.xp?.Images[0]?.ThumbnailUrl}
          aria-label={category.Name}
        ></Image>
        <VStack
          flex="1"
          justifyContent="space-between"
          alignItems="flex-start"
          p={[4, 2, 20, 6]}
        >
          <VStack w="100%" width="full">
            <Heading as="h3" fontSize="lg">
              {category.Name}
            </Heading>
            <Text>{category.Description}</Text>
          </VStack>
          <Link
            as={RouterLink}
            href={`product-lists?categoryid=${category?.ID}`}
          >
            <Button mt="10px" variant={"primaryButton"}>
              View details
            </Button>
          </Link>
        </VStack>
      </VStack>
    </Card>
  );
};

export default CategoryCard;
