export function isDebug(): boolean {
  return process.env['RUNNER_DEBUG'] === '1'
}
