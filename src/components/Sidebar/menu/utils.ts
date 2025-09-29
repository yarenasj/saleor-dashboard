// @ts-strict-ignore
import { orderDraftListUrl, orderListUrl } from "@dashboard/orders/urls";
import { matchPath } from "react-router";

import { SidebarMenuItem } from "./types";

export function isMenuActive(location: string, menuItem: SidebarMenuItem) {
  const menuUrlsToCheck = [...(menuItem.matchUrls || []), menuItem.url]
    .filter(Boolean)
    .map(item => item.split("?")[0]);

  if (menuUrlsToCheck.length === 0) {
    return false;
  }

  const activeUrl = getPureUrl(location.split("?")[0]);

  if (isMenuItemExtension(menuItem)) {
    return false;
  }

  if (
    activeUrl === orderDraftListUrl().split("?")[0] &&
    menuUrlsToCheck.some(url => url === orderListUrl().split("?")[0])
  ) {
    return false;
  }

  return menuUrlsToCheck.some(menuItemUrl => {
    return !!matchPath(activeUrl, {
      exact: menuItemUrl === "/",
      path: menuItemUrl,
    });
  });
}

const getPureUrl = (url: string) => {
  if (url.includes("/dashboard")) {
    return url.split("/dashboard")[1];
  }

  return url;
};
const isMenuItemExtension = (menuItem: SidebarMenuItem) => menuItem.id.startsWith("extension-");
