import { ADDRESS, AddressFieldsType } from "@data/addresses";
import { CUSTOMERS } from "@data/e2eTestData";
import { AddressesListPage } from "@pages/addressesListPage";
import { CustomersPage } from "@pages/customersPage";
import { AddAddressDialog } from "@pages/dialogs/addAddressDialog";
import { DeleteAddressDialog } from "@pages/dialogs/deleteAddressDialog";
import { AddressForm } from "@pages/forms/addressForm";
import { expect } from "@playwright/test";
import faker from "faker";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "admin" });

let customersPage: CustomersPage;
let addressesListPage: AddressesListPage;
let addressForm: AddressForm;
let deleteAddressDialog: DeleteAddressDialog;
let addAddressDialog: AddAddressDialog;

test.beforeEach(({ page }) => {
  customersPage = new CustomersPage(page);
  addressesListPage = new AddressesListPage(page);
  addressForm = new AddressForm(page);
  addAddressDialog = new AddAddressDialog(page);
  deleteAddressDialog = new DeleteAddressDialog(page);
});

test("TC: SALEOR_199 Create customer #e2e #customer", async () => {
  const { firstName, lastName, note, email } = await createCustomer();
  await expect(customersPage.pageHeader).toContainText(`${firstName} ${lastName}`);
  await expect(customersPage.customerNoteInput).toContainText(note);
  await expect(customersPage.customerFirstNameInput).toHaveValue(firstName);
  await expect(customersPage.customerLastNameInput).toHaveValue(lastName);
  await expect(customersPage.customerEmailInput).toHaveValue(email.toLowerCase());
});

test("TC: SALEOR_200 As an admin I should not be able to create customer with duplicated email #e2e #customer", async () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const note = faker.lorem.sentence();

  await customersPage.goToCustomersListView();
  await customersPage.clickOnCreateCustomer();
  await customersPage.fillFirstAndLastName(firstName, lastName);
  await customersPage.fillEmail(CUSTOMERS.customerToBeDeactivated.email);

  const newAddress = ADDRESS.addressUS;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressForm.selectCountryArea(newAddress.countryArea);
  await customersPage.fillNote(note);
  await customersPage.saveCustomer();
  await customersPage.expectErrorBannerMessage("User with this Email already exists.");
});

test("TC: SALEOR_201 Update customer account info #e2e #customer", async () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const email = faker.internet.email();
  const note = faker.lorem.sentence();

  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.editCustomer.id);
  await customersPage.fillNote(note);
  await customersPage.fillFirstAndLastName(firstName, lastName);
  await customersPage.fillEmail(email);
  await customersPage.saveCustomer();
  await customersPage.expectSuccessBanner();
  await expect(customersPage.pageHeader).toContainText(`${firstName} ${lastName}`);
  await expect(customersPage.customerNoteInput).toContainText(note);
  await expect(customersPage.customerFirstNameInput).toHaveValue(firstName);
  await expect(customersPage.customerLastNameInput).toHaveValue(lastName);
  await expect(customersPage.customerEmailInput).toHaveValue(email.toLowerCase());
});

test("TC: SALEOR_202 Deactivate a customer #e2e #customer", async () => {
  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.customerToBeDeactivated.id);
  await customersPage.customerActiveCheckbox.click();
  await customersPage.saveCustomer();
  await customersPage.expectSuccessBanner();
  await expect(customersPage.customerActiveCheckbox).not.toBeChecked();
});

test("TC: SALEOR_203 Activate a customer #e2e #customer", async () => {
  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.customerToBeActivated.id);
  await customersPage.customerActiveCheckbox.click();
  await customersPage.saveCustomer();
  await customersPage.expectSuccessBanner();
  await expect(customersPage.customerActiveCheckbox).toBeChecked();
});

test("TC: SALEOR_204 Delete customer from the details page #e2e #customer", async () => {
  const { email, customerId } = await createCustomer();
  await customersPage.gotoCustomerDetailsPage(customerId);
  await customersPage.deleteCustomer();
  await customersPage.deleteDialog.clickDeleteButton();
  await customersPage.expectSuccessBanner();
  await customersPage.goToCustomersListView();
  await customersPage.searchForCustomer(email);
  await expect(customersPage.emptyDataGridListView).toBeVisible();
});

test("TC: SALEOR_205 Bulk delete customers #e2e #customer", async () => {
  const { firstName, lastName } = await createCustomer();

  await customersPage.goToCustomersListView();
  await customersPage.searchAndFindRowIndexes(`${firstName} ${lastName}`);
  await customersPage.waitForGrid();

  const rowsToCheck = [0];

  await customersPage.checkGridCellTextAndClick(0, rowsToCheck, [`${firstName} ${lastName}`]);
  await customersPage.clickBulkDeleteGridRowsButton();
  await customersPage.deleteDialog.clickDeleteButton();
  await customersPage.expectSuccessBanner();
  await expect(customersPage.emptyDataGridListView).toBeVisible();
});

test("TC: SALEOR_206 As an admin I want to add address to the customer and set it as default shipping #e2e #customer", async () => {
  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.editCustomer.id);
  const addressUK = ADDRESS.addressUK;
  await addNewAddress(addressUK);

  const addedAddress = addressesListPage.savedAddress.filter({
    hasText: addressUK.lastName,
  });
  const addedAddressCard = addressesListPage.addressCard.filter({
    hasText: addressUK.lastName,
  });

  await expect(addedAddress).toBeVisible();
  await addressesListPage.clickShowMoreMenu(addressUK.lastName);
  await addressesListPage.setAsDeafultShippingAddress();
  await expect(addedAddressCard.locator(addressesListPage.addressTypeTitle)).toHaveText(
    "Dirección de entrega por defecto",
  );

  const newAddressLastName = faker.name.lastName();
  await addressesListPage.clickShowMoreMenu(addressUK.lastName);
  await addressesListPage.clickEditAddress();
  await addressForm.typeLastName(newAddressLastName);
  await addAddressDialog.clickConfirmButton();
  await customersPage.expectSuccessBanner();
  await expect(
    addressesListPage.savedAddress.filter({
      hasText: newAddressLastName,
    }),
  ).toBeVisible();
});

test("TC: SALEOR_209 As an admin I want to update customer's address #e2e #customer", async () => {
  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.editCustomer.id);
  await addressesListPage.clickManageAddresses();
  await addressesListPage.clickShowMoreMenu(CUSTOMERS.editCustomer.initialShippingAddress.lastName);
  await addressesListPage.clickEditAddress();

  const newAddress = ADDRESS.addressUS;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressForm.selectCountryArea(newAddress.countryArea);
  await addAddressDialog.clickConfirmButton();
  await customersPage.expectSuccessBanner();
  await addressesListPage.verifyRequiredAddressFields(newAddress.firstName, newAddress);
  await addressesListPage.verifyPhoneField(newAddress.firstName, newAddress);
  await addressesListPage.verifyCompanyField(newAddress.firstName, newAddress);
  await addressesListPage.verifyAddressLine2Field(newAddress.firstName, newAddress);
});

test("TC: SALEOR_210 Delete customer's address #e2e #customer", async () => {
  await customersPage.gotoCustomerDetailsPage(CUSTOMERS.editCustomer.id);
  const addressUKDel = ADDRESS.addressUKDel;
  await addNewAddress(addressUKDel);
  await addressesListPage.clickShowMoreMenu(CUSTOMERS.editCustomer.initialBillingAddress.lastName);
  await addressesListPage.clickDeleteAddress();
  await deleteAddressDialog.clickDeleteButton();
  await expect(
    addressesListPage.savedAddress.filter({
      hasText: CUSTOMERS.editCustomer.initialBillingAddress.lastName,
    }),
  ).not.toBeVisible();
});

async function createCustomer() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const note = faker.lorem.sentence();
  const email = faker.internet.email();

  await customersPage.goToCustomersListView();
  await customersPage.clickOnCreateCustomer();
  await customersPage.fillFirstAndLastName(firstName, lastName);
  await customersPage.fillEmail(email);

  const newAddress = ADDRESS.addressUS;

  await addressForm.completeBasicInfoAddressForm(newAddress);
  await addressForm.typeCompanyName(newAddress.companyName);
  await addressForm.typePhone(newAddress.phone);
  await addressForm.typeAddressLine2(newAddress.addressLine2);
  await addressForm.selectCountryArea(newAddress.countryArea);
  await customersPage.fillNote(note);
  await customersPage.saveCustomer();
  await customersPage.expectSuccessBanner();
  const currentUrl = await customersPage.page.url();
  const urlObject = new URL(currentUrl);
  const pathSegments = urlObject.pathname.split("/");
  const customerId = pathSegments.filter(Boolean).pop() || "test";
  return {
    firstName,
    lastName,
    note,
    email,
    customerId,
  };
}

async function addNewAddress(addressUK: AddressFieldsType) {
  await addressesListPage.clickManageAddresses();
  await addressesListPage.clickAddAddressButton();
  await addressForm.completeBasicInfoAddressForm(addressUK);
  await addressForm.typeCompanyName(addressUK.companyName);
  await addressForm.typePhone(addressUK.phone);
  await addressForm.typeAddressLine2(addressUK.addressLine2);
  await addAddressDialog.clickConfirmButton();
}
