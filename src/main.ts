import * as core from '@actions/core'
import { getClient, getCredentials, getSecrets } from './client'
import { processSecrets } from './secrets'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const d: core.InputOptions = { required: true } 
    const keyVaultName = core.getInput('keyvault_name')
    if (core.isDebug()) {
      console.log(`KeyVault name: ${keyVaultName}`)
    }
    if (!keyVaultName) {
      throw new Error('The keyvault-name input is required')
    }
    const credentials = getCredentials()
    console.log(`Getting secrets from ${keyVaultName}...`)
    const client = getClient(keyVaultName, credentials)
    const secrets = await getSecrets(client)
    console.log('Processing secrets...')
    await processSecrets(client, secrets)
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
