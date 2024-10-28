GPL v3 license

## Applying database migration
Make sure that a postgres database exists with the name 'authorization_registry' and the `database_url` in `.config.json` is set to the address of that database.
- `cd authorization-registry/migration`
- To apply migrations makes sure that the environment variable `DATABASE_URL` is set
- To do a migration from scratch (deleting all currect data): `cargo run -- fresh`
- To apply all pending migration: `cargo run -- up`
- To roll-back the last migration: `cargo run -- down`
- To see more example: [authorization-registry/migration/README.md](./authorization-registry/migration/README.md)