// @ts-strict-ignore
import {
  DatagridChangeOpts,
  DatagridChangeStateContext,
  useDatagridChangeState,
} from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import { useExitFormDialog } from "@dashboard/components/Form/useExitFormDialog";
import { ProductFragment } from "@dashboard/graphql";
import useForm from "@dashboard/hooks/useForm";
import useHandleFormSubmit from "@dashboard/hooks/useHandleFormSubmit";
import useLocale from "@dashboard/hooks/useLocale";
import { getProductUpdatePageFormData } from "@dashboard/products/utils/data";
import { PRODUCT_UPDATE_FORM_ID } from "@dashboard/products/views/ProductUpdate/consts";
import createMultiselectChangeHandler from "@dashboard/utils/handlers/multiselectChangeHandler";
import createSingleAutocompleteSelectHandler from "@dashboard/utils/handlers/singleAutocompleteSelectChangeHandler";
import { RichTextContext } from "@dashboard/utils/richText/context";
import useRichText from "@dashboard/utils/richText/useRichText";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useProductChannelListingsForm } from "./formChannels";
import {
  ProductUpdateData,
  ProductUpdateFormProps,
  ProductUpdateSubmitData,
  SubmitResult,
  UseProductUpdateFormOpts,
  UseProductUpdateFormOutput,
} from "./types";
import { prepareVariantChangeData } from "./utils";

export function useProductUpdateForm(
  product: ProductFragment,
  onSubmit: (data: ProductUpdateSubmitData) => SubmitResult,
  disabled: boolean,
  refetch: () => Promise<any>,
  opts: UseProductUpdateFormOpts,
): UseProductUpdateFormOutput {
  const initial = useMemo(
    () => getProductUpdatePageFormData(product, product?.variants),
    [product],
  );
  const form = useForm(initial, undefined, {
    confirmLeave: true,
    formId: PRODUCT_UPDATE_FORM_ID,
  });
  const {
    handleChange,
    triggerChange,
    toggleValues,
    data: formData,
    setIsSubmitDisabled,
    cleanChanged,
  } = form;
  const { locale } = useLocale();
  const datagrid = useDatagridChangeState();
  const variants = useRef<DatagridChangeOpts>({
    added: [],
    removed: [],
    updates: [],
  });
  const handleVariantChange = React.useCallback(
    (data: DatagridChangeOpts) => {
      variants.current = prepareVariantChangeData(data, locale, product);
      triggerChange();
    },
    [locale, product, triggerChange],
  );
  const richText = useRichText({
    initial: product?.description,
    loading: !product,
    triggerChange,
  });
  const { setExitDialogSubmitRef } = useExitFormDialog({
    formId: PRODUCT_UPDATE_FORM_ID,
  });
  const {
    channels,
    handleChannelChange,
    handleChannelListUpdate,
    touched: touchedChannels,
  } = useProductChannelListingsForm(product, triggerChange);
  const handleCollectionSelect = createMultiselectChangeHandler(
    toggleValues,
    opts.setSelectedCollections,
  );
  const handleCategorySelect = createSingleAutocompleteSelectHandler(
    handleChange,
    opts.setSelectedCategory,
    opts.categories,
  );
  const data: ProductUpdateData = {
    ...formData,
    channels,
    description: null,
  };
  const getSubmitData = async (): Promise<ProductUpdateSubmitData> => ({
    ...form.changedData,
    channels: {
      ...channels,
      updateChannels: channels.updateChannels.filter(listing =>
        touchedChannels.current.includes(listing.channelId),
      ),
    },
    description: richText.isDirty ? await richText.getValue() : undefined,
    variants: variants.current,
  });
  const handleSubmit = async (data: ProductUpdateSubmitData) => {
    return await onSubmit(data);
  };
  const handleFormSubmit = useHandleFormSubmit({
    formId: form.formId,
    onSubmit: handleSubmit,
  });
  const submit = useCallback(async () => {
    const result = await handleFormSubmit(await getSubmitData());

    cleanChanged();
    await refetch();
    datagrid.setAdded(prevAdded =>
      prevAdded.filter((_, index) =>
        result.some(
          error =>
            error.__typename === "DatagridError" &&
            error.type === "create" &&
            error.index === index,
        ),
      ),
    );
    datagrid.changes.current = datagrid.changes.current.filter(change =>
      datagrid.added.includes(change.row)
        ? result.some(
            error =>
              error.__typename === "DatagridError" &&
              error.type === "create" &&
              error.index === datagrid.added.findIndex(r => r === change.row),
          )
        : result.some(
            error =>
              error.__typename === "DatagridError" &&
              error.type !== "create" &&
              error.variantId === product.variants[change.row].id,
          ),
    );
    datagrid.setRemoved([]);
    variants.current = {
      added: [],
      removed: [],
      updates: [],
    };

    return result;
  }, [datagrid, handleFormSubmit, getSubmitData]);

  useEffect(() => setExitDialogSubmitRef(submit), [submit]);

  const isValid = () => {
    if (!data.name) {
      return false;
    }

    if (data.isPreorder && data.hasPreorderEndDate && !!form.errors.preorderEndDateTime) {
      return false;
    }

    return true;
  };
  const isSaveDisabled = disabled;
  const isSubmitDisabled = isSaveDisabled || !isValid();

  useEffect(() => {
    setIsSubmitDisabled(isSubmitDisabled);
  }, [isSubmitDisabled]);

  return {
    change: handleChange,
    data,
    datagrid,
    formErrors: form.errors,
    handlers: {
      changeChannels: handleChannelChange,
      changeMetadata: {} as any,
      changeVariants: handleVariantChange,
      selectCategory: handleCategorySelect,
      selectCollection: handleCollectionSelect,
      updateChannelList: handleChannelListUpdate,
    },
    submit,
    isSaveDisabled,
    richText,
  };
}

const ProductUpdateForm = ({
  children,
  product,
  onSubmit,
  refetch,
  disabled,
  ...rest
}: ProductUpdateFormProps) => {
  const { datagrid, richText, ...props } = useProductUpdateForm(
    product,
    onSubmit,
    disabled,
    refetch,
    rest,
  );

  return (
    <form onSubmit={props.submit} data-test-id="product-update-form">
      <DatagridChangeStateContext.Provider value={datagrid}>
        <RichTextContext.Provider value={richText}>{children(props)}</RichTextContext.Provider>
      </DatagridChangeStateContext.Provider>
    </form>
  );
};

ProductUpdateForm.displayName = "ProductUpdateForm";
export default ProductUpdateForm;
