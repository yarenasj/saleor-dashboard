// @ts-strict-ignore
import { useUserAccessibleChannels } from "@dashboard/auth/hooks/useUserAccessibleChannels";
import { useContextualLink } from "@dashboard/components/AppLayout/ContextualLinks/useContextualLink";
import { LimitsInfo } from "@dashboard/components/AppLayout/LimitsInfo";
import { ListFilters } from "@dashboard/components/AppLayout/ListFilters";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { DashboardCard } from "@dashboard/components/Card";
import { useConditionalFilterContext } from "@dashboard/components/ConditionalFilter";
import { useDevModeContext } from "@dashboard/components/DevModePanel/hooks";
import { FilterPresetsSelect } from "@dashboard/components/FilterPresetsSelect";
import { ListPageLayout } from "@dashboard/components/Layouts";
import { OrderListQuery, RefreshLimitsQuery } from "@dashboard/graphql";
import { sectionNames } from "@dashboard/intl";
import { orderMessages } from "@dashboard/orders/messages";
import { DevModeQuery } from "@dashboard/orders/queries";
import { OrderListUrlQueryParams, OrderListUrlSortField, orderUrl } from "@dashboard/orders/urls";
import { getFilterVariables } from "@dashboard/orders/views/OrderList/filters";
import {
  PageListProps,
  RelayToFlat,
  SearchPageProps,
  SortPage,
  TabPageProps,
} from "@dashboard/types";
import { hasLimits, isLimitReached } from "@dashboard/utils/limits";
import { Box, Button, ChevronRightIcon, Tooltip } from "@saleor/macaw-ui-next";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import OrderLimitReached from "../OrderLimitReached";
import { OrderListDatagrid } from "../OrderListDatagrid";

export interface OrderListPageProps
  extends PageListProps,
    SearchPageProps,
    Omit<TabPageProps, "onTabDelete">,
    SortPage<OrderListUrlSortField> {
  limits: RefreshLimitsQuery["shop"]["limits"];
  orders: RelayToFlat<OrderListQuery["orders"]>;
  hasPresetsChanged: boolean;
  onSettingsOpen: () => void;
  onAdd: () => void;
  params: OrderListUrlQueryParams;
  onTabUpdate: (tabName: string) => void;
  onTabDelete: (tabIndex: number) => void;
}

const OrderListPage = ({
  initialSearch,
  limits,
  onAdd,
  onSearchChange,
  onSettingsOpen,
  params,
  onTabChange,
  onTabDelete,
  onTabSave,
  onTabUpdate,
  tabs,
  onAll,
  currentTab,
  hasPresetsChanged,
  ...listProps
}: OrderListPageProps) => {
  const intl = useIntl();
  const subtitle = useContextualLink("order_list");
  const userAccessibleChannels = useUserAccessibleChannels();
  const hasAccessibleChannels = userAccessibleChannels.length > 0;
  const limitsReached = isLimitReached(limits, "orders");
  const [isFilterPresetOpen, setFilterPresetOpen] = useState(false);
  const context = useDevModeContext();
  const { valueProvider } = useConditionalFilterContext();

  const openPlaygroundURL = () => {
    context.setDevModeContent(DevModeQuery);

    const variables = JSON.stringify(
      {
        filter: getFilterVariables(params, valueProvider.value),
        // TODO add sorting: Issue #3409
        // strange error when uncommenting this line
        // sortBy: getSortQueryVariables(params)
      },
      null,
      2,
    );

    context.setVariables(variables);
    context.setDevModeVisibility(true);
  };

  return (
    <ListPageLayout>
      <TopNav
        title={intl.formatMessage(sectionNames.orders)}
        subtitle={subtitle}
        withoutBorder
        isAlignToRight={false}
      >
        <Box __flex={1} display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex">
            <Box marginX={3} display="flex" alignItems="center">
              <ChevronRightIcon />
            </Box>

            <FilterPresetsSelect
              presetsChanged={hasPresetsChanged}
              onSelect={onTabChange}
              onRemove={onTabDelete}
              onUpdate={onTabUpdate}
              savedPresets={tabs}
              activePreset={currentTab}
              onSelectAll={onAll}
              onSave={onTabSave}
              isOpen={isFilterPresetOpen}
              onOpenChange={setFilterPresetOpen}
              selectAllLabel={intl.formatMessage(orderMessages.filterPresetsAll)}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  data-test-id="create-order-button"
                  onClick={onAdd}
                  disabled={limitsReached || !hasAccessibleChannels}
                >
                  <FormattedMessage
                    id="LshEVn"
                    defaultMessage="Create order"
                    description="button"
                  />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {!hasAccessibleChannels && (
                  <FormattedMessage
                    defaultMessage="You don't have access to any channels"
                    id="grkY2V"
                  />
                )}
              </Tooltip.Content>
            </Tooltip>

            {hasLimits(limits, "orders") && (
              <LimitsInfo
                text={intl.formatMessage(
                  {
                    id: "zyceue",
                    defaultMessage: "{count}/{max} orders",
                    description: "placed order counter",
                  },
                  {
                    count: limits.currentUsage.orders,
                    max: limits.allowedUsage.orders,
                  },
                )}
              />
            )}
          </Box>
        </Box>
      </TopNav>

      {limitsReached && <OrderLimitReached />}

      <DashboardCard>
        <ListFilters
          type="expression-filter"
          initialSearch={initialSearch}
          onSearchChange={onSearchChange}
          searchPlaceholder={intl.formatMessage({
            id: "wTHjt3",
            defaultMessage: "Search Orders...",
          })}
        />
        <OrderListDatagrid {...listProps} hasRowHover={!isFilterPresetOpen} rowAnchor={orderUrl} />
      </DashboardCard>
    </ListPageLayout>
  );
};

OrderListPage.displayName = "OrderListPage";
export default OrderListPage;
