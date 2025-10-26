import { orderDraftListUrl, orderListUrl } from "@dashboard/orders/urls";

import { SidebarMenuItem } from "./types";
import { isMenuActive } from "./utils";

describe("isMenuActive", () => {
  const mockMenuItem: SidebarMenuItem = {
    id: "test-item",
    label: "Test Item",
    url: "/test",
    type: "item",
  };

  it("should identify menu item as active when current path matches its URL", () => {
    const result = isMenuActive("/test", mockMenuItem);

    expect(result).toBe(true);
  });

  it("should identify menu item as active when current path matches one of its alternative URLs (matchUrls)", () => {
    const menuItemWithMatchUrls: SidebarMenuItem = {
      ...mockMenuItem,
      matchUrls: ["/test/alternative", "/test"],
    };
    const result = isMenuActive("/test/alternative", menuItemWithMatchUrls);

    expect(result).toBe(true);
  });

  it("should identify menu item as inactive when current path matches none of its URLs", () => {
    const result = isMenuActive("/different", mockMenuItem);

    expect(result).toBe(false);
  });

  it("should identify Order List item as inactive when on the Order Drafts page", () => {
    const orderMenuItem: SidebarMenuItem = {
      ...mockMenuItem,
      url: orderListUrl(),
    };
    const result = isMenuActive(orderDraftListUrl(), orderMenuItem);

    expect(result).toBe(false);
  });

  it("should correctly match paths regardless of '/dashboard' prefix in current location", () => {
    const result = isMenuActive("/dashboard/test", mockMenuItem);

    expect(result).toBe(true);
  });

  it("should correctly match paths by ignoring query parameters in current location and item URLs", () => {
    const result = isMenuActive("/test?param=value", mockMenuItem);

    expect(result).toBe(true);
  });

  it("should identify Home menu item (URL '/') as active when current path is root ('/')", () => {
    const homeMenuItem: SidebarMenuItem = {
      ...mockMenuItem,
      url: "/",
    };
    const result = isMenuActive("/", homeMenuItem);

    expect(result).toBe(true);
  });

  it("should identify item as inactive if its main URL is undefined and no alternative URLs match", () => {
    const menuItemWithOnlyMatchUrls: SidebarMenuItem = {
      id: "test-item-match",
      label: "Test Item Match",
      matchUrls: ["/foo", "/bar"],
      type: "item",
    };
    const result = isMenuActive("/baz", menuItemWithOnlyMatchUrls);

    expect(result).toBe(false);
  });

  it("should identify item as active if its main URL is undefined and an alternative URL matches", () => {
    const menuItemWithOnlyMatchUrls: SidebarMenuItem = {
      id: "test-item-match",
      label: "Test Item Match",
      matchUrls: ["/foo", "/bar"],
      type: "item",
    };
    const result = isMenuActive("/foo", menuItemWithOnlyMatchUrls);

    expect(result).toBe(true);
  });

  it("should identify item as inactive if it has no main URL or alternative URLs defined", () => {
    const menuItemWithoutUrls: SidebarMenuItem = {
      id: "test-item-no-urls",
      label: "Test Item No URLs",
      type: "item",
    };
    const result = isMenuActive("/anywhere", menuItemWithoutUrls);

    expect(result).toBe(false);
  });

  it("should identify Order List item as active when on the Order List page", () => {
    const orderMenuItem: SidebarMenuItem = {
      ...mockMenuItem,
      url: orderListUrl(),
    };
    const result = isMenuActive(orderListUrl(), orderMenuItem);

    expect(result).toBe(true);
  });
});
