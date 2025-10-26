// @ts-strict-ignore
import { Button } from "@dashboard/components/Button";
import NotFoundPage from "@dashboard/components/NotFoundPage";
import TypeDeleteWarningDialog from "@dashboard/components/TypeDeleteWarningDialog";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import {
  AssignProductAttributeMutation,
  ProductTypeAttributeReorderMutation,
  ProductTypeDeleteMutation,
  UnassignProductAttributeMutation,
  useProductAttributeAssignmentUpdateMutation,
  useProductTypeDetailsQuery,
  useProductTypeUpdateMutation,
} from "@dashboard/graphql";
import useBulkActions from "@dashboard/hooks/useBulkActions";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import { commonMessages } from "@dashboard/intl";
import { maybe } from "@dashboard/misc";
import useProductTypeDelete from "@dashboard/productTypes/hooks/useProductTypeDelete";
import useProductTypeOperations from "@dashboard/productTypes/hooks/useProductTypeOperations";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import ProductTypeDetailsPage, { ProductTypeForm } from "../../components/ProductTypeDetailsPage";
import { productTypeListUrl, productTypeUrl, ProductTypeUrlQueryParams } from "../../urls";

interface ProductTypeUpdateProps {
  id: string;
  params: ProductTypeUrlQueryParams;
}

export const ProductTypeUpdate = ({ id, params }: ProductTypeUpdateProps) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const productAttributeListActions = useBulkActions();
  const variantAttributeListActions = useBulkActions();
  const intl = useIntl();
  const [errors, setErrors] = React.useState({
    addAttributeErrors: [],
    editAttributeErrors: [],
    formErrors: [],
  });
  const [updateProductType, updateProductTypeOpts] = useProductTypeUpdateMutation({
    onCompleted: updateData => {
      if (
        !updateData.productTypeUpdate.errors ||
        updateData.productTypeUpdate.errors.length === 0
      ) {
        notify({
          status: "success",
          text: intl.formatMessage(commonMessages.savedChanges),
        });
      } else if (
        updateData.productTypeUpdate.errors !== null &&
        updateData.productTypeUpdate.errors.length > 0
      ) {
        setErrors(prevErrors => ({
          ...prevErrors,
          formErrors: updateData.productTypeUpdate.errors,
        }));
      }
    },
  });
  const [updateProductAttributes, updateProductAttributesOpts] =
    useProductAttributeAssignmentUpdateMutation({
      onCompleted: updateData => {
        if (
          updateData.productAttributeAssignmentUpdate.errors !== null &&
          updateData.productAttributeAssignmentUpdate.errors.length > 0
        ) {
          setErrors(prevErrors => ({
            ...prevErrors,
            formErrors: updateData.productAttributeAssignmentUpdate.errors,
          }));
        }
      },
    });
  const [selectedVariantAttributes, setSelectedVariantAttributes] = React.useState<string[]>([]);
  const handleProductTypeUpdate = async (formData: ProductTypeForm) => {
    const operations = formData.variantAttributes.map(variantAttribute => ({
      id: variantAttribute.value,
      variantSelection: selectedVariantAttributes.includes(variantAttribute.value),
    }));
    const productAttributeUpdateResult = await updateProductAttributes({
      variables: {
        productTypeId: id,
        operations,
      },
    });
    const result = await updateProductType({
      variables: {
        id,
        input: {
          hasVariants: formData.hasVariants,
          isShippingRequired: formData.isShippingRequired,
          name: formData.name,
          kind: formData.kind,
          productAttributes: formData.productAttributes.map(choice => choice.value),
          taxClass: formData.taxClassId,
          variantAttributes: formData.variantAttributes.map(choice => choice.value),
          weight: formData.weight,
        },
      },
    });

    return [
      ...result.data.productTypeUpdate.errors,
      ...productAttributeUpdateResult.data.productAttributeAssignmentUpdate.errors,
    ];
  };
  const { data, loading: dataLoading } = useProductTypeDetailsQuery({
    displayLoader: true,
    variables: { id },
  });
  const productType = data?.productType;

  const productTypeDeleteData = useProductTypeDelete({
    singleId: id,
    params,
    typeBaseData: productType ? [productType] : undefined,
  });
  const closeModal = () => navigate(productTypeUrl(id), { replace: true });
  const handleAttributeAssignSuccess = (data: AssignProductAttributeMutation) => {
    if (data.productAttributeAssign.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges),
      });
      closeModal();
    } else if (
      data.productAttributeAssign.errors !== null &&
      data.productAttributeAssign.errors.length > 0
    ) {
      setErrors(prevErrors => ({
        ...prevErrors,
        addAttributeErrors: data.productAttributeAssign.errors,
      }));
    }
  };
  const handleAttributeUnassignSuccess = (data: UnassignProductAttributeMutation) => {
    if (data.productAttributeUnassign.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges),
      });
      closeModal();
      productAttributeListActions.reset();
      variantAttributeListActions.reset();
    }
  };
  const handleProductTypeDeleteSuccess = (deleteData: ProductTypeDeleteMutation) => {
    if (deleteData.productTypeDelete.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage({
          id: "F3Upht",
          defaultMessage: "Product type deleted",
        }),
      });
      navigate(productTypeListUrl(), { replace: true });
    }
  };
  const handleAttributeReorderSuccess = (data: ProductTypeAttributeReorderMutation) => {
    if (data.productTypeReorderAttributes.errors.length === 0) {
      notify({
        status: "success",
        text: intl.formatMessage(commonMessages.savedChanges),
      });
    }
  };
  const { deleteProductType } = useProductTypeOperations({
    onAssignAttribute: handleAttributeAssignSuccess,
    onProductTypeAttributeReorder: handleAttributeReorderSuccess,
    onProductTypeDelete: handleProductTypeDeleteSuccess,
    onUnassignAttribute: handleAttributeUnassignSuccess,
    productType: data?.productType,
  });
  const handleProductTypeDelete = () => deleteProductType.mutate({ id });
  const handleProductTypeVariantsToggle = (hasVariants: boolean) =>
    updateProductType({
      variables: {
        id,
        input: {
          hasVariants,
        },
      },
    });
  const loading =
    updateProductTypeOpts.loading || updateProductAttributesOpts.loading || dataLoading;

  if (productType === null) {
    return <NotFoundPage backHref={productTypeListUrl()} />;
  }

  return (
    <>
      <WindowTitle title={maybe(() => data.productType.name)} />
      <ProductTypeDetailsPage
        defaultWeightUnit={maybe(() => data.shop.defaultWeightUnit)}
        disabled={loading}
        errors={errors.formErrors}
        pageTitle={maybe(() => data.productType.name)}
        productType={maybe(() => data.productType)}
        saveButtonBarState={updateProductTypeOpts.status || updateProductAttributesOpts.status}
        selectedVariantAttributes={selectedVariantAttributes}
        setSelectedVariantAttributes={setSelectedVariantAttributes}
        onDelete={() =>
          navigate(
            productTypeUrl(id, {
              action: "remove",
            }),
          )
        }
        onHasVariantsToggle={handleProductTypeVariantsToggle}
        onSubmit={handleProductTypeUpdate}
        productAttributeList={{
          isChecked: productAttributeListActions.isSelected,
          selected: productAttributeListActions.listElements.length,
          toggle: productAttributeListActions.toggle,
          toggleAll: productAttributeListActions.toggleAll,
          toolbar: (
            <Button
              onClick={() =>
                navigate(
                  productTypeUrl(id, {
                    action: "unassign-product-attributes",
                  }),
                )
              }
            >
              <FormattedMessage
                id="S7j+Wf"
                defaultMessage="Unassign"
                description="unassign attribute from product type, button"
              />
            </Button>
          ),
        }}
      />
      {!dataLoading && (
        <>
          {productType && (
            <TypeDeleteWarningDialog
              {...productTypeDeleteData}
              typesData={[productType]}
              typesToDelete={[id]}
              onClose={closeModal}
              onDelete={handleProductTypeDelete}
              deleteButtonState={deleteProductType.opts.status}
            />
          )}
        </>
      )}
    </>
  );
};
export default ProductTypeUpdate;
