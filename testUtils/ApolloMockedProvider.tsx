import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import React from "react";

import { addressMocks, introspectionMocks, pageTypesMocks, warehousesMocks } from "./mocks";

const mocks: MockedResponse[] = [
  ...addressMocks,
  ...warehousesMocks,
  ...pageTypesMocks,
  ...introspectionMocks,
];

interface ApolloMockedProviderProps {
  children: React.ReactNode;
}

export const ApolloMockedProvider = ({ children }: ApolloMockedProviderProps) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);
