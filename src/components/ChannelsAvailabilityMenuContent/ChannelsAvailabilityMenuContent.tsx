// @ts-strict-ignore
import { CollectionFragment } from "@dashboard/graphql";
import { PillColor } from "@saleor/macaw-ui";
import { Text } from "@saleor/macaw-ui-next";
import React from "react";
import { MessageDescriptor, useIntl } from "react-intl";

import { messages } from "../ChannelsAvailabilityDropdown/messages";
import { Pill } from "../Pill";
import { useStyles } from "./styles";

export interface ChannelsAvailabilityMenuContentProps {
  pills: Pill[];
}
export interface Pill {
  channel: CollectionFragment["channelListings"][0]["channel"];
  color: PillColor;
  label: MessageDescriptor;
}

export const ChannelsAvailabilityMenuContent = () => {
  const intl = useIntl();
  const classes = useStyles({});

  return (
    <div className={classes.menuContainer}>
      <div className={classes.row}>
        <Text size={2} fontWeight="light" className={classes.caption}>
          {intl.formatMessage(messages.channel)}
        </Text>
        <Text size={2} fontWeight="light" className={classes.caption}>
          {intl.formatMessage(messages.status)}
        </Text>
      </div>
    </div>
  );
};
ChannelsAvailabilityMenuContent.displayName = "ChannelsAvailabilityMenuContent";
export default ChannelsAvailabilityMenuContent;
