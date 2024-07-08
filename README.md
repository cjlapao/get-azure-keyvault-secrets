# Get Azure KeyVault Secrets ![David](https://img.shields.io/david/cjlapao/Get Azure KeyVault Secrets)

> Get all the Azure KeyVault Secrets and inject them as Environment variables for your github actions





## Inputs
It takes a github-token as an input. See [how to create and store a token](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)

## Example Usage

```yml
- name: create a gif
  uses: cjlapao/Get Azure KeyVault Secrets@master
  with:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## license

[MIT](/LICENSE) &copy; 2020 cjlapao
