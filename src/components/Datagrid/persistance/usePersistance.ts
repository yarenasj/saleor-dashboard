import { MetadataItemFragment } from "@dashboard/graphql";
import { useRef } from "react";

import { PersistedColumn, RawColumn } from "./persistedColumn";

const parseGridMetadata = (metadata?: MetadataItemFragment) => {
  try {
    if (!metadata) return [];

    const rawColumns = JSON.parse(metadata.value) as RawColumn[];

    return rawColumns.map(col => PersistedColumn.fromRaw(col));
  } catch (_) {
    return [];
  }
};

export const usePersistance = (gridName?: string) => {
  const columnsState = useRef<PersistedColumn[]>(parseGridMetadata());

  const update = (columns: PersistedColumn[]) => {
    if (!gridName) return;

    columnsState.current = columns;
  };

  return {
    columns: columnsState.current,
    update,
  };
};
