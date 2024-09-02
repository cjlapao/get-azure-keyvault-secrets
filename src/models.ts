/* eslint-disable @typescript-eslint/space-before-function-paren */
export interface AzureCredentials {
  tenantId?: string
  clientId?: string
  clientSecret?: string
  userDefaultCredentials?: boolean
}

export interface Secret {
  name: string
  value?: string
  enabled?: boolean
}
