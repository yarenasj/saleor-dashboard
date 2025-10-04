import { flagInfoToFlagList, Name } from "@dashboard/featureFlags/availableFlags";
import { flagListToMetadata } from "@dashboard/featureFlags/strategies/MetadataStrategy";
import { useFlagsInfo } from "@dashboard/featureFlags/useFlagsInfo";

export const usePersistence = () => {
  const flags = useFlagsInfo();
  const toggleFlag = async (flagName: Name) => {
    const flagList = flagInfoToFlagList(flags);

    flagList[flagName].enabled = !flagList[flagName].enabled;

    flagListToMetadata(flagList);
  };

  return {
    toggleFlag,
  };
};
