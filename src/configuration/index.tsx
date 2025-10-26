// @ts-strict-ignore
import { useUser } from "@dashboard/auth";
import { channelsListUrl } from "@dashboard/channels/urls";
import { WindowTitle } from "@dashboard/components/WindowTitle";
import { APP_VERSION as dashboardVersion } from "@dashboard/config";
import { PermissionEnum } from "@dashboard/graphql";
import useShop from "@dashboard/hooks/useShop";
import Channels from "@dashboard/icons/Channels";
import ProductTypes from "@dashboard/icons/ProductTypes";
import ShippingMethods from "@dashboard/icons/ShippingMethods";
import SiteSettings from "@dashboard/icons/SiteSettings";
import Warehouses from "@dashboard/icons/Warehouses";
import { sectionNames } from "@dashboard/intl";
import { maybe } from "@dashboard/misc";
import { productTypeListUrl } from "@dashboard/productTypes/urls";
import { shippingZonesListUrl } from "@dashboard/shipping/urls";
import { siteSettingsUrl } from "@dashboard/siteSettings/urls";
import { warehouseSection } from "@dashboard/warehouses/urls";
import React from "react";
import { IntlShape, useIntl } from "react-intl";

import { ConfigurationPage } from "./ConfigurationPage";
import { MenuSection } from "./types";

// TODO: Remove hideOldExtensions once "extensions" feature flag is removed
export function createConfigurationMenu(intl: IntlShape): MenuSection[] {
  return [
    {
      label: intl.formatMessage({
        id: "jFrdB5",
        defaultMessage: "Product Settings",
      }),
      menuItems: [
        {
          description: intl.formatMessage({
            id: "n0RwMK",
            defaultMessage: "Define types of products you sell",
          }),
          icon: <ProductTypes />,
          permissions: [PermissionEnum.MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES],
          title: intl.formatMessage(sectionNames.productTypes),
          url: productTypeListUrl(),
          testId: "configuration-menu-product-types",
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "gTr0qE",
        defaultMessage: "Shipping Settings",
      }),
      menuItems: [
        {
          description: intl.formatMessage({
            id: "zxs6G3",
            defaultMessage: "Manage how you ship out orders",
          }),
          icon: <ShippingMethods />,
          permissions: [PermissionEnum.MANAGE_SHIPPING],
          title: intl.formatMessage(sectionNames.shipping),
          url: shippingZonesListUrl(),
          testId: "configurationMenuShipping",
        },
        {
          description: intl.formatMessage({
            id: "5RmuD+",
            defaultMessage: "Manage and update your warehouse information",
          }),
          icon: <Warehouses />,
          permissions: [PermissionEnum.MANAGE_PRODUCTS],
          title: intl.formatMessage(sectionNames.warehouses),
          url: warehouseSection,
          testId: "configuration-menu-warehouses",
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "MWSacl",
        defaultMessage: "Multichannel",
      }),
      menuItems: [
        {
          description: intl.formatMessage({
            id: "8vJCJ4",
            defaultMessage: "Define and manage your sales channels",
          }),
          icon: <Channels />,
          permissions: [PermissionEnum.MANAGE_CHANNELS],
          title: intl.formatMessage(sectionNames.channels),
          url: channelsListUrl(),
          testId: "configuration-menu-channels",
        },
      ],
    },
    {
      label: intl.formatMessage({
        id: "YZl6cv",
        defaultMessage: "Miscellaneous",
      }),
      menuItems: [
        {
          description: intl.formatMessage({
            id: "5BajZK",
            defaultMessage: "View and update your site settings",
          }),
          icon: <SiteSettings />,
          permissions: [PermissionEnum.MANAGE_SETTINGS],
          title: intl.formatMessage(sectionNames.siteSettings),
          url: siteSettingsUrl(),
          testId: "configuration-menu-site-settings",
        },
      ],
    },
  ];
}

export const configurationMenuUrl = "/configuration/";

export const ConfigurationSection = () => {
  const shop = useShop();
  const versions = {
    dashboardVersion,
    coreVersion: shop?.version ?? "",
  };
  const user = useUser();
  const intl = useIntl();

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.configuration)} />
      <ConfigurationPage
        menu={createConfigurationMenu(intl)}
        user={maybe(() => user.user)}
        versionInfo={versions}
      />
    </>
  );
};
export default ConfigurationSection;
