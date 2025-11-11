import { CHANNELS, SHIPPING_METHODS, WAREHOUSES } from "@data/e2eTestData";
import { ShippingMethodsPage } from "@pages/shippingMethodsPage";
import { ShippingRatesPage } from "@pages/shippingRatesPage";
import { expect } from "@playwright/test";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

let shippingMethodsPage: ShippingMethodsPage;
let shippingRatesPage: ShippingRatesPage;

test.beforeEach(({ page }) => {
  test.slow();
  shippingMethodsPage = new ShippingMethodsPage(page);
  shippingRatesPage = new ShippingRatesPage(page);
});
test("TC: SALEOR_31 Create basic shipping method #shipping-method #e2e", async () => {
  await createShippingMethod();
});
test("TC: SALEOR_36 Delete shipping zones in bulk #shipping-method #e2e", async () => {
  await shippingMethodsPage.gotoListView();
  await shippingMethodsPage.checkListRowsBasedOnContainingText(["e2e shipping zone -"]);
  await shippingMethodsPage.clickBulkDeleteGridRowsButton();
  await shippingMethodsPage.deleteShippingMethodDialog.clickDeleteButton();
  await shippingMethodsPage.expectSuccessBanner();
});
test("TC: SALEOR_37 Update a shipping method #shipping-method #e2e", async () => {
  const { shippingMethodId, name } = await createShippingMethod();
  const channelSection = shippingMethodsPage.rightSideDetailsPage.channelSection;
  const alreadyAssignedChannels = [CHANNELS.channelPLN.name];
  const channelsToBeAssigned = [CHANNELS.defaultChannel.name];

  const warehouseSection = shippingMethodsPage.rightSideDetailsPage.warehouseSection;
  const alreadyAssignedWarehouses = [WAREHOUSES.warehouseEurope.name];
  const warehousesToBeAssigned = [WAREHOUSES.warehouseAmericas.name];

  await shippingMethodsPage.gotoExistingShippingMethod(shippingMethodId, name);

  await shippingMethodsPage.rightSideDetailsPage.expectOptionsSelected(
    channelSection,
    alreadyAssignedChannels,
  );
  await shippingMethodsPage.rightSideDetailsPage.clickChannelsSelectShippingPage();
  await shippingMethodsPage.rightSideDetailsPage.selectChannelShippingPage(
    CHANNELS.defaultChannel.name,
  );

  await shippingMethodsPage.rightSideDetailsPage.expectOptionsSelected(
    warehouseSection,
    alreadyAssignedWarehouses,
  );
  await shippingMethodsPage.rightSideDetailsPage.clickWarehouseSelectShippingPage();
  await shippingMethodsPage.rightSideDetailsPage.typeAndSelectMultipleWarehousesShippingPage(
    warehousesToBeAssigned,
  );

  await shippingMethodsPage.saveShippingZone();
  await shippingMethodsPage.expectSuccessBanner();

  const updatedChannelsList = [...alreadyAssignedChannels, ...channelsToBeAssigned];
  const updatedWarehousesList = [...alreadyAssignedWarehouses, ...warehousesToBeAssigned];

  await shippingMethodsPage.rightSideDetailsPage.expectOptionsSelected(
    channelSection,
    updatedChannelsList,
  );
  await shippingMethodsPage.rightSideDetailsPage.expectOptionsSelected(
    warehouseSection,
    updatedWarehousesList,
  );
});

async function createShippingMethod() {
  await shippingMethodsPage.gotoListView();
  await shippingMethodsPage.clickCreateShippingZoneButton();
  const name = await shippingMethodsPage.typeShippingZoneName();
  await shippingMethodsPage.typeShippingZoneDescription();
  await shippingMethodsPage.clickAssignCountryButton();
  await shippingMethodsPage.assignCountriesDialog.checkAndSaveSingleCountry();
  await shippingMethodsPage.saveShippingZone();
  await shippingMethodsPage.expectSuccessBanner();
  await shippingMethodsPage.rightSideDetailsPage.clickChannelsSelectShippingPage();
  await shippingMethodsPage.rightSideDetailsPage.selectSingleChannelShippingPage();
  await shippingMethodsPage.rightSideDetailsPage.clickWarehouseSelectShippingPage();
  await shippingMethodsPage.rightSideDetailsPage.typeAndSelectSingleWarehouseShippingPage();
  await shippingMethodsPage.saveShippingZone();
  await shippingMethodsPage.expectSuccessBanner();
  const currentUrl = shippingMethodsPage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  const shippingMethodId = pathSegments.filter(Boolean).pop() || "test";
  return {
    shippingMethodId,
    name,
  };
}
