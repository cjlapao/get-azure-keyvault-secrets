# Get Azure KeyVault Secrets

> Get all the Azure KeyVault Secrets and inject them as Environment variables
> for your github actions

## Inputs

It takes a github-token as an input. See [how to create and store a token](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)

## Example Usage

```yml
- name: Get Azure KeyVault Secrets
  uses: cjlapao/get-azure-keyvault-secrets@v1
  with:
    TENANT-ID: ${{ secrets.TENANT_ID }}
    CLIENT-ID: ${{ secrets.CLIENT_ID }}
    CLIENT-SECRET: ${{ secrets.CLIENT_SECRET }}
    KEYVAULT-NAME: ${{ secrets.KEYVAULT_NAME }}
```

You can also use a separator to replace the values to a secret.sub-secret format

```yml
- name: Get Azure KeyVault Secrets
  uses: cjlapao/get-azure-keyvault-secrets@v1
  with:
    TENANT-ID: ${{ secrets.TENANT_ID }}
    CLIENT-ID: ${{ secrets.CLIENT_ID }}
    CLIENT-SECRET: ${{ secrets.CLIENT_SECRET }}
    KEYVAULT-NAME: ${{ secrets.KEYVAULT_NAME }}
    SEPARATOR: '--'
```

## license

[MIT](/LICENSE) &copy; 2020 cjlapao
