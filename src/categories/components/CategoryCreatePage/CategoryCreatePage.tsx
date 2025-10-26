import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { CardSpacer } from "@dashboard/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@dashboard/components/ConfirmButton";
import { DetailPageLayout } from "@dashboard/components/Layouts";
import { Savebar } from "@dashboard/components/Savebar";
import { ProductErrorFragment } from "@dashboard/graphql";
import useNavigator from "@dashboard/hooks/useNavigator";
import { Box } from "@saleor/macaw-ui-next";
import React from "react";
import { useIntl } from "react-intl";

import CategoryDetailsForm from "../../components/CategoryDetailsForm";
import CategoryCreateForm, { CategoryCreateData } from "./form";

export interface CategoryCreatePageProps {
  errors: ProductErrorFragment[];
  disabled: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  backUrl: string;
  onSubmit: (data: CategoryCreateData) => any;
}

export const CategoryCreatePage = ({
  disabled,
  onSubmit,
  errors,
  saveButtonBarState,
  backUrl,
}: CategoryCreatePageProps) => {
  const intl = useIntl();
  const navigate = useNavigator();

  return (
    <CategoryCreateForm onSubmit={onSubmit} disabled={disabled}>
      {({ data, change, handlers, submit, isSaveDisabled }) => (
        <DetailPageLayout gridTemplateColumns={1}>
          <TopNav
            href={backUrl}
            title={intl.formatMessage({
              id: "cgsY/X",
              defaultMessage: "Create New Category",
              description: "page header",
            })}
          />
          <DetailPageLayout.Content>
            <Box height="100vh" __marginBottom="auto">
              <CategoryDetailsForm
                data={data}
                disabled={disabled}
                errors={errors}
                onChange={change}
              />
            </Box>
          </DetailPageLayout.Content>
          <Savebar>
            <Savebar.Spacer />
            <Savebar.CancelButton onClick={() => navigate(backUrl)} />
            <Savebar.ConfirmButton
              transitionState={saveButtonBarState}
              onClick={submit}
              disabled={isSaveDisabled}
            />
          </Savebar>
        </DetailPageLayout>
      )}
    </CategoryCreateForm>
  );
};
CategoryCreatePage.displayName = "CategoryCreatePage";
export default CategoryCreatePage;
