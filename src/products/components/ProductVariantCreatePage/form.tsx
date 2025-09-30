// @ts-strict-ignore
import {
  ChannelPriceAndPreorderData,
  IChannelPriceAndPreorderArgs,
} from "@dashboard/channels/utils";
import { useExitFormDialog } from "@dashboard/components/Form/useExitFormDialog";
import {
  ProductErrorWithAttributesFragment,
  ProductVariantCreateDataQuery,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
} from "@dashboard/graphql";
import useForm, {
  CommonUseFormResultWithHandlers,
  FormChange,
  FormErrors,
  SubmitPromise,
} from "@dashboard/hooks/useForm";
import useFormset, { FormsetChange, FormsetData } from "@dashboard/hooks/useFormset";
import useHandleFormSubmit from "@dashboard/hooks/useHandleFormSubmit";
import { errorMessages } from "@dashboard/intl";
import {
  createPreorderEndDateChangeHandler,
  getChannelsInput,
} from "@dashboard/products/utils/handlers";
import { validateProductVariant } from "@dashboard/products/utils/validation";
import { FetchMoreProps, RelayToFlat } from "@dashboard/types";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { ProductStockFormsetData, ProductStockInput } from "../ProductStocks";
import {
  concatChannelsBySelection,
  createChannelsWithPreorderInfo,
} from "../ProductVariantChannels/formOpretations";

export interface ProductVariantCreateFormData {
  sku: string;
  trackInventory: boolean;
  weight: string;
  isPreorder: boolean;
  globalThreshold: string;
  globalSoldUnits: number;
  hasPreorderEndDate: boolean;
  quantityLimitPerCustomer: number | null;
  preorderEndDateTime?: string;
  variantName: string;
}
export interface ProductVariantCreateData extends ProductVariantCreateFormData {
  stocks: ProductStockInput[];
  channelListings: FormsetData<ChannelPriceAndPreorderData, IChannelPriceAndPreorderArgs>;
}

export interface UseProductVariantCreateFormOpts {
  referencePages: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCategories?: RelayToFlat<SearchCategoriesQuery["search"]>;
  referenceCollections?: RelayToFlat<SearchCollectionsQuery["search"]>;
  fetchReferencePages?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchReferenceProducts?: (data: string) => void;
  fetchMoreReferenceProducts?: FetchMoreProps;
  assignReferencesAttributeId?: string;
}

export interface ProductVariantCreateHandlers
  extends Record<"changeStock" | "changeChannels", FormsetChange>,
    Record<"addStock", (id: string, label: string) => void>,
    Record<"deleteStock", (id: string) => void> {
  changeMetadata: FormChange;
  updateChannels: (selectedChannelsIds: string[]) => void;
  changePreorderEndDate: FormChange;
}

export interface UseProductVariantCreateFormOutput
  extends CommonUseFormResultWithHandlers<ProductVariantCreateData, ProductVariantCreateHandlers> {
  formErrors: FormErrors<ProductVariantCreateData>;
  validationErrors: ProductErrorWithAttributesFragment[];
  disabled: boolean;
}

export interface ProductVariantCreateFormProps extends UseProductVariantCreateFormOpts {
  children: (props: UseProductVariantCreateFormOutput) => React.ReactNode;
  product: ProductVariantCreateDataQuery["product"];
  onSubmit: (data: ProductVariantCreateData) => SubmitPromise;
  disabled: boolean;
}

const initial: ProductVariantCreateFormData = {
  sku: "",
  trackInventory: true,
  weight: "",
  isPreorder: false,
  globalThreshold: null,
  globalSoldUnits: 0,
  hasPreorderEndDate: false,
  preorderEndDateTime: "",
  quantityLimitPerCustomer: null,
  variantName: "",
};

function useProductVariantCreateForm(
  product: ProductVariantCreateDataQuery["product"],
  onSubmit: (data: ProductVariantCreateData) => SubmitPromise,
  disabled: boolean,
): UseProductVariantCreateFormOutput {
  const intl = useIntl();
  const [validationErrors, setValidationErrors] = useState<ProductErrorWithAttributesFragment[]>(
    [],
  );
  const form = useForm(initial, undefined, { confirmLeave: true });
  const { triggerChange, handleChange, data: formData, formId, setIsSubmitDisabled } = form;
  const currentChannelsWithPreorderInfo = createChannelsWithPreorderInfo(product);
  const channelsInput = getChannelsInput(currentChannelsWithPreorderInfo);
  const channels = useFormset(channelsInput);
  const stocks = useFormset<ProductStockFormsetData, string>([]);
  const { setExitDialogSubmitRef } = useExitFormDialog({
    formId,
  });
  const handleStockAdd = (id: string, label: string) => {
    triggerChange();
    stocks.add({
      data: {
        quantityAllocated: 0,
      },
      id,
      label,
      value: "0",
    });
  };
  const handleStockChange = (id: string, value: string) => {
    triggerChange();
    stocks.change(id, value);
  };
  const handleStockDelete = (id: string) => {
    triggerChange();
    stocks.remove(id);
  };
  const handlePreorderEndDateChange = createPreorderEndDateChangeHandler(
    form,
    triggerChange,
    intl.formatMessage(errorMessages.preorderEndDateInFutureErrorText),
  );
  const handleChannelChange: FormsetChange = (id, value) => {
    channels.change(id, value);
    triggerChange();
  };
  const handleUpdateChannels = (selectedIds: string[]) => {
    channels.set(concatChannelsBySelection(selectedIds, channels, currentChannelsWithPreorderInfo));
    triggerChange();
  };
  const data: ProductVariantCreateData = {
    ...formData,
    stocks: stocks.data,
    channelListings: channels.data,
  };
  const getSubmitData = async (): Promise<ProductVariantCreateData> => ({
    ...data,
  });
  const handleSubmit = async (data: ProductVariantCreateData) => {
    const validationProductErrors = validateProductVariant(data, intl);

    setValidationErrors(validationProductErrors);

    if (validationProductErrors.length > 0) {
      return validationProductErrors;
    }

    return onSubmit(data);
  };
  const handleFormSubmit = useHandleFormSubmit({
    formId,
    onSubmit: handleSubmit,
  });
  const submit = async () => handleFormSubmit(await getSubmitData());

  useEffect(() => setExitDialogSubmitRef(submit), [submit]);

  const invalidPreorder =
    data.isPreorder && data.hasPreorderEndDate && !!form.errors.preorderEndDateTime;
  const isSaveDisabled = disabled || invalidPreorder || !onSubmit;

  setIsSubmitDisabled(isSaveDisabled);

  return {
    change: handleChange,
    data,
    disabled,
    formErrors: form.errors,
    validationErrors,
    handlers: {
      addStock: handleStockAdd,
      changeChannels: handleChannelChange,
      updateChannels: handleUpdateChannels,
      changeMetadata: {} as any,
      changeStock: handleStockChange,
      changePreorderEndDate: handlePreorderEndDateChange,
      deleteStock: handleStockDelete,
    },
    submit,
    isSaveDisabled,
  };
}

const ProductVariantCreateForm = ({
  children,
  product,
  onSubmit,
  disabled,
}: ProductVariantCreateFormProps) => {
  const props = useProductVariantCreateForm(product, onSubmit, disabled);

  return <form onSubmit={props.submit}>{children(props)}</form>;
};

ProductVariantCreateForm.displayName = "ProductVariantCreateForm";
export default ProductVariantCreateForm;
