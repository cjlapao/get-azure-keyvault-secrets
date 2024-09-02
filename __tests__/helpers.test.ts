/*eslint-disable @typescript-eslint/no-var-requires */
/*eslint-disable @typescript-eslint/no-unused-vars */

import { isDebug, parseNumber, parseBoolean } from '../src/helpers'

describe('helpers', () => {
  describe('isDebug', () => {
    it('should return true when RUNNER_DEBUG environment variable is set to 1', () => {
      process.env['RUNNER_DEBUG'] = '1'
      expect(isDebug()).toBe(true)
    })

    it('should return false when RUNNER_DEBUG environment variable is not set to 1', () => {
      process.env['RUNNER_DEBUG'] = '0'
      expect(isDebug()).toBe(false)
    })

    afterEach(() => {
      delete process.env['RUNNER_DEBUG']
    })
  })

  describe('parseInt', () => {
    it('should return the parsed integer value when a valid string is provided', () => {
      expect(parseNumber('42', 0)).toBe(42)
      expect(parseNumber('100', 0)).toBe(100)
      expect(parseNumber('-10', 0)).toBe(-10)
    })

    it('should return the default value when an invalid string is provided', () => {
      expect(parseNumber('abc', 0)).toBe(0)
      expect(parseNumber('', 0)).toBe(0)
    })
  })

  describe('parseBoolean', () => {
    it('should return true when a truthy string is provided', () => {
      expect(parseBoolean('true')).toBe(true)
      expect(parseBoolean('1')).toBe(true)
      expect(parseBoolean('yes')).toBe(true)
      expect(parseBoolean('y')).toBe(true)
      expect(parseBoolean('on')).toBe(true)
      expect(parseBoolean('enabled')).toBe(true)
      expect(parseBoolean('active')).toBe(true)
      expect(parseBoolean('t')).toBe(true)
    })

    it('should return false when a falsy string is provided', () => {
      expect(parseBoolean('false')).toBe(false)
      expect(parseBoolean('0')).toBe(false)
      expect(parseBoolean('no')).toBe(false)
      expect(parseBoolean('n')).toBe(false)
      expect(parseBoolean('off')).toBe(false)
      expect(parseBoolean('disabled')).toBe(false)
      expect(parseBoolean('inactive')).toBe(false)
      expect(parseBoolean('f')).toBe(false)
    })

    it('should return false when an empty string or null is provided', () => {
      expect(parseBoolean('')).toBe(false)
    })
  })
  afterEach(() => {
    delete process.env['RUNNER_DEBUG']
  })
})
