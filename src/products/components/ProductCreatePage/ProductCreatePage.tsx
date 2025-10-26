// @ts-strict-ignore
import { QueryResult } from "@apollo/client";
import CannotDefineChannelsAvailabilityCard from "@dashboard/channels/components/CannotDefineChannelsAvailabilityCard/CannotDefineChannelsAvailabilityCard";
import { ChannelData } from "@dashboard/channels/utils";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import ChannelsAvailabilityCard from "@dashboard/components/ChannelsAvailabilityCard";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import {
  PermissionEnum,
  ProductChannelListingErrorFragment,
  ProductErrorWithAttributesFragment,
  ProductTypeQuery,
  SearchAttributeValuesQuery,
  SearchCategoriesQuery,
  SearchCollectionsQuery,
  SearchPagesQuery,
  SearchProductsQuery,
  SearchProductTypesQuery,
  SearchWarehousesQuery,
} from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import useStateFromProps from "@dashboard/hooks/useStateFromProps";
import { ProductOrganization } from "@dashboard/products/components/ProductOrganization/ProductOrganization";
import { ProductVariantPrice } from "@dashboard/products/components/ProductVariantPrice";
import { ProductCreateUrlQueryParams, productListUrl } from "@dashboard/products/urls";
import { getChoices } from "@dashboard/products/utils/data";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { Option } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

import { FetchMoreProps, RelayToFlat } from "../../../types";
import { ProductDetailsForm } from "../ProductDetailsForm";
import { ProductShipping } from "../ProductShipping";
import { ProductStocks } from "../ProductStocks";
import ProductCreateForm, { ProductCreateData, ProductCreateFormData } from "./form";

interface ProductCreatePageProps {
  errors: ProductErrorWithAttributesFragment[];
  channelsErrors: ProductChannelListingErrorFragment[];
  allChannelsCount: number;
  currentChannels: ChannelData[];
  collections: RelayToFlat<SearchCollectionsQuery["search"]>;
  categories: RelayToFlat<SearchCategoriesQuery["search"]>;
  attributeValues: RelayToFlat<SearchAttributeValuesQuery["attribute"]["choices"]>;
  loading: boolean;
  fetchMoreCategories: FetchMoreProps;
  fetchMoreCollections: FetchMoreProps;
  fetchMoreProductTypes: FetchMoreProps;
  fetchMoreAttributeValues?: FetchMoreProps;
  initial?: Partial<ProductCreateFormData>;
  productTypes?: RelayToFlat<SearchProductTypesQuery["search"]>;
  referencePages?: RelayToFlat<SearchPagesQuery["search"]>;
  referenceProducts?: RelayToFlat<SearchProductsQuery["search"]>;
  referenceCategories?: RelayToFlat<SearchCategoriesQuery["search"]>;
  referenceCollections?: RelayToFlat<SearchCollectionsQuery["search"]>;
  header: string;
  saveButtonBarState: ConfirmButtonTransitionState;
  weightUnit: string;
  selectedProductType?: ProductTypeQuery["productType"];
  fetchCategories: (data: string) => void;
  fetchCollections: (data: string) => void;
  fetchProductTypes: (data: string) => void;
  fetchAttributeValues: (query: string, attributeId: string) => void;
  onWarehouseConfigure: () => void;
  openChannelsModal: () => void;
  onChannelsChange: (data: ChannelData[]) => void;
  assignReferencesAttributeId?: string;
  fetchReferencePages?: (data: string) => void;
  fetchReferenceProducts?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  fetchMoreReferenceProducts?: FetchMoreProps;
  onAttributeSelectBlur: () => void;
  onCloseDialog: (currentParams?: ProductCreateUrlQueryParams) => void;
  onSelectProductType: (productTypeId: string) => void;
  onSubmit?: (data: ProductCreateData) => any;
  fetchMoreWarehouses: () => void;
  searchWarehousesResult: QueryResult<SearchWarehousesQuery>;
}

export const ProductCreatePage = ({
  allChannelsCount,
  channelsErrors,
  currentChannels,
  loading,
  categories: categoryChoiceList,
  collections: collectionChoiceList,
  errors: apiErrors,
  fetchCategories,
  fetchCollections,
  fetchMoreCategories,
  fetchMoreCollections,
  fetchMoreProductTypes,
  header,
  initial,
  productTypes: productTypeChoiceList,
  referencePages = [],
  referenceProducts = [],
  referenceCategories = [],
  referenceCollections = [],
  saveButtonBarState,
  selectedProductType,
  fetchProductTypes,
  weightUnit,
  onSubmit,
  onChannelsChange,
  onWarehouseConfigure,
  openChannelsModal,
  assignReferencesAttributeId,
  fetchReferencePages,
  fetchMoreReferencePages,
  fetchReferenceProducts,
  fetchMoreReferenceProducts,
  onSelectProductType,
  fetchMoreWarehouses,
  searchWarehousesResult,
}: ProductCreatePageProps) => {
  const intl = useIntl();
  const navigate = useNavigator();
  // Display values
  const [selectedCategory, setSelectedCategory] = useStateFromProps(initial?.category || "");
  const [selectedCollections, setSelectedCollections] = useStateFromProps<Option[]>([]);
  const categories = getChoices(categoryChoiceList);
  const collections = getChoices(collectionChoiceList);
  const productTypes = getChoices(productTypeChoiceList);

  return (
    <ProductCreateForm
      onSubmit={onSubmit}
      initial={initial}
      selectedProductType={selectedProductType}
      onSelectProductType={onSelectProductType}
      categories={categories}
      collections={collections}
      productTypes={productTypeChoiceList}
      referencePages={referencePages}
      referenceProducts={referenceProducts}
      referenceCategories={referenceCategories}
      referenceCollections={referenceCollections}
      selectedCollections={selectedCollections}
      setSelectedCategory={setSelectedCategory}
      setSelectedCollections={setSelectedCollections}
      setChannels={onChannelsChange}
      currentChannels={currentChannels}
      fetchReferencePages={fetchReferencePages}
      fetchMoreReferencePages={fetchMoreReferencePages}
      fetchReferenceProducts={fetchReferenceProducts}
      fetchMoreReferenceProducts={fetchMoreReferenceProducts}
      assignReferencesAttributeId={assignReferencesAttributeId}
      loading={loading}
    >
      {({ change, data, validationErrors, handlers, submit, isSaveDisabled }) => {
        // Comparing explicitly to false because `hasVariants` can be undefined
        const isSimpleProduct = !data.productType?.hasVariants;
        const errors = [...apiErrors, ...validationErrors];

        return (
          <DetailPageLayout>
            <TopNav href={productListUrl()} title={header} />
            <DetailPageLayout.Content>
              <ProductDetailsForm
                data={data}
                disabled={loading}
                errors={errors}
                onChange={change}
              />
              {isSimpleProduct && (
                <>
                  <ProductShipping
                    data={data}
                    disabled={loading}
                    errors={errors}
                    weightUnit={weightUnit}
                    onChange={change}
                  />
                  <ProductVariantPrice
                    productVariantChannelListings={data.channelListings}
                    errors={[...errors, ...channelsErrors]}
                    loading={loading}
                    onChange={handlers.changeChannelPrice}
                  />
                  <ProductStocks
                    data={data}
                    warehouses={mapEdgesToItems(searchWarehousesResult?.data?.search) ?? []}
                    fetchMoreWarehouses={fetchMoreWarehouses}
                    hasMoreWarehouses={searchWarehousesResult?.data?.search?.pageInfo?.hasNextPage}
                    disabled={loading}
                    hasVariants={false}
                    onFormDataChange={change}
                    errors={errors}
                    stocks={data.stocks}
                    onChange={handlers.changeStock}
                    onWarehouseStockAdd={handlers.addStock}
                    onWarehouseStockDelete={handlers.deleteStock}
                    onWarehouseConfigure={onWarehouseConfigure}
                    isCreate={true}
                  />
                </>
              )}
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <ProductOrganization
                canChangeType={true}
                categories={categories}
                categoryInputDisplayValue={selectedCategory}
                collections={collections}
                data={data}
                disabled={loading}
                errors={[...errors, ...channelsErrors]}
                fetchCategories={fetchCategories}
                fetchCollections={fetchCollections}
                fetchMoreCategories={fetchMoreCategories}
                fetchMoreCollections={fetchMoreCollections}
                fetchMoreProductTypes={fetchMoreProductTypes}
                fetchProductTypes={fetchProductTypes}
                productType={data.productType}
                productTypeInputDisplayValue={data.productType?.name || ""}
                productTypes={productTypes}
                onCategoryChange={handlers.selectCategory}
                onCollectionChange={handlers.selectCollection}
                onProductTypeChange={handlers.selectProductType}
                collectionsInputDisplayValue={selectedCollections}
              />
              {isSimpleProduct ? (
                <ChannelsAvailabilityCard
                  managePermissions={[PermissionEnum.MANAGE_PRODUCTS]}
                  messages={{
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
                  }}
                  errors={channelsErrors}
                  allChannelsCount={allChannelsCount}
                  channels={data.channelListings || []}
                  disabled={loading}
                  onChange={handlers.changeChannels}
                  openModal={openChannelsModal}
                />
              ) : (
                <CannotDefineChannelsAvailabilityCard />
              )}
            </DetailPageLayout.RightSidebar>
            <Savebar>
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(productListUrl())} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBarState}
                onClick={submit}
                disabled={isSaveDisabled}
              />
            </Savebar>
          </DetailPageLayout>
        );
      }}
    </ProductCreateForm>
  );
};
ProductCreatePage.displayName = "ProductCreatePage";
export default ProductCreatePage;
