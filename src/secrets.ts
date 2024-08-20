import * as core from '@actions/core'
import { SecretClient, SecretProperties } from '@azure/keyvault-secrets'
import { getSecret } from './client'

export async function processSecrets(
  client: SecretClient,
  secrets: SecretProperties[]
): Promise<void> {
  const separator = core.getInput('separator')
  for (const secret of secrets) {
    if (secret.enabled) {
      const value = await getSecret(client, secret.name)
      let exportedSecretName = secret.name.toLowerCase()
      if (separator) {
        const regexp = new RegExp(separator, 'g')
        exportedSecretName = secret.name.replace(regexp, '__').toLowerCase()
      }
      if (value) {
        core.setSecret(value)
      } else {
        console.log(`Secret ${secret.name} is empty`)
      }
      core.exportVariable(exportedSecretName, value)
      if (core.isDebug()) {
        console.log(
          `Exported secret ${exportedSecretName} to environment variables`
        )
      }
    }
  }
  console.log(`Exported ${secrets.length} secrets to environment variables`)
}
