// @ts-strict-ignore
import { ChannelData, ChannelPriceArgs } from "@dashboard/channels/utils";
import { useExitFormDialog } from "@dashboard/components/Form/useExitFormDialog";
import {
  ProductErrorWithAttributesFragment,
  ProductTypeQuery,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
  SearchProductTypesQuery,
} from "@dashboard/graphql";
import useForm, {
  CommonUseFormResultWithHandlers,
  FormChange,
  FormErrors,
  SubmitPromise,
} from "@dashboard/hooks/useForm";
import useFormset, { FormsetChange } from "@dashboard/hooks/useFormset";
import useHandleFormSubmit from "@dashboard/hooks/useHandleFormSubmit";
import { errorMessages } from "@dashboard/intl";
import { ProductType } from "@dashboard/products/utils/data";
import {
  createChannelsChangeHandler,
  createChannelsPriceChangeHandler,
  createPreorderEndDateChangeHandler,
  createProductTypeSelectHandler,
} from "@dashboard/products/utils/handlers";
import {
  validateCostPrice,
  validatePrice,
  validateProductCreateData,
} from "@dashboard/products/utils/validation";
import { PRODUCT_CREATE_FORM_ID } from "@dashboard/products/views/ProductCreate/consts";
import { FetchMoreProps, RelayToFlat } from "@dashboard/types";
import createMultiselectChangeHandler from "@dashboard/utils/handlers/multiselectChangeHandler";
import createSingleAutocompleteSelectHandler from "@dashboard/utils/handlers/singleAutocompleteSelectChangeHandler";
import { RichTextContext, RichTextContextValues } from "@dashboard/utils/richText/context";
import useRichText from "@dashboard/utils/richText/useRichText";
import { OutputData } from "@editorjs/editorjs";
import { Option } from "@saleor/macaw-ui-next";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";

import { ProductStockFormsetData, ProductStockInput } from "../ProductStocks";

export interface ProductCreateFormData {
  category: string;
  channelListings: ChannelData[];
  collections: Option[];
  description: OutputData;
  isAvailable: boolean;
  name: string;
  productType: ProductType;
  rating: number;
  seoDescription: string;
  seoTitle: string;
  sku: string;
  slug: string;
  stockQuantity: number;
  trackInventory: boolean;
  isPreorder: boolean;
  globalThreshold: string;
  globalSoldUnits: number;
  hasPreorderEndDate: boolean;
  preorderEndDateTime: string;
  weight: string;
}
export interface ProductCreateData extends ProductCreateFormData {
  stocks: ProductStockInput[];
}

export interface ProductCreateHandlers
  extends Record<
      "changeMetadata" | "selectCategory" | "selectCollection" | "selectProductType",
      FormChange
    >,
    Record<"changeStock", FormsetChange<string>>,
    Record<"changeChannelPrice", (id: string, data: ChannelPriceArgs) => void>,
    Record<
      "changeChannels",
      (id: string, data: Omit<ChannelData, "name" | "price" | "currency" | "id">) => void
    >,
    Record<"addStock", (id: string, label: string) => void>,
    Record<"deleteStock", (id: string) => void> {
  changePreorderEndDate: FormChange;
}
export interface UseProductCreateFormOutput
  extends CommonUseFormResultWithHandlers<ProductCreateData, ProductCreateHandlers> {
  disabled: boolean;
  formErrors: FormErrors<ProductCreateData>;
  validationErrors: ProductErrorWithAttributesFragment[];
  richText: RichTextContextValues;
}

export type UseProductCreateFormRenderProps = Omit<UseProductCreateFormOutput, "richText">;

export interface UseProductCreateFormOpts extends Record<"categories" | "collections", Option[]> {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<Option[]>>;
  setChannels: (channels: ChannelData[]) => void;
  selectedCollections: Option[];
  productTypes: RelayToFlat<SearchProductTypesQuery["search"]>;
  currentChannels: ChannelData[];
  referencePages: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCollections: RelayToFlat<SearchCollectionsQuery["search"]>;
  referenceCategories: RelayToFlat<SearchCategoriesQuery["search"]>;
  fetchReferencePages?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchReferenceProducts?: (data: string) => void;
  fetchMoreReferenceProducts?: FetchMoreProps;
  assignReferencesAttributeId?: string;
  selectedProductType?: ProductTypeQuery["productType"];
  onSelectProductType: (productTypeId: string) => void;
}

export interface ProductCreateFormProps extends UseProductCreateFormOpts {
  children: (props: UseProductCreateFormRenderProps) => React.ReactNode;
  initial?: Partial<ProductCreateFormData>;
  onSubmit: (data: ProductCreateData) => SubmitPromise;
  loading: boolean;
}

function useProductCreateForm(
  initial: Partial<ProductCreateFormData>,
  onSubmit: (data: ProductCreateData) => SubmitPromise,
  loading: boolean,
  opts: UseProductCreateFormOpts,
): UseProductCreateFormOutput {
  const intl = useIntl();
  const [validationErrors, setValidationErrors] = useState<ProductErrorWithAttributesFragment[]>(
    [],
  );
  const defaultInitialFormData: ProductCreateFormData & Record<"productType", string> = {
    category: "",
    channelListings: opts.currentChannels,
    collections: [],
    description: null,
    isAvailable: false,
    name: "",
    productType: null,
    rating: 0,
    seoDescription: "",
    seoTitle: "",
    sku: "",
    slug: "",
    stockQuantity: null,
    trackInventory: false,
    weight: "",
    globalSoldUnits: 0,
    globalThreshold: "",
    isPreorder: false,
    hasPreorderEndDate: false,
    preorderEndDateTime: "",
  };
  const form = useForm(
    {
      ...initial,
      ...defaultInitialFormData,
    },
    undefined,
    { confirmLeave: true, formId: PRODUCT_CREATE_FORM_ID },
  );
  const { triggerChange, toggleValues, handleChange, data: formData, formId } = form;
  const attributesWithNewFileValue = useFormset<null, File>([]);
  const stocks = useFormset<ProductStockFormsetData>([]);
  const richText = useRichText({
    initial: null,
    triggerChange,
  });
  const handleCollectionSelect = createMultiselectChangeHandler(
    toggleValues,
    opts.setSelectedCollections,
  );
  const handleCategorySelect = createSingleAutocompleteSelectHandler(
    handleChange,
    opts.setSelectedCategory,
    opts.categories,
  );
  const handleProductTypeSelect = createProductTypeSelectHandler(
    opts.onSelectProductType,
    triggerChange,
  );
  const handleStockChange: FormsetChange<string> = (id, value) => {
    triggerChange();
    stocks.change(id, value);
  };
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
  const handleStockDelete = (id: string) => {
    triggerChange();
    stocks.remove(id);
  };
  const handleChannelsChange = createChannelsChangeHandler(
    opts.currentChannels,
    opts.setChannels,
    triggerChange,
  );
  const handleChannelPriceChange = createChannelsPriceChangeHandler(
    opts.currentChannels,
    opts.setChannels,
    triggerChange,
  );
  const handlePreorderEndDateChange = createPreorderEndDateChangeHandler(
    form,
    triggerChange,
    intl.formatMessage(errorMessages.preorderEndDateInFutureErrorText),
  );
  const data: ProductCreateData = {
    ...formData,
    description: null,
    productType: opts.selectedProductType,
    stocks: stocks.data,
  };
  const getData = async (): Promise<ProductCreateData> => ({
    ...data,
    description: await richText.getValue(),
  });
  const handleSubmit = async (data: ProductCreateData) => {
    const errors = validateProductCreateData(data);

    setValidationErrors(errors);

    if (errors.length) {
      return errors;
    }

    return onSubmit(data);
  };
  const handleFormSubmit = useHandleFormSubmit({
    formId,
    onSubmit: handleSubmit,
  });
  const submit = async () => {
    const errors = await handleFormSubmit(await getData());

    if (errors.length) {
      setIsSubmitDisabled(isSubmitDisabled);
      setIsDirty(true);
    }

    return errors;
  };
  const { setExitDialogSubmitRef, setIsSubmitDisabled, setIsDirty } = useExitFormDialog({
    formId: PRODUCT_CREATE_FORM_ID,
  });

  useEffect(() => setExitDialogSubmitRef(submit), [submit]);

  const isValid = () => {
    if (!data.name || !data.productType) {
      return false;
    }

    if (data.isPreorder && data.hasPreorderEndDate && !!form.errors.preorderEndDateTime) {
      return false;
    }

    if (opts.selectedProductType?.hasVariants) {
      return true;
    }

    const hasInvalidChannelListingPrices = data.channelListings.some(
      channel => validatePrice(channel.price) || validateCostPrice(channel.costPrice),
    );

    if (hasInvalidChannelListingPrices) {
      return false;
    }

    return true;
  };
  const isSaveDisabled = loading || !onSubmit;
  const isSubmitDisabled = isSaveDisabled || !isValid();

  useEffect(() => {
    setIsSubmitDisabled(isSubmitDisabled);
    setIsDirty(true);
  }, [isSubmitDisabled]);

  return {
    change: handleChange,
    data,
    disabled: isSaveDisabled,
    formErrors: form.errors,
    validationErrors,
    handlers: {
      addStock: handleStockAdd,
      changeChannelPrice: handleChannelPriceChange,
      changeChannels: handleChannelsChange,
      changeMetadata: {} as any,
      changeStock: handleStockChange,
      changePreorderEndDate: handlePreorderEndDateChange,
      deleteStock: handleStockDelete,
      selectCategory: handleCategorySelect,
      selectCollection: handleCollectionSelect,
      selectProductType: handleProductTypeSelect,
    },
    submit,
    isSaveDisabled,
    richText,
  };
}

const ProductCreateForm = ({
  children,
  initial,
  onSubmit,
  loading,
  ...rest
}: ProductCreateFormProps) => {
  const { richText, ...props } = useProductCreateForm(initial || {}, onSubmit, loading, rest);

  return (
    <form onSubmit={props.submit}>
      <RichTextContext.Provider value={richText}>{children(props)}</RichTextContext.Provider>
    </form>
  );
};

ProductCreateForm.displayName = "ProductCreateForm";
export default ProductCreateForm;
