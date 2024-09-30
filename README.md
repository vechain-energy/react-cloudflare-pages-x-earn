# Init

```shell
echo "PRIVATE_KEY=0x$(openssl rand -hex 32)" > contracts/.env
npm install
turbo run install
```


# Dev

```shell
turbo dev
```

# Files

* `config.ts` is updated on contract deployments and used for contract access in website