import * as core from '@actions/core'
import { SecretClient, SecretProperties } from '@azure/keyvault-secrets'
import { getClient, getSecret } from './client'

export async function processSecrets(
  client: SecretClient,
  secrets: SecretProperties[]
): Promise<void> {
  const separator = core.getInput('separator')
  for (const secret of secrets) {
    if (secret.enabled) {
      const value = await getSecret(client, secret.name)
      const regexp = new RegExp(separator, 'g')
      const exportedSecretName = secret.name.replace(regexp, '.')
      core.exportVariable(exportedSecretName, value)
      console.log(
        `Exported secret ${exportedSecretName} to environment variables`
      )
    }
  }
}
