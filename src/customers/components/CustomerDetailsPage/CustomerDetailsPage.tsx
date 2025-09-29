// @ts-strict-ignore
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { Backlink } from "@dashboard/components/Backlink";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import Form from "@dashboard/components/Form";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import RequirePermissions from "@dashboard/components/RequirePermissions";
import { Savebar } from "@dashboard/components/Savebar";
import { customerAddressesUrl, customerListPath } from "@dashboard/customers/urls";
import { AccountErrorFragment, CustomerDetailsQuery, PermissionEnum } from "@dashboard/graphql";
import { useBackLinkWithState } from "@dashboard/hooks/useBackLinkWithState";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import { sectionNames } from "@dashboard/intl";
import { orderListUrl } from "@dashboard/orders/urls";
import { mapEdgesToItems } from "@dashboard/utils/maps";
import React from "react";
import { useIntl } from "react-intl";

import { getUserName } from "../../../misc";
import CustomerAddresses from "../CustomerAddresses";
import CustomerDetails from "../CustomerDetails";
import CustomerInfo from "../CustomerInfo";
import CustomerOrders from "../CustomerOrders";
import CustomerStats from "../CustomerStats";

export interface CustomerDetailsPageFormData {
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  note: string;
}

export interface CustomerDetailsPageProps {
  customerId: string;
  customer: CustomerDetailsQuery["user"];
  disabled: boolean;
  errors: AccountErrorFragment[];
  saveButtonBar: ConfirmButtonTransitionState;
  onSubmit: (data: CustomerDetailsPageFormData) => SubmitPromise<AccountErrorFragment[]>;
  onDelete: () => void;
}

const CustomerDetailsPage = ({
  customerId,
  customer,
  disabled,
  errors,
  saveButtonBar,
  onSubmit,
  onDelete,
}: CustomerDetailsPageProps) => {
  const intl = useIntl();
  const navigate = useNavigator();
  const initialForm: CustomerDetailsPageFormData = {
    email: customer?.email || "",
    firstName: customer?.firstName || "",
    isActive: customer?.isActive || false,
    lastName: customer?.lastName || "",
    note: customer?.note || "",
  };

  const customerBackLink = useBackLinkWithState({
    path: customerListPath,
  });

  return (
    <Form confirmLeave initial={initialForm} onSubmit={onSubmit} disabled={disabled}>
      {({ change, data, isSaveDisabled, submit }) => {
        return (
          <DetailPageLayout>
            <TopNav href={customerBackLink} title={getUserName(customer, true)}></TopNav>
            <DetailPageLayout.Content>
              <Backlink href={customerBackLink}>
                {intl.formatMessage(sectionNames.customers)}
              </Backlink>
              <CustomerDetails
                customer={customer}
                data={data}
                disabled={disabled}
                errors={errors}
                onChange={change}
              />
              <CardSpacer />
              <CustomerInfo data={data} disabled={disabled} errors={errors} onChange={change} />
              <CardSpacer />
              <RequirePermissions requiredPermissions={[PermissionEnum.MANAGE_ORDERS]}>
                <CustomerOrders
                  orders={mapEdgesToItems(customer?.orders)}
                  viewAllHref={orderListUrl({
                    customer: customer?.email,
                  })}
                />
                <CardSpacer />
              </RequirePermissions>
            </DetailPageLayout.Content>
            <DetailPageLayout.RightSidebar>
              <CustomerAddresses
                customer={customer}
                disabled={disabled}
                manageAddressHref={customerAddressesUrl(customerId)}
              />
              <CardSpacer />
              <CustomerStats customer={customer} />
              <CardSpacer />
            </DetailPageLayout.RightSidebar>
            <Savebar>
              <Savebar.DeleteButton onClick={onDelete} />
              <Savebar.Spacer />
              <Savebar.CancelButton onClick={() => navigate(customerBackLink)} />
              <Savebar.ConfirmButton
                transitionState={saveButtonBar}
                onClick={submit}
                disabled={isSaveDisabled}
              />
            </Savebar>
          </DetailPageLayout>
        );
      }}
    </Form>
  );
};

CustomerDetailsPage.displayName = "CustomerDetailsPage";
export default CustomerDetailsPage;
