import { AVAILABILITY } from "@data/copy";
import { PRODUCTS } from "@data/e2eTestData";
import { ProductCreateDialog } from "@pages/dialogs/productCreateDialog";
import { ProductPage } from "@pages/productPage";
import { VariantsPage } from "@pages/variantsPage";
import { expect } from "@playwright/test";
import { test } from "utils/testWithPermission";
import faker from "faker";

test.use({ permissionName: "admin" });

let productPage: ProductPage;
let productCreateDialog: ProductCreateDialog;
let variantsPage: VariantsPage;

test.beforeEach(({ page }) => {
  productPage = new ProductPage(page);
  productCreateDialog = new ProductCreateDialog(page);
  variantsPage = new VariantsPage(page);
});
test("TC: SALEOR_33 Create basic product with variants #e2e #product", async () => {
  await productPage.gotoProductListPage();
  await productPage.clickCreateProductButton();
  await productCreateDialog.selectProductTypeWithVariants();
  await productCreateDialog.clickConfirmButton();
  await productPage.typeNameDescAndRating();
  await productPage.selectFirstCategory();
  await productPage.fillAllPriceFields("10");
  await productPage.clickSaveButton();
  await productPage.expectSuccessBanner();
});
test("TC: SALEOR_32 Create basic - single product type - product without variants #e2e #product", async () => {
  await createBasicProduct();
});
test("TC: SALEOR_35 Create basic info variant - via edit variant page #e2e #product", async () => {
  const variantName = `TC: SALEOR_26 - variant name - ${new Date().toISOString()}`;

  await createProductVariant(PRODUCTS.productWithOneVariant.id, variantName);
  await expect(
    variantsPage.variantsList.locator(variantsPage.variantsNames, {
      hasText: variantName,
    }),
    `New variant name: ${variantName} should be visible on the list`,
  ).toBeVisible();
});
test("TC: SALEOR_36 Create full info variant - via edit variant page #e2e #product", async () => {
  const variantName = `TC: SALEOR_27 - variant name - ${new Date().toISOString()}`;
  const productId = await createBasicProduct();
  await productPage.gotoExistingProductPage(productId);
  await productPage.clickFirstAddVariantButton();
  await variantsPage.typeVariantName(variantName);
  await variantsPage.clickMageChannelsButton();
  await variantsPage.channelSelectDialog.clickAllChannelsCheckbox();
  await variantsPage.channelSelectDialog.selectChannel("Channel-PLN");
  await variantsPage.channelSelectDialog.clickConfirmButton();
  await variantsPage.typeCheckoutLimit();
  await variantsPage.typeShippingWeight();
  await variantsPage.typeSellingPriceInChannel("PLN");
  await variantsPage.typeSku(faker.name.firstName());
  await variantsPage.clickSaveVariantButton();
  await variantsPage.expectSuccessBanner();
  await expect(
    variantsPage.variantsList.locator(variantsPage.variantsNames, {
      hasText: variantName,
    }),
    `New variant name: ${variantName} should be visible on the list`,
  ).toBeVisible();
  await variantsPage.selectWarehouse();
  await variantsPage.typeQuantityInStock();
  await variantsPage.clickSaveVariantButton();
  await variantsPage.expectSuccessBanner();
});
test("TC: SALEOR_37 As an admin I should be able to delete a several products @basic-regression #product #e2e", async () => {
  await createBasicProduct("a product to be deleted via bulk");
  await productPage.gotoProductListPage(
    "?0%5Bs0.productType%5D=single-product-type&asc=false&sort=date",
  );
  await productPage.checkListRowsBasedOnContainingText(PRODUCTS.productsToBeBulkDeleted.names);

  await productPage.clickBulkDeleteGridRowsButton();
  await productPage.clickBulkDeleteButton();
  await productPage.deleteProductDialog.clickDeleteButton();
  await productPage.expectSuccessBanner();
  await productPage.gotoProductListPage();

  expect(
    await productPage.findRowIndexBasedOnText(PRODUCTS.productsToBeBulkDeleted.names),
    `Given products: ${PRODUCTS.productsToBeBulkDeleted.names} should be deleted from the list`,
  ).toEqual([]);
});
test("TC: SALEOR_38 As an admin I should be able to delete a single products @basic-regression #product #e2e", async () => {
  const productId = await createBasicProduct("a product to be deleted");
  await productPage.gotoExistingProductPage(productId);
  await productPage.clickDeleteProductButton();
  await productPage.deleteProductDialog.clickDeleteButton();
  await productPage.expectSuccessBanner({ message: "Producto eliminado" });
  await productPage.waitForGrid();
  await productPage.searchforProduct("a product to be deleted");
  await expect(
    productPage.gridCanvas.filter({
      hasText: "a product to be deleted",
    }),
  ).not.toBeVisible();
});
test("TC: SALEOR_39 As an admin, I should be able to update a product by uploading media and assigning channels @basic-regression #product #e2e", async () => {
  const productId = await createBasicProduct();

  await productPage.gotoExistingProductPage(productId);
  await productPage.clickUploadMediaButton();
  await productPage.uploadProductImage("beer.avif");
  await productPage.productImage.waitFor({ state: "visible" });
  await productPage.rightSideDetailsPage.selectOneChannelAsAvailableWhenNoneSelected("Channel-PLN");
  await productPage.clickSaveButton();
  await productPage.expectSuccessBanner();
  await expect(
    productPage.productAvailableInChannelsText,
    "Label copy shows 1 out of 7 channels ",
  ).toContainText(AVAILABILITY.in1OutOf);
  expect(
    await productPage.productImage.count(),
    "Newly added single image should be present",
  ).toEqual(1);
});
test("TC: SALEOR_40 As an admin, I should be able to search products on list view @basic-regression #product #e2e", async () => {
  await productPage.gotoProductListPage();
  await productPage.searchAndFindRowIndexes("apple");
  await productPage.checkListRowsBasedOnContainingText(["Apple"]);
  expect(
    await productPage.gridCanvas.locator("table tbody tr").count(),
    "There should be only one product visible on list",
  ).toEqual(1);
});
test("TC: SALEOR_41 As an admin I should be able use pagination on product list view @basic-regression #product #e2e", async () => {
  await productPage.gotoProductListPage();

  const firstPageProductName = await productPage.getGridCellText(0, 0);

  await productPage.clickNextPageButton();
  await productPage.waitForGrid();

  const secondPageProductName = await productPage.getGridCellText(1, 1);

  expect(
    firstPageProductName,
    `Second side first product name: ${secondPageProductName} should be visible and be different than: ${firstPageProductName}`,
  ).not.toEqual(secondPageProductName);
  await expect(
    productPage.gridCanvas,
    `Product from first page: ${firstPageProductName} should not be visible`,
  ).not.toContainText(firstPageProductName);
  await productPage.clickPreviousPageButton();
  await productPage.waitForGrid();
  await expect(
    productPage.gridCanvas,
    `Product from first page: ${firstPageProductName} should be visible again`,
  ).toContainText(firstPageProductName);
});
test("TC: SALEOR_42 As an admin I should be able to filter products by channel on product list view @basic-regression #product #e2e", async () => {
  await productPage.gotoProductListPage();
  await productPage.searchAndFindRowIndexes(PRODUCTS.productAvailableOnlyInUsdChannel.name);
  expect(
    await productPage.gridCanvas.locator("table tbody tr").count(),
    `Product: ${PRODUCTS.productAvailableOnlyInUsdChannel.name} should be visible on grid table`,
  ).toEqual(1);
  await productPage.typeInSearchOnListView("");
  await productPage.clickFilterButton();
  await productPage.filtersPage.pickFilter("Channel", "Only channel");
  await productPage.filtersPage.clickSaveFiltersButton();
  await expect(
    productPage.gridCanvas,
    `Product: ${PRODUCTS.productAvailableOnlyInPlnChannel.name} should be visible on grid table`,
  ).toContainText(PRODUCTS.productAvailableOnlyInPlnChannel.name);
});
test("TC: SALEOR_43 As an admin I should be able update existing variant @basic-regression #product #e2e", async () => {
  const variantName = `TC: SALEOR_60 - variant name - ${new Date().toISOString()}`;
  const sku = `SALEOR_60-sku-${new Date().toISOString()}`;
  const productId = await createBasicProduct();
  const variantId = await createProductVariant(productId, variantName);

  await variantsPage.gotoExistingVariantPage(productId, variantId);
  await variantsPage.typeVariantName(variantName);
  await variantsPage.clickMageChannelsButton();
  await variantsPage.channelSelectDialog.clickAllChannelsCheckbox();
  await variantsPage.channelSelectDialog.selectChannel("Channel-PLN");
  await variantsPage.channelSelectDialog.clickConfirmButton();
  await variantsPage.typeCheckoutLimit("50");
  await variantsPage.typeShippingWeight("1000");
  await variantsPage.typeSellingPriceInChannel("PLN", "120");
  await variantsPage.typeCostPriceInChannel("PLN", "100");
  await variantsPage.typeSku(sku);
  await variantsPage.selectWarehouse("Africa");
  await variantsPage.typeQuantityInStock("Africa", "5000");
  await variantsPage.clickSaveVariantButton();
  await variantsPage.expectSuccessBanner();
  await expect(
    variantsPage.variantsList.locator(variantsPage.variantsNames, {
      hasText: variantName,
    }),
    `Updated name: ${variantName} should be visible on list`,
  ).toBeVisible();
});
test("TC: SALEOR_44 As an admin I should be able to delete existing variant @basic-regression #product #e2e", async () => {
  const variantName = `TC: SALEOR_61 - variant name - ${new Date().toISOString()}`;
  const productId = await createBasicProduct();
  const variantId = await createProductVariant(productId, variantName);

  await variantsPage.gotoExistingVariantPage(productId, variantId);
  await variantsPage.clickDeleteVariantButton();
  await variantsPage.deleteVariantDialog.clickDeleteVariantButton();
  await productPage.expectSuccessBanner();
  expect(
    productPage.page.url(),
    "Deleting last variant from variant details page should redirect to product page",
  ).toContain("http://localhost:9000/products/" + productId);
});
test("TC: SALEOR_45 As an admin I should be able to bulk delete existing variants @basic-regression #product #e2e", async () => {
  const variantName = `TC: SALEOR_62 - variant name - ${new Date().toISOString()}`;
  const variantName2 = `TC: SALEOR_62-2 - variant name - ${new Date().toISOString()}`;
  const productId = await createBasicProduct();
  await createProductVariant(productId, variantName);
  await createProductVariant(productId, variantName2);
  await productPage.gotoExistingProductPage(productId);
  await productPage.waitForGrid();
  await productPage.gridCanvas.scrollIntoViewIfNeeded();
  await productPage.clickGridCell(0, 0);
  await productPage.clickGridCell(0, 1);
  await productPage.clickGridCell(0, 2);
  await productPage.clickBulkDeleteGridRowsButton();
  await expect(
    productPage.noVariantsText,
    "Message about how to add new variant should be visible in place of list of variants",
  ).toBeVisible();
  await productPage.clickSaveButton();
  await productPage.expectSuccessBanner();
  await expect(
    productPage.noVariantsText,
    "Message about how to add new variant should be visible in place of list of variants",
  ).toBeVisible();
});

async function createBasicProduct(name?: string) {
  await productPage.gotoCreateProductPage(PRODUCTS.singleProductType.id);
  await productPage.rightSideDetailsPage.selectOneChannelAsAvailableWhenMoreSelected("Channel-PLN");
  await productPage.typeNameDescAndRating(name);
  await productPage.selectFirstCategory();
  await productPage.typeSellingPriceForChannel("PLN");
  await productPage.typeCostPrice("PLN");
  await productPage.clickSaveButton();
  await productPage.expectSuccessBanner();
  const currentUrl = productPage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  return pathSegments.filter(Boolean).pop() || "test";
}

async function createProductVariant(productId: string, variantName: string) {
  await productPage.gotoExistingProductPage(productId);
  await productPage.clickFirstAddVariantButton();
  await variantsPage.typeVariantName(variantName);
  await variantsPage.clickMageChannelsButton();
  await variantsPage.channelSelectDialog.clickAllChannelsCheckbox();
  await variantsPage.channelSelectDialog.selectChannel("Channel-PLN");
  await variantsPage.channelSelectDialog.clickConfirmButton();
  await variantsPage.typeSellingPriceInChannel("PLN");
  await variantsPage.typeCostPriceInChannel("PLN");
  await variantsPage.clickSaveVariantButton();
  await variantsPage.expectSuccessBanner();
  const currentUrl = productPage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  return pathSegments.filter(Boolean).pop() || "test";
}
