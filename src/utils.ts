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