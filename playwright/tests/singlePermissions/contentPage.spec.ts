import { BasePage } from "@pages/basePage";
import { ConfigurationPage } from "@pages/configurationPage";
import { ContentPage } from "@pages/contentPage";
import { HomePage } from "@pages/homePage";
import { MainMenuPage } from "@pages/mainMenuPage";
import { PageTypesPage } from "@pages/pageTypesPage";
import { test } from "utils/testWithPermission";

test.use({ permissionName: "page" });

let basePage: BasePage;
let mainMenuPage: MainMenuPage;
let configurationPage: ConfigurationPage;
let home: HomePage;
let contentPage: ContentPage;
let pageTypesPage: PageTypesPage;

test.beforeEach(async ({ page }) => {
  mainMenuPage = new MainMenuPage(page);
  configurationPage = new ConfigurationPage(page);
  home = new HomePage(page);
  contentPage = new ContentPage(page);
  basePage = new BasePage(page);
  pageTypesPage = new PageTypesPage(page);
});
test.beforeEach(async ({ page }) => {
  mainMenuPage = new MainMenuPage(page);
  configurationPage = new ConfigurationPage(page);
  home = new HomePage(page);
  contentPage = new ContentPage(page);
  basePage = new BasePage(page);
  pageTypesPage = new PageTypesPage(page);
  await home.goto();
  await home.welcomeMessage.waitFor({ state: "visible", timeout: 30000 });
});
