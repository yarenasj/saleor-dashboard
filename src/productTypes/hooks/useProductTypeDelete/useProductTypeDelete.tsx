import { TypeBaseData } from "@dashboard/components/TypeDeleteWarningDialog/types";
import {
  ProductTypeBaseData,
  useViewProducts,
} from "@dashboard/components/TypeDeleteWarningDialog/useViewProducts";
import { ProductCountQueryVariables, useProductCountQuery } from "@dashboard/graphql";
import {
  ProductTypeListUrlQueryParams,
  ProductTypeUrlQueryParams,
} from "@dashboard/productTypes/urls";
import { Ids } from "@dashboard/types";
import { useMemo } from "react";

import * as messages from "./messages";

export interface UseTypeDeleteProps<T> {
  params: T;
  selectedTypes?: Ids;
  singleId?: string;
}

type UseProductTypeDeleteProps<T = ProductTypeListUrlQueryParams | ProductTypeUrlQueryParams> =
  UseTypeDeleteProps<T> & { typeBaseData: ProductTypeBaseData[] | undefined };

function useProductTypeDelete({
  params,
  singleId,
  selectedTypes,
  typeBaseData,
}: UseProductTypeDeleteProps): any {
  const productTypes = useMemo(() => selectedTypes || [singleId], [selectedTypes, singleId]);

  const filteredTypes = productTypes.filter((type): type is string => !!type);

  const isDeleteDialogOpen = params.action === "remove";
  const productsAssignedToSelectedTypesQueryVars = useMemo<ProductCountQueryVariables>(
    () =>
      filteredTypes.length
        ? {
            filter: {
              productTypes: filteredTypes,
            },
          }
        : {},
    [productTypes],
  );
  const shouldSkipProductListQuery = !productTypes.length || !isDeleteDialogOpen;
  const {
    data: productsAssignedToSelectedTypesData,
    loading: loadingProductsAssignedToSelectedTypes,
  } = useProductCountQuery({
    variables: productsAssignedToSelectedTypesQueryVars,
    skip: shouldSkipProductListQuery,
  });

  const typesToLink = Array.isArray(typeBaseData)
    ? typeBaseData.filter((type: TypeBaseData) => productTypes.includes(type.id))
    : undefined;

  const viewProductsURL = useViewProducts({
    productTypeBaseData: typesToLink,
  });

  const assignedItemsCount = productsAssignedToSelectedTypesData?.products?.totalCount;

  return {
    ...messages,
    isOpen: isDeleteDialogOpen,
    assignedItemsCount: assignedItemsCount ?? undefined,
    viewAssignedItemsUrl: viewProductsURL,
    isLoading: loadingProductsAssignedToSelectedTypes,
    typesToDelete: filteredTypes,
  };
}

export default useProductTypeDelete;
