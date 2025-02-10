export function isDebug(): boolean {
  return process.env.RUNNER_DEBUG === '1'
}

export function parseNumber(value: string, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue
  }

  const int = parseInt(value, 10)
  if (isNaN(int)) {
    return defaultValue
  }
  return int
}

export function parseBoolean(value: string): boolean {
  if (value === undefined || value === null) {
    return false
  }

  return (
    value.toLowerCase() === 'true' ||
    value === '1' ||
    value.toLowerCase() === 'yes' ||
    value.toLowerCase() === 'y' ||
    value.toLowerCase() === 'on' ||
    value.toLowerCase() === 'enabled' ||
    value.toLowerCase() === 'active' ||
    value.toLowerCase() === 't'
  )
}
