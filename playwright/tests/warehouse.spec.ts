import { WAREHOUSES } from "@data/e2eTestData";
import { WarehousePage } from "@pages/warehousePage";
import { expect } from "@playwright/test";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

let warehousePage: WarehousePage;

test.beforeEach(({ page }) => {
  warehousePage = new WarehousePage(page);
});
test("TC: SALEOR_55 Create basic warehouse #e2e #warehouse", async () => {
  await createWarehouse();
});
test("TC: SALEOR_56 Edit warehouse #e2e #warehouse", async () => {
  await warehousePage.gotoExistingWarehousePage(WAREHOUSES.warehouseToBeEdited.id);
  await warehousePage.typeWarehouseName("edited warehouse");
  await warehousePage.typeCompanyName("Umbrella");
  await warehousePage.typeAddressLine1("edited warehouse address 1");
  await warehousePage.typeAddressLine2("edited warehouse address 2");
  await warehousePage.typePhone("+48655922888");
  await warehousePage.rightSideDetailsPage.clickPublicStockButton();
  await warehousePage.clickSaveButton();
  await warehousePage.basePage.expectSuccessBanner();
});
test("TC: SALEOR_57 Delete warehouse #e2e #warehouse", async () => {
  await warehousePage.gotoWarehouseListView();
  await warehousePage.clickDeleteWarehouseButton(WAREHOUSES.warehouseToBeDeleted.name);
  await warehousePage.deleteWarehouseDialog.clickDeleteButton();
  await warehousePage.expectSuccessBanner();
  await expect(warehousePage.warehousesList).not.toContainText(
    WAREHOUSES.warehouseToBeDeleted.name,
  );
});

async function createWarehouse() {
  await warehousePage.gotoWarehouseListView();
  await warehousePage.clickCreateNewWarehouseButton();
  await warehousePage.completeWarehouseForm();
  await warehousePage.clickSaveButton();
  await warehousePage.basePage.expectSuccessBanner();
}
