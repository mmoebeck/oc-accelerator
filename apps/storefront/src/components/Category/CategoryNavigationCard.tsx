/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, CardHeader, Link } from "@chakra-ui/react";
import { Category } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { Link as RouterLink } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: FunctionComponent<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      as={RouterLink}
      to={`product-lists?categoryid=${category?.ID}`}
      _hover={{ textDecoration: "none" }}
    >
      <Card
        mt="3"
        aspectRatio="2 / 1"
        variant="elevated"
        layerStyle="interactive.raise"
        // bgGradient="linear(120deg, primary.800, teal.800)"
        bgColor="primary.500"
        justifyContent="flex-end"
      >
        <CardHeader
          alignSelf="flex-end"
          fontSize="xl"
          fontWeight="600"
          color="whiteAlpha.900"
        >
          {category.Name && category?.Name.replace(/([A-Z])/g, " $1")}
        </CardHeader>
      </Card>
    </Link>
  );
};

export default CategoryCard;
