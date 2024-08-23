/*eslint-disable @typescript-eslint/no-var-requires */
/*eslint-disable @typescript-eslint/no-unused-vars */

import { Client } from './../src/client'
import { run } from '../src/main'
import { parseSecretName, parseSecretsInput } from '../src/secretsParser'
import {
  getInput,
  isDebug,
  setFailed,
  setOutput,
  exportVariable,
  setSecret
} from '@actions/core'

jest.mock('../src/client')
jest.mock('@azure/keyvault-secrets')
jest.mock('../src/secretsParser')

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  exportVariable: jest.fn(),
  setSecret: jest.fn(),
  isDebug: jest.fn(),
  setFailed: jest.fn()
}))

console.log = jest.fn()
console.error = jest.fn()
const clientMock = Client as jest.MockedClass<typeof Client>
const getInputMock = getInput as jest.MockedFunction<typeof getInput>
const isDebugMock = isDebug as jest.MockedFunction<typeof isDebug>
const setOutputMock = setOutput as jest.MockedFunction<typeof setOutput>
const setFailedMock = setFailed as jest.MockedFunction<typeof setFailed>
const exportVariableMock = exportVariable as jest.MockedFunction<
  typeof exportVariable
>
const setSecretMock = setSecret as jest.MockedFunction<typeof setSecret>
const parseSecretNameMock = parseSecretName as jest.MockedFunction<
  typeof parseSecretName
>
const parseSecretsInputMock = parseSecretsInput as jest.MockedFunction<
  typeof parseSecretsInput
>

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if keyvault_name input is missing', async () => {
    // Arrange
    getInputMock.mockReturnValue('')

    // Act
    await run()

    // Assert
    expect(setFailed).toHaveBeenCalledWith(
      'The keyvault-name input is required'
    )
  })

  it('should log the keyvault name if debug mode is enabled', async () => {
    getInputMock.mockReturnValue('myKeyVault')
    isDebugMock.mockReturnValue(true)

    await run()
    expect(getInput).toHaveBeenCalledWith('keyvault_name')
    expect(isDebug).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('KeyVault name: myKeyVault')
  })

  it('should create a Keyvault client and get all secrets if secrets input is empty', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('')

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() => Promise.resolve([]))

    await run()

    expect(clientMock).toHaveBeenCalledWith('myKeyVault')
    expect(getSecretsSpy).toHaveBeenCalledWith([])
    expect(console.log).toHaveBeenCalledWith('Creating Keyvault client...')
    expect(console.log).toHaveBeenCalledWith('Getting Secrets...')
  })

  it('should create a Keyvault client and get specified secrets if secrets input is provided', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1\nsecret2\nsecret3')
    parseSecretsInputMock.mockReturnValue(['secret1', 'secret2', 'secret3'])

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() => Promise.resolve([]))

    await run()
    expect(Client).toHaveBeenCalledWith('myKeyVault')
    expect(getSecretsSpy).toHaveBeenCalledWith([
      'secret1',
      'secret2',
      'secret3'
    ])
    expect(console.log).toHaveBeenCalledWith('Creating Keyvault client...')
    expect(console.log).toHaveBeenCalledWith('Getting Secrets...')
  })

  it('should parse and process each secret', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1\nsecret2\nsecret3')
    parseSecretsInputMock.mockReturnValue(['secret1', 'secret2', 'secret3'])

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'value1', enabled: true },
          { name: 'secret2', value: 'value2', enabled: false },
          { name: 'secret3', value: '', enabled: true }
        ])
      )

    await run()
    expect(parseSecretsInputMock).toHaveBeenCalledWith(
      'secret1\nsecret2\nsecret3'
    )
    expect(getSecretsSpy).toHaveBeenCalledWith([
      'secret1',
      'secret2',
      'secret3'
    ])
    expect(parseSecretNameMock).toHaveBeenCalledTimes(3)
    expect(setOutputMock).toHaveBeenCalledTimes(1)
    expect(exportVariableMock).toHaveBeenCalledTimes(0)
    expect(setSecretMock).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('Processing secrets...')
    expect(console.log).toHaveBeenCalledWith(
      'Skipping disabled secret: secret2'
    )
    expect(console.log).toHaveBeenCalledWith('Skipping empty secret: secret3')
  })

  it('should set the secret value as output and export to environment if export_to_env is true', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1')
    getInputMock.mockReturnValueOnce('|')
    getInputMock.mockReturnValueOnce('8')
    getInputMock.mockReturnValueOnce('true')
    parseSecretNameMock.mockReturnValue('my_secret_value')
    parseSecretsInputMock.mockReturnValue(['secret1'])

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'my|secret|value', enabled: true }
        ])
      )

    await run()
    expect(setOutputMock).toHaveBeenCalledWith(
      'my_secret_value',
      'my|secret|value'
    )
    expect(exportVariableMock).toHaveBeenCalledWith(
      'my_secret_value',
      'my|secret|value'
    )
  })

  it('should set the secret value as output and not export to environment if export_to_env is false', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1')
    getInputMock.mockReturnValueOnce('|')
    getInputMock.mockReturnValueOnce('8')
    getInputMock.mockReturnValueOnce('false')
    parseSecretsInputMock.mockReturnValue(['secret1'])
    parseSecretNameMock.mockReturnValue('secret1')

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'my|secret|value', enabled: true }
        ])
      )

    await run()
    expect(setOutputMock).toHaveBeenCalledWith('secret1', 'my|secret|value')
    expect(exportVariableMock).not.toHaveBeenCalled()
  })

  it('should set the secret value as secret if its length is greater than min_mask_length', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1')
    getInputMock.mockReturnValueOnce('|')
    getInputMock.mockReturnValueOnce('8')
    getInputMock.mockReturnValueOnce('true')
    parseSecretsInputMock.mockReturnValue(['secret1'])

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'my|secret|value', enabled: true }
        ])
      )

    await run()
    expect(setSecretMock).toHaveBeenCalledWith('my|secret|value')
  })

  it('should not set the secret value as secret if its length is less than min_mask_length', async () => {
    getInputMock.mockReturnValueOnce('myKeyVault')
    getInputMock.mockReturnValueOnce('secret1')
    getInputMock.mockReturnValueOnce('|')
    getInputMock.mockReturnValueOnce('20')
    getInputMock.mockReturnValueOnce('true')
    parseSecretsInputMock.mockReturnValue(['secret1'])

    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'my|secret|value', enabled: true }
        ])
      )

    await run()
    expect(setSecretMock).not.toHaveBeenCalled()
  })

  it('should log and set the workflow as failed if an error occurs', async () => {
    getInputMock.mockReturnValueOnce('MyKeyVault')
    const error = new Error('Something went wrong')

    clientMock.mockImplementationOnce(() => {
      throw error
    })

    await run()
    expect(console.error).toHaveBeenCalledWith(error)
    expect(setFailedMock).toHaveBeenCalledWith('Something went wrong')
  })

  it('should set the test secret value as output and export to environment for testing purposes', async () => {
    getInputMock.mockReturnValueOnce('ci-action-test-keyvault')
    getInputMock.mockReturnValueOnce('secret1')
    getInputMock.mockReturnValueOnce('|')
    getInputMock.mockReturnValueOnce('8')
    getInputMock.mockReturnValueOnce('true')


    const client = new clientMock('myKeyVault')
    const getSecretsSpy = jest
      .spyOn(clientMock.prototype, 'getSecrets')
      .mockImplementationOnce(() =>
        Promise.resolve([
          { name: 'secret1', value: 'my|secret|value', enabled: true }
        ])
      )

    await run()
    expect(setOutputMock).toHaveBeenCalledWith(
      'secret1',
      'secret1Value'
    )
    expect(setOutputMock).toHaveBeenCalledWith(
      'secret2',
      'secret2Value'
    )
    expect(exportVariableMock).toHaveBeenCalledWith(
      'secret1',
      'secret1Value'
    )
    expect(exportVariableMock).toHaveBeenCalledWith(
      'secret2',
      'secret2Value'
    )
  })
})
