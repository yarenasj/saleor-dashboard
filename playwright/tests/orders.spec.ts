import { ADDRESS } from "@data/addresses";
import { ORDERS, PRODUCTS } from "@data/e2eTestData";
import { AddressesListPage } from "@pages/addressesListPage";
import { AddressDialog } from "@pages/dialogs/addressDialog";
import { DraftOrdersPage } from "@pages/draftOrdersPage";
import { AddressForm } from "@pages/forms/addressForm";
import { FulfillmentPage } from "@pages/fulfillmentPage";
import { OrdersPage } from "@pages/ordersPage";
import { expect } from "@playwright/test";
import * as faker from "faker";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

let ordersPage: OrdersPage;
let draftOrdersPage: DraftOrdersPage;
let fulfillmentPage: FulfillmentPage;
let addressDialog: AddressDialog;
let addressForm: AddressForm;
let addressesListPage: AddressesListPage;

test.beforeEach(({ page }) => {
  ordersPage = new OrdersPage(page);
  draftOrdersPage = new DraftOrdersPage(page);
  fulfillmentPage = new FulfillmentPage(page);
  addressDialog = new AddressDialog(page);
  addressesListPage = new AddressesListPage(page);
  addressForm = new AddressForm(page);
});

const variantSKU = PRODUCTS.productAvailableWithTransactionFlow.variant1sku;

test("TC: SALEOR_28 Create basic order #e2e #order", async () => {
  await createOrder();
  await draftOrdersPage.expectSuccessBanner({ message: "finalizado" });
});

test("TC: SALEOR_76 Create order with transaction flow activated #e2e #order", async () => {
  await ordersPage.goToOrdersListView();
  await ordersPage.clickCreateOrderButton();
  await ordersPage.orderCreateDialog.completeOrderCreateDialogWithTransactionChannel();
  await ordersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(variantSKU);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.selectCustomer();
  await expect(ordersPage.addressDialog.existingAddressRadioButton).toBeVisible();
  await ordersPage.addressDialog.clickConfirmButton();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  await draftOrdersPage.expectSuccessBanner({ message: "finalizado" });
});

test("TC: SALEOR_77 Mark order as paid and fulfill it with transaction flow activated #e2e #order", async () => {
  const orderId = await createOrder();
  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.clickMarkAsPaidButton();
  await ordersPage.markOrderAsPaidDialog.typeAndSaveOrderReference();
  await ordersPage.expectSuccessBanner({ message: "pagado" });
  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "pagado" });
  await expect(ordersPage.pageHeaderStatusInfo).toContainText("Completada");
});

test("TC: SALEOR_79 Mark order as paid and fulfill it with regular flow #e2e #order", async () => {
  const orderId = await createOrder();
  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.clickMarkAsPaidButton();
  await ordersPage.markOrderAsPaidDialog.typeAndSaveOrderReference();
  await ordersPage.expectSuccessBanner({ message: "pagado" });
  await expect(ordersPage.balanceStatusInfo).toHaveText("Settled");
  expect(await ordersPage.paymentStatusInfo, "Order should be fully paid").toContainText(
    "Totalmente Pagado",
  );

  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "pagado" });
  await expect(ordersPage.pageHeaderStatusInfo).toContainText("Completada");
});

test("TC: SALEOR_80 Add tracking to order #e2e #order", async () => {
  const orderId = await createOrder();
  await completeOrder(orderId);
  const trackingNumber = "123456789";

  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.clickAddTrackingButton();
  await ordersPage.addTrackingDialog.typeTrackingNumberAndSave(trackingNumber);
  await ordersPage.expectSuccessBanner({ message: "actualizado" });
  await expect(ordersPage.setTrackingNumber).toContainText(trackingNumber);
});

test("TC: SALEOR_81 Change billing address in fulfilled order #e2e #order", async () => {
  const orderId = await createOrder();
  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.rightSideDetailsPage.clickEditBillingAddressButton();
  await ordersPage.addressDialog.clickNewAddressRadioButton();

  const newAddress = ADDRESS.addressPL;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressDialog.clickConfirmButton();

  await ordersPage.expectSuccessBanner();

  await addressesListPage.verifyRequiredAddressFields(newAddress.firstName, newAddress);
  await addressesListPage.verifyPhoneField(newAddress.firstName, newAddress);
  await addressesListPage.verifyAddressLine2Field(newAddress.firstName, newAddress);
});

test("TC: SALEOR_82 Change shipping address in not fulfilled order #e2e #order", async () => {
  const orderId = await createOrder();
  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.rightSideDetailsPage.clickEditShippingAddressButton();
  await ordersPage.addressDialog.clickNewAddressRadioButton();

  const newAddress = ADDRESS.addressPL;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  addressDialog.clickConfirmButton();
  await ordersPage.expectSuccessBanner();
  await addressesListPage.verifyRequiredAddressFields(newAddress.firstName, newAddress);
  await addressesListPage.verifyPhoneField(newAddress.firstName, newAddress);
  await addressesListPage.verifyCompanyField(newAddress.firstName, newAddress);
  await addressesListPage.verifyAddressLine2Field(newAddress.firstName, newAddress);
  await expect(ordersPage.rightSideDetailsPage.shippingAddressSection).toContainText(
    ADDRESS.addressPL.firstName,
  );
});

test("TC: SALEOR_83 Draft orders bulk delete #e2e #draft", async () => {
  await draftOrdersPage.goToDraftOrdersListView();
  await draftOrdersPage.checkListRowsBasedOnIndexes([0]);
  await draftOrdersPage.clickBulkDeleteButton();
  await draftOrdersPage.deleteDraftOrdersDialog.clickDeleteButton();
  await draftOrdersPage.expectSuccessBanner();
  await draftOrdersPage.waitForGrid();
  await expect(
    await draftOrdersPage.findRowIndexBasedOnText(PRODUCTS.productsToBeBulkDeleted.names),
    `Given draft orders: ${ORDERS.draftOrdersToBeDeleted.ids} should be deleted from the list`,
  ).toEqual([]);
});

test("TC: SALEOR_217 Complete basic order for non existing customer #e2e #order", async () => {
  const nonExistingEmail = `customer-${faker.datatype.number()}@example.com`;
  const newAddress = ADDRESS.addressPL;

  await createDraftOrder();
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.typeAndSelectCustomerEmail(nonExistingEmail);
  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressDialog.clickConfirmButton();
  await ordersPage.expectSuccessBanner();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  await ordersPage.expectSuccessBanner({ message: "finalizado" });
});

async function createDraftOrder() {
  await ordersPage.goToOrdersListView();
  await ordersPage.clickCreateOrderButton();
  await ordersPage.orderCreateDialog.completeOrderCreateDialogWithFirstChannel();
  await ordersPage.clickAddProductsButton();
  await draftOrdersPage.addProductsDialog.selectVariantBySKU(variantSKU);
  await draftOrdersPage.addProductsDialog.clickConfirmButton();
}

async function createOrder() {
  await createDraftOrder();
  await ordersPage.rightSideDetailsPage.clickEditCustomerButton();
  await ordersPage.rightSideDetailsPage.clickSearchCustomerInput();
  await ordersPage.rightSideDetailsPage.selectCustomer();
  await ordersPage.addressDialog.clickConfirmButton();
  await ordersPage.clickAddShippingCarrierButton();
  await ordersPage.shippingAddressDialog.pickAndConfirmFirstShippingMethod();
  await ordersPage.clickFinalizeButton();
  const currentUrl = ordersPage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  return pathSegments.filter(Boolean).pop() || "test";
}

async function completeOrder(orderId: string) {
  await ordersPage.goToExistingOrderPage(orderId);
  await ordersPage.clickFulfillButton();
  await fulfillmentPage.clickFulfillButton();
  await ordersPage.expectSuccessBanner({ message: "enviados" });
}
