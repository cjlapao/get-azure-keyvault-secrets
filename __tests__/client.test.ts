/*eslint-disable @typescript-eslint/no-var-requires */
/*eslint-disable @typescript-eslint/no-unused-vars */

import { AzureCredentials } from './../src/models'
import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity'
import { Client } from '../src/client'
import { SecretClient } from '@azure/keyvault-secrets'

let tenantId = ''
let clientId = ''
let clientSecret = ''
let isDebug = false

const secretName1 = {
  name: 'secretName1',
  value: 'secretValue1',
  properties: {
    enabled: true
  }
}

const secretName2 = {
  name: 'secretName2',
  value: 'secretValue2',
  properties: {
    enabled: false
  }
}

const secretName3 = {
  name: 'secretName3',
  value: 'secretValue3',
  properties: {
    enabled: true
  }
}

const secretName4 = {
  name: 'secretName4',
  value: 'secretValue4',
  properties: {
    enabled: true
  }
}

const secretProperty1 = {
  valueUrl: 'valueUrl',
  name: secretName1.name,
  enabled: secretName1.properties.enabled
}

const secretProperty2 = {
  valueUrl: 'valueUrl',
  name: secretName2.name,
  enabled: secretName2.properties.enabled
}

const secretProperty3 = {
  valueUrl: 'valueUrl',
  name: secretName3.name,
  enabled: secretName3.properties.enabled
}

const secretProperty4 = {
  valueUrl: 'valueUrl',
  name: secretName4.name,
  enabled: secretName4.properties.enabled
}

jest.mock('@azure/identity', () => {
  return {
    DefaultAzureCredential: jest.fn().mockImplementation(() => {
      return {
        getToken: jest.fn().mockResolvedValueOnce({ token: 'token' })
      }
    }),
    ClientSecretCredential: jest.fn().mockImplementation(() => {
      return {
        getToken: jest.fn().mockResolvedValueOnce({ token: 'token' })
      }
    })
  }
})

jest.mock('@azure/keyvault-secrets', () => {
  return {
    DefaultAzureCredential: jest.fn().mockImplementation(() => {
      return {
        getToken: jest.fn().mockResolvedValueOnce({ token: 'token' })
      }
    }),
    SecretClient: jest.fn().mockImplementation(() => {
      return {
        getSecret: jest.fn().mockImplementation((name: string) => {
          if (name === 'secretName1') {
            return secretName1
          }
          if (name === 'secretName2') {
            return secretName2
          }
          if (name === 'secretName3') {
            return secretName3
          }
          if (name === 'secretName4') {
            return secretName4
          }
          return null
        }),
        listPropertiesOfSecrets: jest
          .fn()
          .mockImplementation(() => [
            secretProperty1,
            secretProperty2,
            secretProperty3,
            secretProperty4
          ])
      }
    })
  }
})

jest.mock('@actions/core', () => {
  return {
    getInput: jest.fn().mockImplementation((name: string) => {
      if (name === 'tenant_id') {
        return tenantId
      }
      if (name === 'client_id') {
        return clientId
      }
      if (name === 'client_secret') {
        return clientSecret
      }
      return ''
    }),
    isDebug: jest.fn().mockImplementation(() => {
      return isDebug
    }),
    setFailed: jest.fn(),
    exportVariable: jest.fn(),
    setSecret: jest.fn()
  }
})

describe('Client', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('constructor', () => {
    describe('when using user default credentials', () => {
      it('should create a new instance of the SecretClient', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        const credentials: AzureCredentials = {
          userDefaultCredentials: true
        }

        // Act
        const client = new Client(keyVaultName, credentials)

        // Assert
        expect(client).toBeDefined()
        expect(DefaultAzureCredential).toHaveBeenCalledTimes(1)
        expect(SecretClient).toHaveBeenCalledTimes(1)
      })
    })

    describe('when using client secret credentials', () => {
      it('should create a new instance of the SecretClient', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        const credentials: AzureCredentials = {
          tenantId: 'tenantId',
          clientId: 'clientId',
          clientSecret: 'clientSecret'
        }

        // Act
        const client = new Client(keyVaultName, credentials)

        // Assert
        expect(client).toBeDefined()
        expect(ClientSecretCredential).toHaveBeenCalledTimes(1)
        expect(SecretClient).toHaveBeenCalledTimes(1)
      })

      it('should throw an error if tenantId is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        const credentials: AzureCredentials = {
          clientId: 'clientId',
          clientSecret: 'clientSecret'
        }

        // Act
        const action = () => new Client(keyVaultName, credentials)

        // Assert
        expect(action).toThrow('The tenant_id input is required')
      })

      it('should throw an error if clientId is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        const credentials: AzureCredentials = {
          tenantId: 'tenantId',
          clientSecret: 'clientSecret'
        }

        // Act
        const action = () => new Client(keyVaultName, credentials)

        // Assert
        expect(action).toThrow('The client_id input is required')
      })

      it('should throw an error if clientSecret is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        const credentials: AzureCredentials = {
          tenantId: 'tenantId',
          clientId: 'clientId'
        }

        // Act
        const action = () => new Client(keyVaultName, credentials)

        // Assert
        expect(action).toThrow('The client_secret input is required')
      })
    })

    describe('when no credentials are provided', () => {
      beforeEach(() => {
        tenantId = ''
        clientId = ''
        clientSecret = ''
      })

      it('should create a new instance of the SecretClient if env vars are defined', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        tenantId = 'tenantId'
        clientId = 'clientId'
        clientSecret = 'clientSecret'

        // Act
        const client = new Client(keyVaultName)

        // Assert
        expect(client).toBeDefined()
        expect(SecretClient).toHaveBeenCalledTimes(1)
      })

      it('should throw an error if tenantId is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        clientId = 'clientId'
        clientSecret = 'clientSecret'

        // Act
        const action = () => new Client(keyVaultName)

        // Assert
        expect(action).toThrow('The tenant_id input is required')
      })

      it('should throw an error if clientId is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        tenantId = 'tenantId'
        clientSecret = 'clientSecret'

        // Act
        const action = () => new Client(keyVaultName)

        // Assert
        expect(action).toThrow('The client_id input is required')
      })

      it('should throw an error if clientSecret is not provided', () => {
        // Arrange
        const keyVaultName = 'keyVaultName'
        tenantId = 'tenantId'
        clientId = 'clientId'

        // Act
        const action = () => new Client(keyVaultName)

        // Assert
        expect(action).toThrow('The client_secret input is required')
      })
    })
  })

  describe('getSecret', () => {
    beforeEach(() => {
      tenantId = 'tenantId'
      clientId = 'clientId'
      clientSecret = 'clientSecret'
    })

    it('should return the correct secret', async () => {
      // Arrange
      const client = new Client('keyVaultName')

      // Act
      const secret1 = await client.getSecret('secretName1')
      const secret2 = await client.getSecret('secretName2')

      // Assert
      expect(secret1).toEqual({
        name: secretName1.name,
        value: secretName1.value,
        enabled: secretName1.properties.enabled
      })
      expect(secret2).toEqual({
        name: secretName2.name,
        value: secretName2.value,
        enabled: secretName2.properties.enabled
      })
      expect(client).toBeDefined()
    })
  })

  describe('getSecrets', () => {
    beforeEach(() => {
      tenantId = 'tenantId'
      clientId = 'clientId'
      clientSecret = 'clientSecret'
      isDebug = true
    })

    it('should return the correct secrets, ignoring the disabled ones', async () => {
      // Arrange
      const client = new Client('keyVaultName')

      // Act
      const secrets = await client.getSecrets([
        'secretName1',
        'secretName2',
        'secretName3'
      ])

      // Assert
      expect(secrets).toEqual([
        {
          name: secretName1.name,
          value: secretName1.value,
          enabled: secretName1.properties.enabled
        },
        {
          name: secretName3.name,
          value: secretName3.value,
          enabled: secretName3.properties.enabled
        }
      ])

      expect(client).toBeDefined()
      expect(SecretClient).toHaveBeenCalledTimes(1)
    })

    describe('getAllSecrets', () => {
      beforeEach(() => {
        tenantId = 'tenantId'
        clientId = 'clientId'
        clientSecret = 'clientSecret'
        isDebug = true
      })

      it('should return all secrets if onlyActive is disabled', async () => {
        // Arrange
        const client = new Client('keyVaultName')

        // Act
        const secrets = await client.getAllSecrets()

        // Assert
        expect(secrets).toEqual([
          {
            name: secretName1.name,
            value: secretName1.value,
            enabled: secretName1.properties.enabled
          },
          {
            name: secretName2.name,
            value: secretName2.value,
            enabled: secretName2.properties.enabled
          },
          {
            name: secretName3.name,
            value: secretName3.value,
            enabled: secretName3.properties.enabled
          },
          {
            name: secretName4.name,
            value: secretName4.value,
            enabled: secretName4.properties.enabled
          }
        ])

        expect(client).toBeDefined()
        expect(SecretClient).toHaveBeenCalledTimes(1)
      })

      it('should return all secrets', async () => {
        // Arrange
        const client = new Client('keyVaultName')

        // Act
        const secrets = await client.getAllSecrets(true)

        // Assert
        expect(secrets).toEqual([
          {
            name: secretName1.name,
            value: secretName1.value,
            enabled: secretName1.properties.enabled
          },
          {
            name: secretName3.name,
            value: secretName3.value,
            enabled: secretName3.properties.enabled
          },
          {
            name: secretName4.name,
            value: secretName4.value,
            enabled: secretName4.properties.enabled
          }
        ])

        expect(client).toBeDefined()
        expect(SecretClient).toHaveBeenCalledTimes(1)
      })
    })
  })
})
