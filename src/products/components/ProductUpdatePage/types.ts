// @ts-strict-ignore
import { ChannelOpts } from "@dashboard/components/ChannelsAvailabilityCard/types";
import {
  DatagridChangeOpts,
  UseDatagridChangeState,
} from "@dashboard/components/Datagrid/hooks/useDatagridChange";
import {
  MetadataErrorFragment,
  ProductChannelListingUpdateInput,
  ProductFragment,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
} from "@dashboard/graphql";
import {
  CommonUseFormResultWithHandlers,
  FormChange,
  FormErrors,
  SubmitPromise,
} from "@dashboard/hooks/useForm";
import { UseProductUpdateHandlerError } from "@dashboard/products/views/ProductUpdate/handlers/useProductUpdateHandler";
import { FetchMoreProps, RelayToFlat } from "@dashboard/types";
import { RichTextContextValues } from "@dashboard/utils/richText/context";
import { OutputData } from "@editorjs/editorjs";
import { Option } from "@saleor/macaw-ui-next";

import { ProductChannelsListingDialogSubmit } from "./ProductChannelsListingsDialog";

export interface ProductUpdateFormData {
  category: string | null;
  collections: Option[];
  isAvailable: boolean;
  name: string;
  rating: number;
  slug: string;
  seoDescription: string;
  seoTitle: string;
  sku: string;
  trackInventory: boolean;
  isPreorder: boolean;
  globalThreshold: string;
  globalSoldUnits: number;
  hasPreorderEndDate: boolean;
  preorderEndDateTime?: string;
  weight: string;
}
export interface ProductUpdateData extends ProductUpdateFormData {
  channels: ProductChannelListingUpdateInput;
  description: OutputData;
}
export interface ProductUpdateSubmitData extends ProductUpdateFormData {
  channels: ProductChannelListingUpdateInput;
  collections: Option[];
  description: OutputData;
  variants: DatagridChangeOpts;
}

export interface ProductUpdateHandlers
  extends Record<"changeMetadata" | "selectCategory" | "selectCollection", FormChange> {
  changeChannels: (id: string, data: ChannelOpts) => void;
  changeVariants: (data: DatagridChangeOpts) => void;
  updateChannelList: ProductChannelsListingDialogSubmit;
}

export interface UseProductUpdateFormOutput
  extends CommonUseFormResultWithHandlers<ProductUpdateData, ProductUpdateHandlers> {
  datagrid: UseDatagridChangeState;
  formErrors: FormErrors<ProductUpdateSubmitData>;
  richText: RichTextContextValues;
}

export type UseProductUpdateFormRenderProps = Omit<
  UseProductUpdateFormOutput,
  "datagrid" | "richText"
>;

export interface UseProductUpdateFormOpts extends Record<"categories" | "collections", Option[]> {
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCollections: React.Dispatch<React.SetStateAction<Option[]>>;
  selectedCollections: Option[];
  hasVariants: boolean;
  referencePages: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCategories?: RelayToFlat<SearchCategoriesQuery["search"]>;
  referenceCollections?: RelayToFlat<SearchCollectionsQuery["search"]>;
  fetchReferencePages?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchReferenceProducts?: (data: string) => void;
  fetchMoreReferenceProducts?: FetchMoreProps;
  assignReferencesAttributeId?: string;
  isSimpleProduct: boolean;
}

export type SubmitResult = SubmitPromise<
  Array<UseProductUpdateHandlerError | MetadataErrorFragment>
>;

export interface ProductUpdateFormProps extends UseProductUpdateFormOpts {
  children: (props: UseProductUpdateFormRenderProps) => React.ReactNode;
  product: ProductFragment;
  onSubmit: (data: ProductUpdateSubmitData) => SubmitResult;
  refetch: () => Promise<any>;
  disabled: boolean;
}
