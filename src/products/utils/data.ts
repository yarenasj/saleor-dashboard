// @ts-strict-ignore
import {
  ProductDetailsVariantFragment,
  ProductFragment,
  ProductMediaFragment,
  ProductTypeQuery,
  ProductVariantFragment,
  StockInput,
} from "@dashboard/graphql";
import { FormsetAtomicData } from "@dashboard/hooks/useFormset";
import { maybe } from "@dashboard/misc";
import { Option } from "@saleor/macaw-ui-next";
import moment from "moment";

import { ProductStockInput } from "../components/ProductStocks";
import { ProductUpdateFormData } from "../components/ProductUpdatePage/types";

export interface Collection {
  id: string;
  label: string;
}

interface Node {
  id: string;
  name: string;
}

export interface ProductType {
  hasVariants: boolean;
  id: string;
  name: string;
  productAttributes: ProductTypeQuery["productType"]["productAttributes"];
}

export interface AttributeValuesMetadata {
  value: string;
  label: string;
}

export function getStockInputFromVariant(variant: ProductVariantFragment): ProductStockInput[] {
  return (
    variant?.stocks.map(stock => ({
      data: {
        quantityAllocated: stock.quantityAllocated,
      },
      id: stock.warehouse.id,
      label: stock.warehouse.name,
      value: stock.quantity.toString(),
    })) || []
  );
}

export function getCollectionInput(
  productCollections: ProductFragment["collections"],
): Collection[] {
  return maybe(
    () =>
      productCollections.map(collection => ({
        id: collection.id,
        label: collection.name,
      })),
    [],
  );
}

export function getChoices(nodes: Node[]): Option[] {
  return maybe(
    () =>
      nodes.map(node => ({
        label: node.name,
        value: node.id,
      })),
    [],
  );
}

export function getProductUpdatePageFormData(
  product: ProductFragment,
  variants: ProductDetailsVariantFragment[],
): ProductUpdateFormData {
  const variant = product?.variants[0];

  return {
    category: maybe(() => product.category.id, ""),
    taxClassId: product?.taxClass?.id,
    collections: maybe(
      () =>
        product.collections.map(collection => ({
          label: collection.name,
          value: collection.id,
        })),
      [],
    ),
    isAvailable: !!product?.isAvailable,
    name: maybe(() => product.name, ""),
    rating: maybe(() => product.rating, null),
    seoDescription: maybe(() => product.seoDescription, ""),
    seoTitle: maybe(() => product.seoTitle, ""),
    sku: maybe(
      () =>
        product.productType.hasVariants
          ? undefined
          : variants && variants[0]
            ? variants[0].sku
            : undefined,
      "",
    ),
    slug: product?.slug || "",
    trackInventory: !!variant?.trackInventory,
    weight: product?.weight?.value.toString() || "",
    isPreorder: !!variant?.preorder || false,
    globalThreshold: variant?.preorder?.globalThreshold?.toString() || "",
    globalSoldUnits: variant?.preorder?.globalSoldUnits || 0,
    hasPreorderEndDate: !!variant?.preorder?.endDate,
    preorderEndDateTime: variant?.preorder?.endDate,
  };
}

export function mapFormsetStockToStockInput(stock: FormsetAtomicData<null, string>): StockInput {
  return {
    quantity: parseInt(stock.value, 10) || 0,
    warehouse: stock.id,
  };
}

export const getPreorderEndDateFormData = (endDate?: string) =>
  endDate ? moment(endDate).format("YYYY-MM-DD") : "";

export const getPreorderEndHourFormData = (endDate?: string) =>
  endDate ? moment(endDate).format("HH:mm") : "";

export const getSelectedMedia = <T extends Pick<ProductMediaFragment, "id" | "sortOrder">>(
  media: T[] = [],
  selectedMediaIds: string[],
) =>
  media
    .filter(image => selectedMediaIds.includes(image.id))
    .sort((prev, next) => (prev.sortOrder > next.sortOrder ? 1 : -1));
