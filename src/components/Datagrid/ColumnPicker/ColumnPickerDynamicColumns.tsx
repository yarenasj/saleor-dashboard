import { Box, Button, RemoveIcon, Text } from "@saleor/macaw-ui-next";
import React from "react";

import { AvailableColumn } from "../types";

export interface ColumnPickerDynamicColumnsProps {
  dynamicColumns?: AvailableColumn[] | null | undefined;
  onToggle: (id: string) => void;
}

export const ColumnPickerDynamicColumns = ({
  dynamicColumns,
  onToggle,
}: ColumnPickerDynamicColumnsProps) => (
  <Box data-test-id="dynamic-col-container">
    {dynamicColumns
      ?.filter(column => !!column.metaGroup)
      .map(column => (
        <Box display="flex" alignItems="center" gap={2} padding={1} key={column.id}>
          <Button
            onClick={() => onToggle(column.id)}
            data-test-id={`remove-dynamic-col-button-${column.title}`}
            variant="tertiary"
            size="small"
            icon={<RemoveIcon color="default1" />}
            __width="20px"
            __height="20px"
          />
          <Text size={3} color="default2" whiteSpace="nowrap">
            {`${column.metaGroup} /`}
          </Text>
          <Text size={3} color="default1" ellipsis data-test-id={`column-name-${column.title}`}>
            {column.pickerTitle ?? column.title}
          </Text>
        </Box>
      ))}
  </Box>
);
