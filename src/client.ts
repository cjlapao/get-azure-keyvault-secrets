import * as core from '@actions/core'

import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity'
import { SecretClient, SecretProperties } from '@azure/keyvault-secrets'

export function getCredentials(): ClientSecretCredential {
  const tenantId = core.getInput('tenant_id')
  const clientId = core.getInput('client_id')
  const clientSecret = core.getInput('client_secret')
  if (!tenantId) {
    throw new Error('The tenant_id input is required')
  }
  if (!clientId) {
    throw new Error('The client_id input is required')
  }
  if (!clientSecret) {
    throw new Error('The client_secret input is required')
  }
  const credentials = new ClientSecretCredential(
    tenantId,
    clientId,
    clientSecret
  )
  return credentials
}

export function getDefaultCredentials(): DefaultAzureCredential {
  const credentials = new DefaultAzureCredential()
  return credentials
}

export function getClient(
  keyVaultName: string,
  credentials: ClientSecretCredential | DefaultAzureCredential
): SecretClient {
  const url = `https://${keyVaultName}.vault.azure.net`

  const client = new SecretClient(url, credentials)

  return client
}

export async function getSecret(
  client: SecretClient,
  secretName: string
): Promise<string> {
  const secret = await client.getSecret(secretName)
  return secret.value ?? ''
}

export async function getSecrets(
  client: SecretClient
): Promise<SecretProperties[]> {
  const result = []
  for await (const secretProperties of client.listPropertiesOfSecrets()) {
    if (core.isDebug()) {
      console.log(secretProperties.name)
    }
    result.push(secretProperties)
  }

  return result
}
