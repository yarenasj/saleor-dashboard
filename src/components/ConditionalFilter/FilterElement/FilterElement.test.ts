import { AttributeInputTypeEnum } from "@dashboard/graphql";

import { Condition } from "./Condition";
import { ExpressionValue, FilterElement } from "./FilterElement";

describe("ConditionalFilter / FilterElement / FilterElement", () => {
  it("creates empty filter element", () => {
    // Arrange
    const element = FilterElement.createEmpty();

    // Act & Assert
    expect(element.isEmpty()).toBeTruthy();
  });
  it("creates for slug", () => {
    // Arrange
    const element = FilterElement.createStaticBySlug("category");

    // Act & Assert
    expect(element).toEqual({
      condition: {
        loading: false,
        options: [
          {
            label: "is",
            type: "combobox",
            value: "input-1",
          },
          {
            label: "in",
            type: "multiselect",
            value: "input-2",
          },
        ],
        selected: {
          conditionValue: {
            label: "is",
            type: "combobox",
            value: "input-1",
          },
          loading: false,
          options: [],
          value: "",
        },
      },
      constraint: undefined,
      loading: false,
      value: {
        label: "Category",
        type: "category",
        value: "category",
        entityType: null,
      },
      selectedAttribute: null,
      availableAttributesList: [],
      attributeLoading: false,
    });
  });

  it("creates a filter for a static field (category) and updates the left operand", () => {
    // User chooses 'category' as the filter type
    const element = FilterElement.createStaticBySlug("category");
    // User changes the left operand
    const staticOperand = {
      type: "category" as const,
      label: "Category",
      value: "category",
      slug: "category",
    };

    element.updateLeftOperator(staticOperand);
    expect(element.value.value).toBe("category");
    expect(element.constraint).toBeUndefined();

    // For a static field with a constraint (e.g., 'channel'), constraint is set
    const channelOperand = {
      type: "channel" as const,
      label: "Channel",
      value: "channel",
      slug: "channel",
    };

    element.updateLeftOperator(channelOperand);
    expect(element.constraint).toBeDefined();
  });

  it("updates the available attributes list and attribute loading state", () => {
    // User opens attribute filter and the app loads available attributes
    const element = FilterElement.createStaticBySlug("category");
    const attributeOperand = {
      type: AttributeInputTypeEnum.DROPDOWN,
      label: "Color",
      value: "color",
      slug: "color",
    };

    element.updateAvailableAttributesList([attributeOperand]);
    expect(element.availableAttributesList).toHaveLength(1);
    // Simulate loading state while fetching attributes
    element.updateAttributeLoadingState(true);
    expect(element.attributeLoading).toBe(true);
  });

  it("returns null rowType for empty filter", () => {
    const emptyElement = new FilterElement(
      new ExpressionValue("", "", ""),
      Condition.createEmpty(),
      false,
    );

    expect(emptyElement.rowType()).toBeNull();
  });
});
