/*eslint-disable @typescript-eslint/no-var-requires */
/*eslint-disable @typescript-eslint/no-unused-vars */

import { parseSecretName, parseSecretsInput } from '../src/secretsParser'

describe('parseSecrets', () => {
  it('should replace spaces with underscores', () => {
    const secretName = 'my secret name'
    const expected = 'my_secret_name'

    const result = parseSecretName(secretName)

    expect(result).toEqual(expected)
  })

  it('should replace custom separator with underscores', () => {
    const secretName = 'my|secret|name'
    const separator = '|'
    const expected = 'my__secret__name'

    const result = parseSecretName(secretName, separator)

    expect(result).toEqual(expected)
  })

  it('should replace special characters with underscores', () => {
    const secretName = 'my!@#$secret%^&name'
    const expected = 'my____secret___name'

    const result = parseSecretName(secretName)

    expect(result).toEqual(expected)
  })

  it('should replace special characters with underscores and the custom separator', () => {
    const secretName = 'my|!@#$secret|%^&name'
    const separator = '|'
    const expected = 'my______secret_____name'

    const result = parseSecretName(secretName, separator)

    expect(result).toEqual(expected)
  })
})

describe('parseSecretsInput', () => {
  it('should return an empty array for an empty input string', () => {
    const input = ''
    const result = parseSecretsInput(input)
    expect(result).toEqual([])
  })

  it('should return an array of secrets for a valid input string', () => {
    const input = 'secret1\nsecret2\nsecret3'
    const result = parseSecretsInput(input)
    expect(result).toEqual(['secret1', 'secret2', 'secret3'])
  })

  it('should trim whitespace from secrets', () => {
    const input = '  secret1  \n  secret2  \n  secret3  '
    const result = parseSecretsInput(input)
    expect(result).toEqual(['secret1', 'secret2', 'secret3'])
  })

  it('should ignore empty lines', () => {
    const input = 'secret1\n\nsecret2\n\nsecret3'
    const result = parseSecretsInput(input)
    expect(result).toEqual(['secret1', 'secret2', 'secret3'])
  })
})
