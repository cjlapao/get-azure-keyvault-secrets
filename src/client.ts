import * as core from '@actions/core'

import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'
import { AzureCredentials, Secret } from './models'

export class Client {
  private readonly _client: SecretClient

  constructor(
    keyVaultName: string,
    credentials: AzureCredentials | undefined = undefined
  ) {
    const url = `https://${keyVaultName}.vault.azure.net`
    let clientCredentials: ClientSecretCredential | DefaultAzureCredential
    if (credentials == null) {
      clientCredentials = this.getCredentials()
    } else if (
      credentials?.userDefaultCredentials !== undefined &&
      credentials?.userDefaultCredentials
    ) {
      clientCredentials = this.getDefaultCredentials()
    } else {
      if (credentials?.tenantId === undefined || credentials?.tenantId === '') {
        throw new Error('The tenant_id input is required')
      }
      if (credentials?.clientId === undefined || credentials?.clientId === '') {
        throw new Error('The client_id input is required')
      }
      if (
        credentials?.clientSecret === undefined ||
        credentials?.clientSecret === ''
      ) {
        throw new Error('The client_secret input is required')
      }
      clientCredentials = new ClientSecretCredential(
        credentials.tenantId ?? '',
        credentials.clientId,
        credentials.clientSecret
      )
    }

    this._client = new SecretClient(url, clientCredentials)
  }

  getCredentials(): ClientSecretCredential {
    const tenantId = core.getInput('tenant_id')
    const clientId = core.getInput('client_id')
    const clientSecret = core.getInput('client_secret')
    if (tenantId === '') {
      throw new Error('The tenant_id input is required')
    }
    if (clientId === '') {
      throw new Error('The client_id input is required')
    }
    if (clientSecret === '') {
      throw new Error('The client_secret input is required')
    }
    const credentials = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    )
    return credentials
  }

  getDefaultCredentials(): DefaultAzureCredential {
    const credentials = new DefaultAzureCredential()
    return credentials
  }

  async getSecret(secretName: string): Promise<Secret> {
    const azureSecret = await this._client.getSecret(secretName)
    const secret = {
      name: azureSecret.name,
      value: azureSecret.value ?? '',
      enabled: azureSecret.properties?.enabled ?? false
    }

    return secret
  }

  async getSecrets(names: string[]): Promise<Secret[]> {
    const result: Secret[] = []
    for await (const secretProperties of this._client.listPropertiesOfSecrets()) {
      if (secretProperties.enabled === false) {
        continue
      }
      if (names.length > 0 && !names.includes(secretProperties.name)) {
        continue
      }

      if (core.isDebug()) {
        console.log(secretProperties.name)
      }
      const secretValue = await this.getSecret(secretProperties.name)
      const secret = {
        name: secretProperties.name,
        value: secretValue.value,
        enabled: secretProperties.enabled ?? false
      }

      result.push(secret)
    }

    return result
  }

  async getAllSecrets(onlyActive: boolean = false): Promise<Secret[]> {
    const result: Secret[] = []
    for await (const secretProperties of this._client.listPropertiesOfSecrets()) {
      if (core.isDebug()) {
        console.log(secretProperties.name)
      }
      if (onlyActive && secretProperties.enabled === false) {
        continue
      }

      const secretValue = await this.getSecret(secretProperties.name)
      const secret = {
        name: secretProperties.name,
        value: secretValue.value,
        enabled: secretProperties.enabled ?? false
      }

      result.push(secret)
    }

    return result
  }
}
