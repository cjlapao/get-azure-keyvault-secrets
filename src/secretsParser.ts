export function parseSecretName(
  secretName: string,
  separator: string = ''
): string {
  secretName = secretName.replace(/ /g, '_')
  if (separator) {
    const secretNames = secretName.split(separator)
    secretName = secretNames.join('_')
  }

  secretName = secretName.replace(/[^a-zA-Z0-9-_]/g, '_')
  return secretName
}

export function parseSecretsInput(secretsInput: string): string[] {
  return secretsInput
    .split('\n')
    .map(secret => secret.trim())
    .filter(secret => secret !== '')
}
