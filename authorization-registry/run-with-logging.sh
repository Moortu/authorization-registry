#!/bin/bash

RUST_LOG=tower_http=debug,authorization_registry=debug,ishare=debug cargo run -p authorization_registry -- "$@"
