// @ts-strict-ignore
import { useUser } from "@dashboard/auth";
import { hasPermission } from "@dashboard/auth/misc";
import { ChannelData } from "@dashboard/channels/utils";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import ChannelsAvailabilityCard from "@dashboard/components/ChannelsAvailabilityCard";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import {
  ChannelFragment,
  PermissionEnum,
  ProductChannelListingErrorFragment,
  ProductDetailsQuery,
  ProductDetailsVariantFragment,
  ProductErrorFragment,
  ProductErrorWithAttributesFragment,
  ProductFragment,
  RefreshLimitsQuery,
  SearchAttributeValuesQuery,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
} from "@dashboard/graphql";
import { useBackLinkWithState } from "@dashboard/hooks/useBackLinkWithState";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import useStateFromProps from "@dashboard/hooks/useStateFromProps";
import { maybe } from "@dashboard/misc";
import ProductExternalMediaDialog from "@dashboard/products/components/ProductExternalMediaDialog";
import { ProductOrganization } from "@dashboard/products/components/ProductOrganization/ProductOrganization";
import { mapByChannel } from "@dashboard/products/components/ProductUpdatePage/utils";
import { productImageUrl, productListPath, productListUrl } from "@dashboard/products/urls";
import { ChoiceWithAncestors, getChoicesWithAncestors } from "@dashboard/products/utils/utils";
import { ProductVariantListError } from "@dashboard/products/views/ProductUpdate/handlers/errors";
import { UseProductUpdateHandlerError } from "@dashboard/products/views/ProductUpdate/handlers/useProductUpdateHandler";
import { productUrl as createTranslateProductUrl } from "@dashboard/translations/urls";
import { useCachedLocales } from "@dashboard/translations/useCachedLocales";
import { FetchMoreProps, RelayToFlat } from "@dashboard/types";
import { Option } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

import { getChoices } from "../../utils/data";
import { ProductDetailsForm } from "../ProductDetailsForm";
import ProductMedia from "../ProductMedia";
import ProductVariants from "../ProductVariants";
import ProductUpdateForm from "./form";
import ProductChannelsListingsDialog from "./ProductChannelsListingsDialog";
import { ProductUpdateSubmitData } from "./types";

export interface ProductUpdatePageProps {
  channels: ChannelFragment[];
  productId: string;
  channelsErrors: ProductChannelListingErrorFragment[];
  variantListErrors: ProductVariantListError[];
  errors: UseProductUpdateHandlerError[];
  collections: RelayToFlat<SearchCollectionsQuery["search"]>;
  categories: RelayToFlat<SearchCategoriesQuery["search"]>;
  attributeValues: RelayToFlat<SearchAttributeValuesQuery["attribute"]["choices"]>;
  disabled: boolean;
  fetchMoreCategories: FetchMoreProps;
  fetchMoreCollections: FetchMoreProps;
  isMediaUrlModalVisible?: boolean;
  limits: RefreshLimitsQuery["shop"]["limits"];
  variants: ProductDetailsVariantFragment[];
  media: ProductFragment["media"];
  product?: ProductDetailsQuery["product"];
  header: string;
  saveButtonBarState: ConfirmButtonTransitionState;
  referencePages?: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts?: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCategories?: RelayToFlat<SearchCategoriesQuery["search"]>;
  referenceCollections?: RelayToFlat<SearchCollectionsQuery["search"]>;
  assignReferencesAttributeId?: string;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchMoreReferenceProducts?: FetchMoreProps;
  fetchMoreAttributeValues?: FetchMoreProps;
  isSimpleProduct: boolean;
  fetchCategories: (query: string) => void;
  fetchCollections: (query: string) => void;
  fetchReferencePages?: (data: string) => void;
  fetchReferenceProducts?: (data: string) => void;
  fetchAttributeValues: (query: string, attributeId: string) => void;
  refetch: () => Promise<any>;
  onAttributeValuesSearch: (id: string, query: string) => Promise<Option[]>;
  onCloseDialog: () => void;
  onImageDelete: (id: string) => () => void;
  onSubmit: (data: ProductUpdateSubmitData) => SubmitPromise;
  onVariantShow: (id: string) => void;
  onAttributeSelectBlur: () => void;
  onDelete: () => any;
  onImageReorder?: (event: { oldIndex: number; newIndex: number }) => any;
  onImageUpload: (file: File) => any;
  onMediaUrlUpload: (mediaUrl: string) => any;
  onSeoClick?: () => any;
}

export const ProductUpdatePage = ({
  productId,
  disabled,
  categories: categoryChoiceList,
  channels,
  channelsErrors,
  variantListErrors,
  collections: collectionChoiceList,
  isSimpleProduct,
  errors,
  fetchCategories,
  fetchCollections,
  fetchMoreCategories,
  fetchMoreCollections,
  media,
  header,
  limits,
  product,
  saveButtonBarState,
  variants,
  referencePages = [],
  referenceProducts = [],
  referenceCategories = [],
  referenceCollections = [],
  onDelete,
  onImageDelete,
  onImageReorder,
  onImageUpload,
  onMediaUrlUpload,
  onVariantShow,
  onSubmit,
  isMediaUrlModalVisible,
  assignReferencesAttributeId,
  onAttributeValuesSearch,
  fetchReferencePages,
  fetchMoreReferencePages,
  fetchReferenceProducts,
  fetchMoreReferenceProducts,
  refetch,
}: ProductUpdatePageProps) => {
  const intl = useIntl();
  const { user } = useUser();
  const canTranslate = user && hasPermission(PermissionEnum.MANAGE_TRANSLATIONS, user);
  const { lastUsedLocaleOrFallback } = useCachedLocales();
  const navigate = useNavigator();
  const [channelPickerOpen, setChannelPickerOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = useStateFromProps(product?.category?.name || "");
  const [mediaUrlModalStatus, setMediaUrlModalStatus] = useStateFromProps(
    isMediaUrlModalVisible || false,
  );
  const [selectedCollections, setSelectedCollections] = useStateFromProps(
    getChoices(maybe(() => product.collections, [])),
  );
  const categories = getChoicesWithAncestors(categoryChoiceList);
  const selectedProductCategory = product?.category
    ? getChoicesWithAncestors([product.category as ChoiceWithAncestors])[0]
    : undefined;
  const collections = getChoices(collectionChoiceList);
  const hasVariants = product?.productType?.hasVariants;
  const productErrors = React.useMemo(
    () =>
      errors.filter(
        error => error.__typename === "ProductError",
      ) as ProductErrorWithAttributesFragment[],
    [errors],
  );
  const productOrganizationErrors = React.useMemo(
    () =>
      [...errors, ...channelsErrors].filter(err =>
        ["ProductChannelListingError", "ProductError"].includes(err.__typename),
      ) as Array<ProductErrorFragment | ProductChannelListingErrorFragment>,
    [errors, channelsErrors],
  );
  const backLinkProductUrl = useBackLinkWithState({
    path: productListPath,
  });

  return (
    <ProductUpdateForm
      isSimpleProduct={isSimpleProduct}
      onSubmit={onSubmit}
      product={product}
      categories={categories}
      collections={collections}
      selectedCollections={selectedCollections}
      setSelectedCategory={setSelectedCategory}
      setSelectedCollections={setSelectedCollections}
      hasVariants={hasVariants}
      referencePages={referencePages}
      referenceProducts={referenceProducts}
      referenceCategories={referenceCategories}
      referenceCollections={referenceCollections}
      fetchReferencePages={fetchReferencePages}
      fetchMoreReferencePages={fetchMoreReferencePages}
      fetchReferenceProducts={fetchReferenceProducts}
      fetchMoreReferenceProducts={fetchMoreReferenceProducts}
      assignReferencesAttributeId={assignReferencesAttributeId}
      disabled={disabled}
      refetch={refetch}
    >
      {({ change, data, handlers, submit, isSaveDisabled }) => {
        const availabilityCommonProps = {
          managePermissions: [PermissionEnum.MANAGE_PRODUCTS],
          messages: {
            hiddenLabel: intl.formatMessage({
              id: "saKXY3",
              defaultMessage: "Not published",
              description: "product label",
            }),

            visibleLabel: intl.formatMessage({
              id: "qJedl0",
              defaultMessage: "Published",
              description: "product label",
            }),
          },
          errors: channelsErrors,
          allChannelsCount: channels?.length,
          disabled,
          onChange: handlers.changeChannels,
          openModal: () => setChannelPickerOpen(true),
        };

        const byChannel = mapByChannel(channels);
        const listings = data.channels.updateChannels?.map<ChannelData>(byChannel);

        return (
          <DetailPageLayout>
            <TopNav href={backLinkProductUrl} title={header}></TopNav>

            <DetailPageLayout.Content>
              <ProductDetailsForm
                data={data}
                disabled={disabled}
                errors={productErrors}
                onChange={change}
              />
              <ProductMedia
                media={media}
                onImageDelete={onImageDelete}
                onImageReorder={onImageReorder}
                onImageUpload={onImageUpload}
                openMediaUrlModal={() => setMediaUrlModalStatus(true)}
                getImageEditUrl={imageId => productImageUrl(productId, imageId)}
              />
              <ProductVariants
                productId={productId}
                productName={product?.name}
                errors={variantListErrors}
                channels={listings}
                limits={limits}
                variants={variants}
                variantAttributes={product?.productType.variantAttributes}
                onAttributeValuesSearch={onAttributeValuesSearch}
                onChange={handlers.changeVariants}
                onRowClick={onVariantShow}
              />
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <ProductOrganization
                canChangeType={false}
                categories={categories}
                categoryInputDisplayValue={selectedCategory}
                collections={collections}
                collectionsInputDisplayValue={selectedCollections}
                data={data}
                disabled={disabled}
                errors={productOrganizationErrors}
                fetchCategories={fetchCategories}
                fetchCollections={fetchCollections}
                fetchMoreCategories={fetchMoreCategories}
                fetchMoreCollections={fetchMoreCollections}
                productType={product?.productType}
                onCategoryChange={handlers.selectCategory}
                onCollectionChange={handlers.selectCollection}
                selectedProductCategory={selectedProductCategory}
              />
              <ChannelsAvailabilityCard {...availabilityCommonProps} channels={listings ?? []} />
            </DetailPageLayout.RightSidebar>

            <Savebar>
              <Savebar.DeleteButton onClick={onDelete} />
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(productListUrl())} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled}
              />
            </Savebar>
            <ProductExternalMediaDialog
              product={product}
              onClose={() => setMediaUrlModalStatus(false)}
              open={mediaUrlModalStatus}
              onSubmit={onMediaUrlUpload}
            />
            <ProductChannelsListingsDialog
              channels={channels}
              data={data}
              onClose={() => setChannelPickerOpen(false)}
              open={channelPickerOpen}
              onConfirm={handlers.updateChannelList}
            />
          </DetailPageLayout>
        );
      }}
    </ProductUpdateForm>
  );
};
ProductUpdatePage.displayName = "ProductUpdatePage";
export default ProductUpdatePage;
