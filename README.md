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

In another terminal to run the website API/Backend:

```shell
turbo website:backend
```

This will:

- Run a local solo node
- Deploy contracts on it
- Start website in development mode

You need to:

- Add network `http://localhost:8669` to VeWorld to make this work

# Files

* `dist/config.ts` is updated on contract deployments and used for contract access in website