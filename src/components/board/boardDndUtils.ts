export function encodeTaskId(
  boardIndex: number,
  columnName: string,
  taskTitle: string
): string {
  return `${boardIndex}::${columnName}::${taskTitle}`;
}

export function decodeTaskId(
  id: string
): { boardIndex: number; columnName: string; taskTitle: string } | null {
  const parts = id.split('::');
  if (parts.length < 3) return null;
  return {
    boardIndex: parseInt(parts[0], 10),
    columnName: parts[1],
    // Task title may contain "::", so join remaining parts
    taskTitle: parts.slice(2).join('::'),
  };
}

export function encodeColumnId(boardIndex: number, columnName: string): string {
  return `${boardIndex}::${columnName}`;
}

export function decodeColumnId(
  id: string
): { boardIndex: number; columnName: string } | null {
  const parts = id.split('::');
  if (parts.length < 2) return null;
  return {
    boardIndex: parseInt(parts[0], 10),
    columnName: parts[1],
  };
}
