import { useUser } from "@dashboard/auth";
import { categoryListUrl } from "@dashboard/categories/urls";
import { collectionListUrl } from "@dashboard/collections/urls";
import { configurationMenuUrl } from "@dashboard/configuration";
import { getConfigMenuItemsPermissions } from "@dashboard/configuration/utils";
import { customerListUrl } from "@dashboard/customers/urls";
import { PermissionEnum } from "@dashboard/graphql";
import { ConfigurationIcon } from "@dashboard/icons/Configuration";
import { CustomersIcon } from "@dashboard/icons/Customers";
import { HomeIcon } from "@dashboard/icons/Home";
import { OrdersIcon } from "@dashboard/icons/Orders";
import { ProductsIcon } from "@dashboard/icons/Products";
import { sectionNames } from "@dashboard/intl";
import { orderDraftListUrl, orderListUrl } from "@dashboard/orders/urls";
import { productListUrl } from "@dashboard/products/urls";
import { SearchShortcut } from "@dashboard/search/SearchShortcut";
import { Box, SearchIcon } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

import { SidebarMenuItem } from "../types";

export function useMenuStructure() {
  const intl = useIntl();
  const { user } = useUser();

  const menuItems: SidebarMenuItem[] = [
    {
      icon: renderIcon(<HomeIcon />),
      label: intl.formatMessage(sectionNames.home),
      id: "home",
      url: "/",
      type: "item",
    },
    {
      icon: renderIcon(<SearchIcon />),
      label: (
        <Box display="flex" alignItems="center" gap={2}>
          {intl.formatMessage(sectionNames.search)}
          <SearchShortcut />
        </Box>
      ),
      id: "search",
      url: "/search",
      permissions: [
        PermissionEnum.MANAGE_PRODUCTS,
        PermissionEnum.MANAGE_PAGES,
        PermissionEnum.MANAGE_PAGE_TYPES_AND_ATTRIBUTES,
        PermissionEnum.MANAGE_ORDERS,
      ],
      type: "item",
    },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.products),
          id: "products",
          url: productListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          type: "item",
        },
        {
          label: intl.formatMessage(sectionNames.categories),
          id: "categories",
          url: categoryListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          type: "item",
        },
        {
          label: intl.formatMessage(sectionNames.collections),
          id: "collections",
          url: collectionListUrl(),
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          type: "item",
        },
      ],
      icon: renderIcon(<ProductsIcon />),
      url: productListUrl(),
      label: intl.formatMessage(sectionNames.catalog),
      permissions: [PermissionEnum.MANAGE_PRODUCTS],
      id: "products",
      type: "itemGroup",
    },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.orders),
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "orders",
          url: orderListUrl(),
          type: "item",
        },
        {
          label: intl.formatMessage(sectionNames.draftOrders),
          permissions: [PermissionEnum.MANAGE_ORDERS],
          id: "order-drafts",
          url: orderDraftListUrl(),
          type: "item",
        },
      ],
      icon: renderIcon(<OrdersIcon />),
      label: intl.formatMessage(sectionNames.fulfillment),
      permissions: [PermissionEnum.MANAGE_ORDERS],
      id: "orders",
      url: orderListUrl(),
      type: "itemGroup",
    },
    {
      children: [
        {
          label: intl.formatMessage(sectionNames.customers),
          permissions: [PermissionEnum.MANAGE_USERS],
          id: "customers",
          url: customerListUrl(),
          type: "item",
        },
      ],
      icon: renderIcon(<CustomersIcon />),
      label: intl.formatMessage(sectionNames.customers),
      permissions: [PermissionEnum.MANAGE_USERS],
      id: "customers",
      url: customerListUrl(),
      type: "itemGroup",
    },
    {
      icon: renderIcon(<ConfigurationIcon />),
      label: intl.formatMessage(sectionNames.configuration),
      permissions: getConfigMenuItemsPermissions(intl),
      id: "configure",
      url: configurationMenuUrl,
      type: "item",
    },
  ];
  const isMenuItemPermitted = (menuItem: SidebarMenuItem) => {
    const userPermissions = (user?.userPermissions || []).map(permission => permission.code);

    if (!menuItem?.permissions || menuItem?.permissions?.length < 1) {
      return true;
    }

    return menuItem.permissions.some(permission => userPermissions.includes(permission));
  };
  const getFilteredMenuItems = (menuItems: SidebarMenuItem[]) =>
    menuItems.filter(isMenuItemPermitted);

  return menuItems.reduce((resultItems: SidebarMenuItem[], menuItem: SidebarMenuItem) => {
    if (!isMenuItemPermitted(menuItem)) {
      return resultItems;
    }

    const { children } = menuItem;
    const filteredChildren = children ? getFilteredMenuItems(children) : undefined;

    return [...resultItems, { ...menuItem, children: filteredChildren }];
  }, []);
}

function renderIcon(icon: React.ReactNode) {
  return (
    <Box color="default2" __width={20} __height={20}>
      {icon}
    </Box>
  );
}
