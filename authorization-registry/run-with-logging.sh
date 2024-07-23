#!/bin/bash

RUST_LOG=tower_http=debug,authorization_registry=debug cargo run -p authorization_registry -- "$@"
