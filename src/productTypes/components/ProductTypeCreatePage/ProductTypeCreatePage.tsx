// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Form from "@dashboard/components/Form";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import { ProductTypeKindEnum, WeightUnitsEnum } from "@dashboard/graphql";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import { makeProductTypeKindChangeHandler } from "@dashboard/productTypes/handlers";
import { productTypeListUrl } from "@dashboard/productTypes/urls";
import { UserError } from "@dashboard/types";
import React from "react";

import ProductTypeDetails from "../ProductTypeDetails/ProductTypeDetails";
import ProductTypeShipping from "../ProductTypeShipping/ProductTypeShipping";

export interface ProductTypeForm {
  name: string;
  kind: ProductTypeKindEnum;
  isShippingRequired: boolean;
  taxClassId: string;
  weight: number;
}

export interface ProductTypeCreatePageProps {
  errors: UserError[];
  defaultWeightUnit: WeightUnitsEnum;
  disabled: boolean;
  pageTitle: string;
  saveButtonBarState: ConfirmButtonTransitionState;
  kind: ProductTypeKindEnum;
  onChangeKind: (kind: ProductTypeKindEnum) => void;
  onSubmit: (data: ProductTypeForm) => SubmitPromise<any[]>;
}

const formInitialData: ProductTypeForm = {
  isShippingRequired: false,
  name: "",
  kind: ProductTypeKindEnum.NORMAL,
  taxClassId: "",
  weight: 0,
};
const ProductTypeCreatePage = ({
  defaultWeightUnit,
  disabled,
  errors,
  pageTitle,
  saveButtonBarState,
  kind,
  onChangeKind,
  onSubmit,
}: ProductTypeCreatePageProps) => {
  const navigate = useNavigator();
  const initialData = {
    ...formInitialData,
    kind: kind || formInitialData.kind,
  };

  return (
    <Form confirmLeave initial={initialData} onSubmit={onSubmit} disabled={disabled}>
      {({ change, data, isSaveDisabled, submit }) => {
        const changeKind = makeProductTypeKindChangeHandler(change, onChangeKind);

        return (
          <DetailPageLayout>
            <TopNav href={productTypeListUrl()} title={pageTitle} />
            <DetailPageLayout.Content>
              <ProductTypeDetails
                data={data}
                disabled={disabled}
                errors={errors}
                onChange={change}
                onKindChange={changeKind}
              />
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <ProductTypeShipping
                disabled={disabled}
                data={data}
                weightUnit={defaultWeightUnit}
                onChange={change}
              />
            </DetailPageLayout.RightSidebar>
            <Savebar>
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(productTypeListUrl())} />
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

ProductTypeCreatePage.displayName = "ProductTypeCreatePage";
export default ProductTypeCreatePage;
