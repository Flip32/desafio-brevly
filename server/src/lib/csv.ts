type CsvRow = Array<string | number>

function escapeCsvValue(value: string | number) {
  const stringValue = String(value ?? '')
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export function toCsv(headers: string[], rows: CsvRow[]) {
  const lines = [headers.join(',')]

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(','))
  }

  return lines.join('\n')
}
