# Init

```shell
npm install
```


# Dev

```shell
turbo dev
```

This will:

- Run a local solo node
- Deploy contracts on it
- Start website in development mode
- Start a CloudFlare Worker within the pages
    - with fee delegation

You need to:

- Add network `http://localhost:8669` to VeWorld to make this work

# Files

* `dist/config.ts` is updated on contract deployments and used for contract access in website

# Todo

- [ ] Improve configuration to easier toggle between networks (especially solo/testnet)
- [ ] Streamline environment configuration, to avoid duplication
- [ ] Simplify turbo configuration
- [ ] Create a demo deployment
- [ ] Fix solo signing failing