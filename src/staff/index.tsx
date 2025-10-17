import { Route } from "@dashboard/components/Router";
import { sectionNames } from "@dashboard/intl";
import { parse as parseQs } from "qs";
import { useIntl } from "react-intl";
import { RouteComponentProps, Switch } from "react-router-dom";

import { WindowTitle } from "../components/WindowTitle";
import { staffMemberDetailsPath, StaffMemberDetailsUrlQueryParams } from "./urls";
import { StaffDetailsView } from "./views/StaffDetails";

interface StaffDetailsRouteProps {
  id: string;
}

const StaffDetailsComponent: React.FC<RouteComponentProps<StaffDetailsRouteProps>> = ({
  match,
}) => {
  const qs = parseQs(location.search.substr(1));
  const params: StaffMemberDetailsUrlQueryParams = qs;

  return <StaffDetailsView id={decodeURIComponent(match.params.id)} params={params} />;
};
const Component = () => {
  const intl = useIntl();

  return (
    <>
      <WindowTitle title={intl.formatMessage(sectionNames.staff)} />
      <Switch>
        <Route path={staffMemberDetailsPath(":id")} component={StaffDetailsComponent} />
      </Switch>
    </>
  );
};

export default Component;
