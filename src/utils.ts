//@ts-nocheck
export function yyyymmdd(date?: Date): string | undefined {
  if (!date) {
    return undefined;
  }

  return date.toISOString().split('T')[0];
}

export function ddmmyyyy(date?: Date): string | undefined {
  if (!date) {
    return undefined;
  }

  //@ts-ignore
  const arr = yyyymmdd(date).split('-');
  return `${arr[2]}.${arr[1]}.${arr[0]}`;
}

export function getDateColumnConfig(accessorKey: string, header: string, headerJsx?: any): any {
  return {
    accessorKey: accessorKey,
    header: header,
    size: 140,
    Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
    Header: headerJsx,
    filterFn: (row, id, filterValue) =>
      ddmmyyyy(row.getValue<Date>(id))?.includes(filterValue) ?? false
  };
}