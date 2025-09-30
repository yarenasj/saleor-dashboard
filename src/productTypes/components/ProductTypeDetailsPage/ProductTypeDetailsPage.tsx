// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Form from "@dashboard/components/Form";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import { ProductTypeDetailsQuery, ProductTypeKindEnum, WeightUnitsEnum } from "@dashboard/graphql";
import { useBackLinkWithState } from "@dashboard/hooks/useBackLinkWithState";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import { maybe } from "@dashboard/misc";
import { productTypeListPath } from "@dashboard/productTypes/urls";
import { ListActions, UserError } from "@dashboard/types";
import React from "react";

import ProductTypeDetails from "../ProductTypeDetails/ProductTypeDetails";
import ProductTypeShipping from "../ProductTypeShipping/ProductTypeShipping";

interface ChoiceType {
  label: string;
  value: string;
}

export interface ProductTypeForm {
  name: string;
  kind: ProductTypeKindEnum;
  hasVariants: boolean;
  isShippingRequired: boolean;
  taxClassId: string;
  productAttributes: ChoiceType[];
  variantAttributes: ChoiceType[];
  weight: number;
}

export interface ProductTypeDetailsPageProps {
  errors: UserError[];
  productType: ProductTypeDetailsQuery["productType"];
  defaultWeightUnit: WeightUnitsEnum;
  disabled: boolean;
  pageTitle: string;
  productAttributeList: ListActions;
  saveButtonBarState: ConfirmButtonTransitionState;
  onDelete: () => void;
  onSubmit: (data: ProductTypeForm) => SubmitPromise;
  setSelectedVariantAttributes: (data: string[]) => void;
  selectedVariantAttributes: string[];
}

const ProductTypeDetailsPage = ({
  defaultWeightUnit,
  disabled,
  errors,
  pageTitle,
  productType,
  saveButtonBarState,
  onDelete,
  onSubmit,
}: ProductTypeDetailsPageProps) => {
  const navigate = useNavigator();
  const productTypeListBackLink = useBackLinkWithState({
    path: productTypeListPath,
  });
  const formInitialData: ProductTypeForm = {
    hasVariants:
      maybe(() => productType.hasVariants) !== undefined ? productType.hasVariants : false,
    isShippingRequired:
      maybe(() => productType.isShippingRequired) !== undefined
        ? productType.isShippingRequired
        : false,
    name: maybe(() => productType.name) !== undefined ? productType.name : "",
    kind: productType?.kind || ProductTypeKindEnum.NORMAL,
    productAttributes:
      maybe(() => productType.productAttributes) !== undefined
        ? productType.productAttributes.map(attribute => ({
            label: attribute.name,
            value: attribute.id,
          }))
        : [],
    taxClassId: productType?.taxClass?.id ?? "",
    variantAttributes:
      maybe(() => productType.variantAttributes) !== undefined
        ? productType.variantAttributes.map(attribute => ({
            label: attribute.name,
            value: attribute.id,
          }))
        : [],
    weight: maybe(() => productType.weight.value),
  };
  const handleSubmit = (data: ProductTypeForm) => {
    return onSubmit({
      ...data,
    });
  };

  return (
    <Form initial={formInitialData} onSubmit={handleSubmit} confirmLeave disabled={disabled}>
      {({ change, data, isSaveDisabled, submit }) => {
        return (
          <DetailPageLayout>
            <TopNav href={productTypeListBackLink} title={pageTitle} />
            <DetailPageLayout.Content>
              <ProductTypeDetails
                data={data}
                disabled={disabled}
                errors={errors}
                onChange={change}
                onKindChange={change}
              />
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <ProductTypeShipping
                disabled={disabled}
                data={data}
                weightUnit={productType?.weight?.unit || defaultWeightUnit}
                onChange={change}
              />
            </DetailPageLayout.RightSidebar>
            <Savebar>
              <Savebar.DeleteButton onClick={onDelete} />
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(productTypeListBackLink)} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled}
              />
            </Savebar>
          </DetailPageLayout>
        );
      }}
    </Form>
  );
};

ProductTypeDetailsPage.displayName = "ProductTypeDetailsPage";
export default ProductTypeDetailsPage;
