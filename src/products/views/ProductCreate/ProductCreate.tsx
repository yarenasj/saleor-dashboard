// @ts-strict-ignore
import { ChannelData, createSortedChannelsData } from "@dashboard/channels/utils";
import useAppChannel from "@dashboard/components/AppLayout/AppChannelContext";
import ChannelsAvailabilityDialog from "@dashboard/components/ChannelsAvailabilityDialog";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { DEFAULT_INITIAL_SEARCH_DATA, VALUES_PAGINATE_BY } from "@dashboard/config";
import {
  ProductChannelListingErrorFragment,
  ProductErrorWithAttributesFragment,
  useProductChannelListingUpdateMutation,
  useProductCreateMutation,
  useProductDeleteMutation,
  useProductTypeQuery,
  useProductVariantChannelListingUpdateMutation,
  useVariantCreateMutation,
} from "@dashboard/graphql";
import useChannels from "@dashboard/hooks/useChannels";
import useNavigator from "@dashboard/hooks/useNavigator";
import useNotifier from "@dashboard/hooks/useNotifier";
import useShop from "@dashboard/hooks/useShop";
import { getMutationErrors } from "@dashboard/misc";
import ProductCreatePage, {
  ProductCreateData,
} from "@dashboard/products/components/ProductCreatePage";
import {
  productAddUrl,
  ProductCreateUrlDialog,
  ProductCreateUrlQueryParams,
  productUrl,
} from "@dashboard/products/urls";
import useCategorySearch from "@dashboard/searches/useCategorySearch";
import useCollectionSearch from "@dashboard/searches/useCollectionSearch";
import usePageSearch from "@dashboard/searches/usePageSearch";
import useProductSearch from "@dashboard/searches/useProductSearch";
import useProductTypeSearch from "@dashboard/searches/useProductTypeSearch";
import useWarehouseSearch from "@dashboard/searches/useWarehouseSearch";
import { getProductErrorMessage } from "@dashboard/utils/errors";
import useAttributeValueSearchHandler from "@dashboard/utils/handlers/attributeValueSearchHandler";
import createDialogActionHandlers from "@dashboard/utils/handlers/dialogActionHandlers";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import { warehouseAddPath } from "@dashboard/warehouses/urls";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { PRODUCT_CREATE_FORM_ID } from "./consts";
import { createHandler } from "./handlers";

interface ProductCreateProps {
  params: ProductCreateUrlQueryParams;
}

export const ProductCreateView = ({ params }: ProductCreateProps) => {
  const navigate = useNavigator();
  const notify = useNotifier();
  const shop = useShop();
  const intl = useIntl();
  const [productCreateComplete, setProductCreateComplete] = React.useState(false);
  const selectedProductTypeId = params["product-type-id"];
  const handleSelectProductType = (productTypeId: string) =>
    navigate(
      productAddUrl({
        ...params,
        "product-type-id": productTypeId,
      }),
    );
  const [openModal, closeModal] = createDialogActionHandlers<
    ProductCreateUrlDialog,
    ProductCreateUrlQueryParams
  >(navigate, params => productAddUrl(params), params);
  const {
    loadMore: loadMoreCategories,
    search: searchCategory,
    result: searchCategoryOpts,
  } = useCategorySearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA,
  });
  const {
    loadMore: loadMoreCollections,
    search: searchCollection,
    result: searchCollectionOpts,
  } = useCollectionSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA,
  });
  const {
    loadMore: loadMoreProductTypes,
    search: searchProductTypes,
    result: searchProductTypesOpts,
  } = useProductTypeSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA,
  });
  const {
    loadMore: loadMorePages,
    search: searchPages,
    result: searchPagesOpts,
  } = usePageSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA,
  });
  const {
    loadMore: loadMoreProducts,
    search: searchProducts,
    result: searchProductsOpts,
  } = useProductSearch({
    variables: DEFAULT_INITIAL_SEARCH_DATA,
  });
  const {
    loadMore: loadMoreAttributeValues,
    search: searchAttributeValues,
    result: searchAttributeValuesOpts,
    reset: searchAttributeReset,
  } = useAttributeValueSearchHandler(DEFAULT_INITIAL_SEARCH_DATA);
  const { data: selectedProductType } = useProductTypeQuery({
    variables: {
      id: selectedProductTypeId,
      firstValues: VALUES_PAGINATE_BY,
    },
    skip: !selectedProductTypeId,
  });
  const productTypes = mapEdgesToItems(searchProductTypesOpts?.data?.search) || [];
  const { availableChannels } = useAppChannel(false);
  const allChannels: ChannelData[] = createSortedChannelsData(availableChannels);
  const {
    channelListElements,
    channelsToggle,
    currentChannels,
    handleChannelsConfirm,
    handleChannelsModalClose,
    handleChannelsModalOpen,
    isChannelSelected,
    isChannelsModalOpen,
    setCurrentChannels,
    toggleAllChannels,
  } = useChannels(
    allChannels,
    params?.action,
    {
      closeModal,
      openModal,
    },
    {
      formId: PRODUCT_CREATE_FORM_ID,
    },
  );

  const channnelsId = useMemo(() => currentChannels.map(channel => channel.id), [currentChannels]);

  const { loadMore: fetchMoreWarehouses, result: searchWarehousesResult } = useWarehouseSearch({
    variables: {
      first: 100,
      channnelsId,
      query: "",
    },
    skip: !currentChannels.length,
  });

  const handleSuccess = (productId: string) => {
    notify({
      status: "success",
      text: intl.formatMessage({
        id: "DO8+uV",
        defaultMessage: "Product created",
      }),
    });
    navigate(productUrl(productId));
  };
  const [updateChannels, updateChannelsOpts] = useProductChannelListingUpdateMutation({});
  const [updateVariantChannels, updateVariantChannelsOpts] =
    useProductVariantChannelListingUpdateMutation({});
  const [productCreate, productCreateOpts] = useProductCreateMutation({});
  const [deleteProduct] = useProductDeleteMutation({});
  const [productVariantCreate, productVariantCreateOpts] = useVariantCreateMutation({
    onCompleted: data => {
      const errors = data.productVariantCreate.errors;

      if (errors.length) {
        errors.map(error =>
          notify({
            status: "error",
            text: getProductErrorMessage(error, intl),
          }),
        );
      }
    },
  });
  const handleSubmit = async (data: ProductCreateData) => {
    const errors = await createHandler(
      selectedProductType?.productType,
      variables => productCreate({ variables }),
      variables => productVariantCreate({ variables }),
      updateChannels,
      updateVariantChannels,
      deleteProduct,
    )(data);

    if (!errors) {
      setProductCreateComplete(true);
    }

    return errors;
  };

  React.useEffect(() => {
    const productId = productCreateOpts.data?.productCreate?.product?.id;

    if (productCreateComplete && productId) {
      handleSuccess(productId);
    }
  }, [productCreateComplete]);

  const fetchMoreProductTypes = {
    hasMore: searchProductTypesOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchProductTypesOpts.loading,
    onFetchMore: loadMoreProductTypes,
  };
  const fetchMoreCollections = {
    hasMore: searchCollectionOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchCollectionOpts.loading,
    onFetchMore: loadMoreCollections,
  };
  const fetchMoreCategories = {
    hasMore: searchCategoryOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchCategoryOpts.loading,
    onFetchMore: loadMoreCategories,
  };
  const fetchMoreReferencePages = {
    hasMore: searchPagesOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchPagesOpts.loading,
    onFetchMore: loadMorePages,
  };
  const fetchMoreReferenceProducts = {
    hasMore: searchProductsOpts.data?.search?.pageInfo?.hasNextPage,
    loading: searchProductsOpts.loading,
    onFetchMore: loadMoreProducts,
  };
  const fetchMoreAttributeValues = {
    hasMore: !!searchAttributeValuesOpts.data?.attribute?.choices?.pageInfo?.hasNextPage,
    loading: !!searchAttributeValuesOpts.loading,
    onFetchMore: loadMoreAttributeValues,
  };
  const loading =
    productCreateOpts.loading ||
    productVariantCreateOpts.loading ||
    updateChannelsOpts.loading ||
    updateVariantChannelsOpts.loading;
  const channelsErrors = [
    ...getMutationErrors(updateVariantChannelsOpts),
    ...getMutationErrors(updateChannelsOpts),
  ] as ProductChannelListingErrorFragment[];
  const errors = [
    ...getMutationErrors(productCreateOpts),
    ...getMutationErrors(productVariantCreateOpts),
  ] as ProductErrorWithAttributesFragment[];

  return (
    <>
      <WindowTitle
        title={intl.formatMessage({
          id: "PXx4Jk",
          defaultMessage: "Create Product",
          description: "window title",
        })}
      />
      {!!allChannels?.length && (
        <ChannelsAvailabilityDialog
          isSelected={isChannelSelected}
          channels={allChannels}
          onChange={channelsToggle}
          onClose={handleChannelsModalClose}
          open={isChannelsModalOpen}
          title={intl.formatMessage({
            id: "Eau5AV",
            defaultMessage: "Manage Products Channel Availability",
          })}
          confirmButtonState="default"
          selected={channelListElements.length}
          onConfirm={handleChannelsConfirm}
          toggleAll={toggleAllChannels}
        />
      )}
      <ProductCreatePage
        allChannelsCount={allChannels?.length}
        currentChannels={currentChannels}
        categories={mapEdgesToItems(searchCategoryOpts?.data?.search) || []}
        collections={mapEdgesToItems(searchCollectionOpts?.data?.search) || []}
        attributeValues={mapEdgesToItems(searchAttributeValuesOpts?.data?.attribute?.choices) ?? []}
        loading={loading}
        channelsErrors={channelsErrors}
        errors={errors}
        fetchCategories={searchCategory}
        fetchCollections={searchCollection}
        fetchProductTypes={searchProductTypes}
        fetchAttributeValues={searchAttributeValues}
        header={intl.formatMessage({
          id: "NBP8uu",
          defaultMessage: "New Product",
          description: "page header",
        })}
        productTypes={productTypes}
        onSubmit={handleSubmit}
        onWarehouseConfigure={() => navigate(warehouseAddPath)}
        saveButtonBarState={productCreateOpts.status}
        fetchMoreCategories={fetchMoreCategories}
        fetchMoreCollections={fetchMoreCollections}
        fetchMoreProductTypes={fetchMoreProductTypes}
        weightUnit={shop?.defaultWeightUnit}
        openChannelsModal={handleChannelsModalOpen}
        onChannelsChange={setCurrentChannels}
        assignReferencesAttributeId={params.action === "assign-attribute-value" && params.id}
        referencePages={mapEdgesToItems(searchPagesOpts?.data?.search) || []}
        referenceProducts={mapEdgesToItems(searchProductsOpts?.data?.search) || []}
        referenceCategories={mapEdgesToItems(searchCategoryOpts?.data?.search) || []}
        referenceCollections={mapEdgesToItems(searchCollectionOpts?.data?.search) || []}
        fetchReferencePages={searchPages}
        fetchMoreReferencePages={fetchMoreReferencePages}
        fetchReferenceProducts={searchProducts}
        fetchMoreReferenceProducts={fetchMoreReferenceProducts}
        fetchMoreAttributeValues={fetchMoreAttributeValues}
        onCloseDialog={currentParams => navigate(productAddUrl(currentParams))}
        selectedProductType={selectedProductType?.productType}
        onSelectProductType={handleSelectProductType}
        onAttributeSelectBlur={searchAttributeReset}
        fetchMoreWarehouses={fetchMoreWarehouses}
        searchWarehousesResult={searchWarehousesResult}
      />
    </>
  );
};
export default ProductCreateView;
