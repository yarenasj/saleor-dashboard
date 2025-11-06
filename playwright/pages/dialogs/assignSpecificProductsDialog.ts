import type { Page } from "@playwright/test";

export class AssignSpecificProductsDialog {
  readonly page: Page;

  constructor(
    page: Page,
    readonly nameInput = page.getByTestId("value-name").locator("input"),
    readonly assignAndSaveButton = page.locator("button[type='submit']"),
    readonly backButton = page.locator("[data-test-id*='close-button']"),
  ) {
    this.page = page;
  }

  async clickAssignAndSaveButton() {
    await this.assignAndSaveButton.click();
    await this.assignAndSaveButton.waitFor({ state: "hidden" });
  }

  async clickBackButton() {
    await this.backButton.click();
    await this.backButton.waitFor({ state: "hidden" });
  }

  async assignSpecificProductsByNameAndSave(nameAkaText: string) {
    const specificProductCheckbox = this.page
      .getByRole("row", { name: nameAkaText })
      .getByRole("checkbox");
    if (await specificProductCheckbox.isChecked()) {
      await this.clickBackButton();
      return false;
    }
    await specificProductCheckbox.click();
    await this.clickAssignAndSaveButton();
    return true;
  }
}
