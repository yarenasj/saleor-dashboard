import { PRODUCT_TYPES } from "@data/e2eTestData";
import { ProductTypePage } from "@pages/productTypePage";
import { expect } from "@playwright/test";
import * as faker from "faker";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

const productTypeName = `e2e-product-type-${faker.datatype.number()}`;

test("TC: SALEOR_46 Create basic product type #e2e #product-type", async ({ page }) => {
  const productTypePage = new ProductTypePage(page);

  await productTypePage.gotoProductTypeListPage();
  await productTypePage.clickCreateProductTypeButton();
  await productTypePage.typeProductTypeName(productTypeName);
  await productTypePage.makeProductShippableWithWeight();
  await productTypePage.clickSaveButton();
  await productTypePage.expectSuccessBanner();
  await expect(productTypePage.nameInput).toHaveValue(productTypeName);
});
test("TC: SALEOR_47 Create gift card product type #e2e #product-type", async ({ page }) => {
  const productTypePage = new ProductTypePage(page);
  await createBasicProductType(productTypePage, productTypeName);
  await expect(productTypePage.nameInput).toHaveValue(productTypeName);
});
test("TC: SALEOR_48 As a admin I can edit product type #e2e #product-type", async ({ page }) => {
  const productTypePage = new ProductTypePage(page);
  const updatedProductTypeName = `updated-e2e-product-type-${faker.datatype.number()}`;

  const productTypeId = await createBasicProductType(productTypePage, productTypeName);
  await productTypePage.gotoExistingProductTypePage(productTypeId);
  await productTypePage.updateProductTypeName(updatedProductTypeName);
  await productTypePage.makeProductShippableWithWeight();
  await productTypePage.clickSaveButton();
  await productTypePage.expectSuccessBanner();
  await expect(productTypePage.isShippingRequired).toBeChecked();
  await expect(productTypePage.shippingWeightInput).toHaveValue("10");
  await expect(productTypePage.nameInput).toHaveValue(updatedProductTypeName);
});
test("TC: SALEOR_49 As a admin user I can delete product type #e2e #product-type", async ({
  page,
}) => {
  const productTypePage = new ProductTypePage(page);
  const productTypeName = `e2e-product-type-${faker.datatype.number()}`;
  const productTypeId = await createBasicProductType(productTypePage, productTypeName);

  await productTypePage.gotoExistingProductTypePage(productTypeId);
  await productTypePage.clickDeleteButton();
  await productTypePage.deleteProductTypeDialog.clickConfirmDeleteButton();
  await productTypePage.expectSuccessBanner();
  await productTypePage.productTypeList.waitFor({
    state: "visible",
    timeout: 50000,
  });
  await expect(productTypePage.productTypeList).not.toContainText(productTypeName);
});
test("TC: SALEOR_50 As a admin user I can delete several product types #e2e #product-type", async ({
  page,
}) => {
  const productTypePage = new ProductTypePage(page);
  const productTypeName2 = `e2e-product-type-${faker.datatype.number()}`;
  let productTypeId = await createBasicProductType(productTypePage, productTypeName2);
  productTypeId = productTypeId.replace("%3D", "=");

  await productTypePage.gotoProductTypeListPage();
  await expect(productTypePage.productTypeList).toBeVisible();
  await productTypePage.page.waitForTimeout(1000);
  await productTypePage.checkProductTypesOnList([productTypeId]);
  await productTypePage.clickBulkDeleteButton();
  await productTypePage.deleteProductTypeDialog.clickConfirmDeleteButton();
  await productTypePage.expectSuccessBanner();
  await productTypePage.productTypeList.waitFor({
    state: "visible",
    timeout: 50000,
  });
  await expect(productTypePage.productTypeList).not.toContainText(productTypeName2);
});

async function createBasicProductType(productTypePage: ProductTypePage, productTypeName: string) {
  await productTypePage.gotoAddProductTypePage();
  await productTypePage.typeProductTypeName(productTypeName);
  await productTypePage.selectGiftCardButton();
  await productTypePage.clickSaveButton();
  await productTypePage.expectSuccessBanner();
  const currentUrl = productTypePage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  return pathSegments.filter(Boolean).pop() || "test";
}
