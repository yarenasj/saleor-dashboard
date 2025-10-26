import { useCloud } from "@dashboard/auth/hooks/useCloud";
import { ThemeProvider as LegacyThemeProvider } from "@saleor/macaw-ui";
import { ThemeProvider } from "@saleor/macaw-ui-next";
import { render, screen } from "@testing-library/react";
import React, { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

jest.mock("react-intl", () => ({
  useIntl: jest.fn(() => ({
    formatMessage: jest.fn(x => x.defaultMessage),
  })),
  defineMessages: jest.fn(x => x),
  FormattedMessage: ({ defaultMessage }: { defaultMessage: string }) => <>{defaultMessage}</>,
}));
jest.mock("./menu/hooks/useMenuStructure", () => ({
  useMenuStructure: jest.fn(() => []),
}));
jest.mock("@dashboard/featureFlags/useFlagsInfo", () => ({
  useFlagsInfo: jest.fn(() => []),
}));
jest.mock("@dashboard/auth/hooks/useCloud", () => ({
  useCloud: jest.fn(() => ({
    isAuthenticatedViaCloud: false,
  })),
}));
jest.mock("@dashboard/components/DevModePanel/hooks", () => ({
  useDevModeContext: jest.fn(() => ({
    variables: "",
    setVariables: jest.fn(),
    isDevModeVisible: false,
    setDevModeVisibility: jest.fn(),
    devModeContent: "",
    setDevModeContent: jest.fn(),
  })),
}));
jest.mock("@dashboard/components/NavigatorSearch/useNavigatorSearchContext", () => ({
  useNavigatorSearchContext: jest.fn(() => ({
    isNavigatorVisible: false,
    setNavigatorVisibility: jest.fn(),
  })),
}));

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    // @ts-expect-error - legacy types
    <LegacyThemeProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </LegacyThemeProvider>
  );
};

describe("Sidebar", () => {
  it('shouldd render "Saleor Cloud" link when is cloud instance', () => {
    // Arrange
    (useCloud as jest.Mock).mockImplementation(() => ({
      isAuthenticatedViaCloud: true,
    }));
    // Act
    render(<Sidebar />, { wrapper: Wrapper });
    // Assert
    expect(screen.getByText("Saleor Cloud")).toBeInTheDocument();
  });
  it('shouldd not render "Saleor Cloud" link when is not cloud instance', () => {
    // Arrange
    (useCloud as jest.Mock).mockImplementation(() => ({
      isAuthenticatedViaCloud: false,
    }));
    // Act
    render(<Sidebar />, { wrapper: Wrapper });
    // Assert
    expect(screen.queryByText("Saleor Cloud")).not.toBeInTheDocument();
  });
});
