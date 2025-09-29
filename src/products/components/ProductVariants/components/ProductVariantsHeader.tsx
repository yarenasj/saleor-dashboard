import { Header as DatagridHeader } from "@dashboard/components/Datagrid/components/Header";
import { DatagridRenderHeaderProps } from "@dashboard/components/Datagrid/Datagrid";
import useNavigator from "@dashboard/hooks/useNavigator";
import { productVariantAddUrl } from "@dashboard/products/urls";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import messages from "../messages";

export const ProductVariantsHeader = ({
  addRowOnDatagrid,
  isAnimationOpenFinished,
  isFullscreenOpen,
  productId,
  productName,
}: DatagridRenderHeaderProps & { productId: string; productName: string }) => {
  const intl = useIntl();
  const navigate = useNavigator();

  const handleAddNewRow = () => {
    if (isFullscreenOpen) {
      addRowOnDatagrid();

      return;
    }

    navigate(productVariantAddUrl(productId));
  };

  const headerTitle = isAnimationOpenFinished
    ? intl.formatMessage(messages.fullScreenTitle, {
        name: productName,
      })
    : intl.formatMessage(messages.title);

  return (
    <DatagridHeader title={headerTitle}>
      <DatagridHeader.ButtonAddRow onAddRow={handleAddNewRow}>
        <FormattedMessage defaultMessage="Add variant" id="3C3Nj5" description="button" />
      </DatagridHeader.ButtonAddRow>
    </DatagridHeader>
  );
};
