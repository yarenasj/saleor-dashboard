import { URL_LIST } from "@data/url";
import { DeleteShippingMethodDialog } from "@dialogs/deleteShippingMethodDialog";
import { BasePage } from "@pages/basePage";
import { AssignCountriesDialog } from "@pages/dialogs/assignCountriesDialog";
import { RightSideDetailsPage } from "@pages/pageElements/rightSideDetailsSection";
import type { Page } from "@playwright/test";

export class ShippingMethodsPage extends BasePage {
  rightSideDetailsPage: RightSideDetailsPage;

  assignCountriesDialog: AssignCountriesDialog;

  deleteShippingMethodDialog: DeleteShippingMethodDialog;

  constructor(
    page: Page,
    readonly assignCountryButton = page.getByTestId("assign-country"),
    readonly createShippingZoneButton = page.getByTestId("add-shipping-zone"),
    readonly shippingZoneNameInput = page.getByTestId("shipping-zone-name"),
    readonly shippingZoneDescriptionField = page
      .getByTestId("shipping-zone-description")
      .locator("textarea"),
    readonly saveButton = page.getByTestId("button-bar-confirm"),
    readonly shippingZoneName = page.getByTestId("page-header"),
    readonly deleteShippingRateButton = page.getByTestId("button-bar-delete"),
    readonly shippingRateNameInput = page.getByTestId("shipping-rate-name-input"),
    readonly deleteShippingRateButtonOnList = page
      .getByTestId("shipping-method-row")
      .getByRole("button")
      .getByTestId("delete-button"),
  ) {
    super(page);
    this.rightSideDetailsPage = new RightSideDetailsPage(page);
    this.assignCountriesDialog = new AssignCountriesDialog(page);
    this.deleteShippingMethodDialog = new DeleteShippingMethodDialog(page);
  }

  async clickAssignCountryButton() {
    await this.assignCountryButton.click();
  }

  async typeShippingZoneName(shippingZoneName = "e2e shipping zone") {
    const name = `${shippingZoneName} - ${new Date().toISOString()}`;
    await this.shippingZoneNameInput.fill(name);
    return name;
  }

  async typeShippingZoneDescription(shippingDescription = "Biggest zone in e2e world") {
    await this.shippingZoneDescriptionField.fill(shippingDescription);
  }

  async saveShippingZone() {
    await this.saveButton.click();
  }

  async gotoListView() {
    await this.page.goto(URL_LIST.shippingMethods);
    await this.createShippingZoneButton.waitFor({
      state: "visible",
      timeout: 10000,
    });
  }

  async gotoExistingShippingMethod(shippingMethodId: string, shippingMethodName: string) {
    const existingShippingMethodUrl = `${URL_LIST.shippingMethods}${shippingMethodId}`;

    await console.log(`Navigates to existing shipping method page: ${existingShippingMethodUrl}`);
    await this.page.goto(existingShippingMethodUrl);
    await this.page.getByText(shippingMethodName).first().waitFor({
      state: "visible",
      timeout: 60000,
    });
  }

  async gotoExistingShippingRate(shippingMethodId: string, shippingRateId: string) {
    const existingShippingRateUrl = `${URL_LIST.shippingMethods}${shippingMethodId}/${shippingRateId}`;

    await console.log(`Navigates to existing shipping rate page: ${existingShippingRateUrl}`);
    await this.page.goto(existingShippingRateUrl);
    await this.shippingRateNameInput.waitFor({
      state: "visible",
      timeout: 60000,
    });
  }

  async clickCreateShippingZoneButton() {
    await this.createShippingZoneButton.click();
  }

  async clickDeleteShippingRateButton() {
    await this.deleteShippingRateButton.click();
  }
}
