
## Applying database migration

- `cd authorization-registry/migration`
- Makes sure that the environment variable `DATABASE_URL` is set
- To do a migration from scratch (deleting all current data): `cargo run -- fresh`
- To apply all pending migration: `cargo run -- up`
- To roll-back the last migration: `cargo run -- down`
- To see more example: [authorization-registry/migration/README.md](./authorization-registry/migration/README.md)