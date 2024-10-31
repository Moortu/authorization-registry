GPL v3 license

## Applying database migration
Make sure that a postgres database exists with the name 'authorization_registry' and the `database_url` in `.config.json` is set to the address of that database.
- `cd authorization-registry/migration`
- To apply migrations makes sure that the environment variable `DATABASE_URL` is set
- To do a migration from scratch (deleting all current data): `cargo run -- fresh`
- To apply all pending migration: `cargo run -- up`
- To roll-back the last migration: `cargo run -- down`
- To see more example: [authorization-registry/migration/README.md](./authorization-registry/migration/README.md)

## To run frontend
- Edit `./ar-frontend/.env` and set `VITE_IDP_URL` to the location of the idp
When running in dev mode
- Edit `./ar-frontend/.env` and set `VITE_BASE_API_URL` to the clearing backend (usually `http://localhost:4000`)
When running in production
- `npm run build`