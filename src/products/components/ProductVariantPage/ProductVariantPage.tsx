// @ts-strict-ignore
import { QueryResult } from "@apollo/client";
import { useUser } from "@dashboard/auth";
import { hasPermission } from "@dashboard/auth/misc";
import { ChannelPriceData } from "@dashboard/channels/utils";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import CardSpacer from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Grid from "@dashboard/components/Grid";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import {
  PermissionEnum,
  ProductChannelListingErrorFragment,
  ProductErrorWithAttributesFragment,
  ProductVariantFragment,
  SearchAttributeValuesQuery,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
  SearchWarehousesQuery,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { VariantDetailsChannelsAvailabilityCard } from "@dashboard/products/components/ProductVariantChannels/ChannelsAvailabilityCard";
import { productUrl } from "@dashboard/products/urls";
import { getSelectedMedia } from "@dashboard/products/utils/data";
import { productVariantUrl } from "@dashboard/translations/urls";
import { useCachedLocales } from "@dashboard/translations/useCachedLocales";
import { FetchMoreProps, RelayToFlat, ReorderAction } from "@dashboard/types";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { Box } from "@saleor/macaw-ui-next";
import React from "react";

import { ProductShipping } from "../ProductShipping";
import { ProductStockInput, ProductStocks } from "../ProductStocks";
import { useManageChannels } from "../ProductVariantChannels/useManageChannels";
import { VariantChannelsDialog } from "../ProductVariantChannels/VariantChannelsDialog";
import ProductVariantCheckoutSettings from "../ProductVariantCheckoutSettings/ProductVariantCheckoutSettings";
import ProductVariantEndPreorderDialog from "../ProductVariantEndPreorderDialog";
import ProductVariantMediaSelectDialog from "../ProductVariantImageSelectDialog";
import ProductVariantMedia from "../ProductVariantMedia";
import ProductVariantName from "../ProductVariantName";
import ProductVariantNavigation from "../ProductVariantNavigation";
import { ProductVariantPrice } from "../ProductVariantPrice";
import ProductVariantSetDefault from "../ProductVariantSetDefault";
import ProductVariantUpdateForm, { ProductVariantUpdateSubmitData } from "./form";

export interface ProductVariantPageFormData {
  costPrice: string;
  price: string;
  sku: string;
  trackInventory: boolean;
  weight: string;
}

export interface ProductVariantPageSubmitData extends ProductVariantPageFormData {
  addStocks: ProductStockInput[];
  updateStocks: ProductStockInput[];
  removeStocks: string[];
}

interface ProductVariantPageProps {
  productId: string;
  assignReferencesAttributeId?: string;
  defaultVariantId?: string;
  defaultWeightUnit: string;
  errors: ProductErrorWithAttributesFragment[];
  header: string;
  channels: ChannelPriceData[];
  channelErrors: ProductChannelListingErrorFragment[];
  loading?: boolean;
  placeholderImage?: string;
  saveButtonBarState: ConfirmButtonTransitionState;
  variant?: ProductVariantFragment;
  referencePages?: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts?: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCategories?: RelayToFlat<SearchCategoriesQuery["search"]>;
  referenceCollections?: RelayToFlat<SearchCollectionsQuery["search"]>;
  attributeValues: RelayToFlat<SearchAttributeValuesQuery["attribute"]["choices"]>;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchMoreReferenceProducts?: FetchMoreProps;
  fetchMoreAttributeValues?: FetchMoreProps;
  fetchReferencePages?: (data: string) => void;
  fetchReferenceProducts?: (data: string) => void;
  fetchAttributeValues: (query: string, attributeId: string) => void;
  onCloseDialog: () => void;
  onVariantPreorderDeactivate: (id: string) => void;
  variantDeactivatePreoderButtonState: ConfirmButtonTransitionState;
  onVariantReorder: ReorderAction;
  onAttributeSelectBlur: () => void;
  onDelete: () => any;
  onSubmit: (data: ProductVariantUpdateSubmitData) => any;
  onSetDefaultVariant: () => any;
  onWarehouseConfigure: () => any;
  fetchMoreWarehouses: () => void;
  searchWarehousesResult: QueryResult<SearchWarehousesQuery>;
}

const ProductVariantPage = ({
  productId,
  channels,
  channelErrors,
  defaultVariantId,
  defaultWeightUnit,
  errors: apiErrors,
  header,
  loading,
  placeholderImage,
  saveButtonBarState,
  variant,
  referencePages = [],
  referenceProducts = [],
  onDelete,
  onSubmit,
  onVariantPreorderDeactivate,
  variantDeactivatePreoderButtonState,
  onVariantReorder,
  onSetDefaultVariant,
  onWarehouseConfigure,
  assignReferencesAttributeId,
  fetchReferencePages,
  fetchReferenceProducts,
  fetchMoreReferencePages,
  fetchMoreReferenceProducts,
  fetchMoreWarehouses,
  searchWarehousesResult,
}: ProductVariantPageProps) => {
  const { user } = useUser();
  const canTranslate = user && hasPermission(PermissionEnum.MANAGE_TRANSLATIONS, user);
  const { lastUsedLocaleOrFallback } = useCachedLocales();
  const navigate = useNavigator();
  const { isOpen: isManageChannelsModalOpen, toggle: toggleManageChannels } = useManageChannels();
  const [isModalOpened, setModalStatus] = React.useState(false);
  const toggleModal = () => setModalStatus(!isModalOpened);
  const [isEndPreorderModalOpened, setIsEndPreorderModalOpened] = React.useState(false);
  const productMedia = [...(variant?.product?.media ?? [])]?.sort((prev, next) =>
    prev.sortOrder > next.sortOrder ? 1 : -1,
  );
  const handleDeactivatePreorder = async () => {
    await onVariantPreorderDeactivate(variant.id);
    setIsEndPreorderModalOpened(false);
  };

  return (
    <DetailPageLayout gridTemplateColumns={1}>
      <TopNav href={productUrl(productId)} title={header}>
        {variant?.product?.defaultVariant?.id !== variant?.id && (
          <Box marginRight={3}>
            <ProductVariantSetDefault onSetDefaultVariant={onSetDefaultVariant} />
          </Box>
        )}
      </TopNav>
      <DetailPageLayout.Content>
        <ProductVariantUpdateForm
          variant={variant}
          onSubmit={onSubmit}
          currentChannels={channels}
          referencePages={referencePages}
          referenceProducts={referenceProducts}
          fetchReferencePages={fetchReferencePages}
          fetchMoreReferencePages={fetchMoreReferencePages}
          fetchReferenceProducts={fetchReferenceProducts}
          fetchMoreReferenceProducts={fetchMoreReferenceProducts}
          assignReferencesAttributeId={assignReferencesAttributeId}
          loading={loading}
        >
          {({ change, data, validationErrors, isSaveDisabled, handlers, submit }) => {
            const media = getSelectedMedia(productMedia, data.media);
            const errors = [...apiErrors, ...validationErrors];
            const priceVariantErrors = [...channelErrors, ...validationErrors];

            return (
              <>
                <Grid variant="inverted">
                  <div>
                    <ProductVariantNavigation
                      productId={productId}
                      current={variant?.id}
                      defaultVariantId={defaultVariantId}
                      fallbackThumbnail={variant?.product?.thumbnail?.url}
                      variants={variant?.product.variants}
                      onReorder={onVariantReorder}
                    />
                  </div>
                  <div>
                    <ProductVariantName
                      value={data.variantName}
                      onChange={change}
                      disabled={loading}
                      errors={errors}
                    />
                    <CardSpacer />
                    <VariantDetailsChannelsAvailabilityCard
                      variant={variant}
                      listings={data.channelListings}
                      disabled={loading}
                      onManageClick={toggleManageChannels}
                    />
                    <ProductVariantMedia
                      disabled={loading || productMedia.length === 0}
                      media={media}
                      placeholderImage={placeholderImage}
                      onImageAdd={toggleModal}
                    />
                    <CardSpacer />
                    <ProductVariantPrice
                      disabled={!variant}
                      productVariantChannelListings={data.channelListings.map(channel => ({
                        ...channel.data,
                        ...channel.value,
                      }))}
                      errors={priceVariantErrors}
                      loading={loading}
                      onChange={handlers.changeChannels}
                    />
                    <CardSpacer />
                    <ProductVariantCheckoutSettings
                      data={data}
                      disabled={loading}
                      errors={errors}
                      onChange={change}
                    />
                    <CardSpacer />

                    <ProductShipping
                      data={data}
                      disabled={loading}
                      errors={errors}
                      weightUnit={variant?.weight?.unit || defaultWeightUnit}
                      onChange={change}
                    />
                    <CardSpacer />
                    <ProductStocks
                      productVariantChannelListings={data.channelListings.map(channel => ({
                        ...channel.data,
                        ...channel.value,
                      }))}
                      warehouses={mapEdgesToItems(searchWarehousesResult?.data?.search) ?? []}
                      fetchMoreWarehouses={fetchMoreWarehouses}
                      hasMoreWarehouses={
                        searchWarehousesResult?.data?.search?.pageInfo?.hasNextPage
                      }
                      data={data}
                      disabled={loading}
                      hasVariants={true}
                      errors={errors}
                      stocks={data.stocks}
                      onChange={handlers.changeStock}
                      onFormDataChange={change}
                      onWarehouseStockAdd={handlers.addStock}
                      onWarehouseStockDelete={handlers.deleteStock}
                      onWarehouseConfigure={onWarehouseConfigure}
                      isCreate={false}
                    />
                    <CardSpacer />
                  </div>
                </Grid>
                <Savebar>
                  <Savebar.DeleteButton onClick={onDelete} />
                  <Savebar.Spacer />
                  <Savebar.CancelButton onClick={() => navigate(productUrl(productId))} />
                  <Savebar.ConfirmButton
                    transitionState={saveButtonBarState}
                    onClick={submit}
                    disabled={isSaveDisabled}
                  />
                </Savebar>
                {variant && (
                  <>
                    <VariantChannelsDialog
                      channelListings={variant.product.channelListings}
                      selectedChannelListings={data.channelListings}
                      open={isManageChannelsModalOpen}
                      onClose={toggleManageChannels}
                      onConfirm={handlers.updateChannels}
                    />
                    <ProductVariantMediaSelectDialog
                      onClose={toggleModal}
                      onConfirm={handlers.changeMedia}
                      open={isModalOpened}
                      media={productMedia}
                      selectedMedia={data.media}
                    />
                  </>
                )}
              </>
            );
          }}
        </ProductVariantUpdateForm>
      </DetailPageLayout.Content>
      {!!variant?.preorder && (
        <ProductVariantEndPreorderDialog
          confirmButtonState={variantDeactivatePreoderButtonState}
          onClose={() => setIsEndPreorderModalOpened(false)}
          onConfirm={handleDeactivatePreorder}
          open={isEndPreorderModalOpened}
          variantGlobalSoldUnits={variant?.preorder?.globalSoldUnits}
        />
      )}
    </DetailPageLayout>
  );
};

ProductVariantPage.displayName = "ProductVariantPage";
export default ProductVariantPage;
