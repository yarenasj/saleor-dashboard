import { DashboardCard } from "@dashboard/components/Card";
import Link from "@dashboard/components/Link";
import { NewRadioGroupField as RadioGroupField } from "@dashboard/components/RadioGroupField";
import {
  WarehouseClickAndCollectOptionEnum,
  WarehouseWithShippingFragment,
} from "@dashboard/graphql";
import { ChangeEvent } from "@dashboard/hooks/useForm";
import { sectionNames } from "@dashboard/intl";
import { renderCollection } from "@dashboard/misc";
import { shippingZoneUrl } from "@dashboard/shipping/urls";
import { RelayToFlat } from "@dashboard/types";
import { Divider } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import { Skeleton, Text } from "@saleor/macaw-ui-next";
import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { WarehouseDetailsPageFormData } from "../WarehouseDetailsPage";
import messages from "./messages";

const WarehouseRadioSubtitle = ({ children }: { children: ReactNode }) => (
  <Text size={2} fontWeight="light" color="default2" display="block">
    {children}
  </Text>
);

export interface WarehouseSettingsProps {
  zones: RelayToFlat<WarehouseWithShippingFragment["shippingZones"]>;
  disabled: boolean;
  data: WarehouseDetailsPageFormData;
  onChange: (event: ChangeEvent) => void;
  setData: (data: Partial<WarehouseDetailsPageFormData>) => void;
}

const useStyles = makeStyles(
  theme => ({
    link: {
      "&:not(:last-of-type)": {
        marginBottom: theme.spacing(),
      },
    },
    preview: {
      marginLeft: theme.spacing(1),
    },
  }),
  {
    name: "WarehouseInfoProps",
  },
);
const WarehouseSettings = ({ zones, disabled, data, setData }: WarehouseSettingsProps) => {
  React.useEffect(() => {
    if (data.isPrivate && data.clickAndCollectOption === WarehouseClickAndCollectOptionEnum.LOCAL) {
      setData({
        clickAndCollectOption: WarehouseClickAndCollectOptionEnum.DISABLED,
      });
    }
  }, [data.isPrivate]);

  const classes = useStyles({});
  const booleanRadioHandler = ({ target: { name, value } }: ChangeEvent) => {
    setData({ [name]: value === "true" });
  };
  const isPrivateChoices = [
    {
      label: (
        <>
          <FormattedMessage {...messages.warehouseSettingsPrivateStock} />
          <WarehouseRadioSubtitle>
            <FormattedMessage {...messages.warehouseSettingsPrivateStockDescription} />
          </WarehouseRadioSubtitle>
        </>
      ),
      value: "true",
    },
    {
      label: (
        <>
          <FormattedMessage {...messages.warehouseSettingsPublicStock} />
          <WarehouseRadioSubtitle>
            <FormattedMessage {...messages.warehouseSettingsPublicStockDescription} />
          </WarehouseRadioSubtitle>
        </>
      ),
      value: "false",
    },
  ];

  return (
    <DashboardCard>
      <DashboardCard.Header>
        <DashboardCard.Title>
          <FormattedMessage {...sectionNames.shippingZones} />
        </DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content>
        {renderCollection(
          zones,
          zone => (zone ? <Text color="default1">{zone.name}</Text> : <Skeleton />),
          () => (
            <Text color="default2">
              <FormattedMessage {...messages.warehouseSettingsNoShippingZonesAssigned} />
            </Text>
          ),
        )}
      </DashboardCard.Content>
      <Divider />
      <DashboardCard.Header>
        <DashboardCard.Title>
          <FormattedMessage {...messages.warehouseSettingsStockTitle} />
        </DashboardCard.Title>
      </DashboardCard.Header>
      <DashboardCard.Content data-test-id="stock-settings-section">
        <RadioGroupField
          choices={isPrivateChoices}
          name="isPrivate"
          value={data.isPrivate.toString()}
          onChange={booleanRadioHandler}
          disabled={disabled}
        />
      </DashboardCard.Content>
    </DashboardCard>
  );
};

WarehouseSettings.displayName = "WarehouseInfo";
export default WarehouseSettings;
