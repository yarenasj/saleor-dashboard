// @ts-strict-ignore
import { ChannelShippingData } from "@dashboard/channels/utils";
import {
  CountryFragment,
  ShippingMethodChannelListingUpdateMutationVariables,
} from "@dashboard/graphql";
import differenceBy from "lodash/differenceBy";

export const createChannelsChangeHandler =
  (
    selectedChannels: ChannelShippingData[],
    setSelectedChannels: (channels: ChannelShippingData[]) => void,
    triggerChange: () => void,
  ) =>
  (channelId: string, value: { maxValue: string; minValue: string; price: string }) => {
    const itemIndex = selectedChannels.findIndex(item => item.id === channelId);
    const channel = selectedChannels[itemIndex];

    setSelectedChannels([
      ...selectedChannels.slice(0, itemIndex),
      {
        ...channel,
        maxValue: value.maxValue,
        minValue: value.minValue,
        price: value.price,
      },
      ...selectedChannels.slice(itemIndex + 1),
    ]);
    triggerChange();
  };

export function getShippingMethodChannelVariables(
  id: string,
  orderValueRestricted: boolean,
  formChannels: ChannelShippingData[],
  prevChannels?: ChannelShippingData[],
): ShippingMethodChannelListingUpdateMutationVariables {
  const removeChannels = prevChannels
    ? differenceBy(prevChannels, formChannels, "id").map(({ id }) => id)
    : [];

  return {
    id,
    input: {
      addChannels:
        formChannels?.map(channel => ({
          channelId: channel.id,
          maximumOrderPrice: channel.maxValue && orderValueRestricted ? channel.maxValue : null,
          minimumOrderPrice: channel.minValue && orderValueRestricted ? channel.minValue : null,
          price: channel.price,
        })) || [],
      removeChannels,
    },
  };
}

export function getCountrySelectionMap(
  countries?: CountryFragment[],
  countriesSelected?: string[],
) {
  if (!countriesSelected || !countries) {
    return {} as Record<string, boolean>;
  }

  return countries.reduce(
    (acc, country) => {
      acc[country.code] = !!countriesSelected.find(
        selectedCountries => selectedCountries === country.code,
      );

      return acc;
    },
    {} as Record<string, boolean>,
  );
}

export function isRestWorldCountriesSelected(
  restWorldCountries?: string[],
  countrySelectionMap?: Record<string, boolean>,
) {
  return (
    countrySelectionMap &&
    restWorldCountries?.every(countryCode => countrySelectionMap[countryCode])
  );
}
