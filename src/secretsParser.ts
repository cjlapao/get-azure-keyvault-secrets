const spaceOrSpecialReplaceChar = '_'
const separatorReplaceChar = '__'
export function parseSecretName(
  secretName: string,
  separator: string = ''
): string {
  secretName = secretName.replace(/ /g, spaceOrSpecialReplaceChar)
  if (separator !== '') {
    const secretNames = secretName.split(separator)
    secretName = secretNames.join(separatorReplaceChar)
  }

  secretName = secretName.replace(/[^a-zA-Z0-9-_]/g, spaceOrSpecialReplaceChar)
  return secretName
}

export function parseSecretsInput(secretsInput: string): string[] {
  return secretsInput
    .split('\n')
    .map(secret => secret.trim())
    .filter(secret => secret !== '')
}
