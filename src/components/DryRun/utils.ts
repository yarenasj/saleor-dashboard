// @ts-strict-ignore
import { InlineFragmentNode, ObjectFieldNode, parse, visit } from "graphql";

const getEventsFromQuery = (query: string) => {
  if (query.length === 0) {
    return [];
  }

  try {
    const ast = parse(query);
    const events: string[] = [];

    visit(ast, {
      SelectionSet(node, _key, parent) {
        if ((parent as ObjectFieldNode).name?.value === "event") {
          const queryEvents = node.selections.map(
            selection => (selection as InlineFragmentNode).typeCondition.name.value,
          );

          queryEvents.map(event => events.push(event));
        }
      },
    });

    return events;
  } catch {
    return [];
  }
};

export const getUnavailableObjects = (query: string) => {
  const queryEvents = getEventsFromQuery(query);

  return queryEvents.reduce((acc, _) => {
    return acc;
  }, []);
};
