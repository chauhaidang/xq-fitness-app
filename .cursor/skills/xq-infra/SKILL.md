---
name: xq-infra
description: Guides use of the xq-infra CLI for spinning up local test environments (database, services, gateway). Use when running integration tests, troubleshooting test environment startup, or working with xq-test-infra, xq-infra generate, xq-infra up, or xq-infra down.
---

# xq-infra CLI

CLI for running local test environments: database, backend services, and gateway. Required for integration tests that make real API calls.

## Installation

```bash
npm install -g @chauhaidang/xq-test-infra@1.0.3
```

Requires GitHub Packages access (`registry-url: https://npm.pkg.github.com/`, scope `@chauhaidang`).

## Core Commands

| Command | Purpose |
|---------|---------|
| `xq-infra generate -f ./test-env` | Generate config from `test-env/` (e.g. nginx-gateway.conf) |
| `xq-infra up` | Start all services (DB, read-service, write-service, gateway) |
| `xq-infra down` | Stop and remove containers |
| `xq-infra logs` | Show container logs (useful when debugging) |

## Workflow: Mobile Integration Tests

From **mobile/** (same directory as `test-env/`):

```bash
xq-infra generate -f ./test-env
xq-infra up
npm run test:integration
# When done:
xq-infra down
```

**Important**: Run `xq-infra` from the directory that contains `test-env/`. Do not use a different path.

## test-env Structure

- **xq.config.yml**: Port range, dependency groups (e.g. `database`)
- **xq-fitness-db.service.yml**: PostgreSQL (port 5432)
- **xq-fitness-read-service.service.yml**: Read API (port 8080)
- **xq-fitness-write-service.service.yml**: Write API (port 3000)
- **xq-gateway**: Auto-injected by xq-infra; exposes services on port 8080

## Gateway URL

Integration tests use `GATEWAY_URL=http://localhost:8080` (default). The app resolves:

- Read: `${GATEWAY_URL}/xq-fitness-read-service/api/v1`
- Write: `${GATEWAY_URL}/xq-fitness-write-service/api/v1`

## Port Conflicts

If startup fails or you see "address already in use":

1. Check for other stacks (read-service, write-service, mobile) using the same ports
2. Run `xq-infra down` in those project directories
3. Avoid running multiple test envs that share ports (5432, 8080)

## CI Usage

```yaml
- run: npm install -g @chauhaidang/xq-test-infra@1.0.3
- run: xq-infra generate -f ./test-env && xq-infra up
- run: npm run test:integration
- if: always()
  run: |
    xq-infra logs
    xq-infra down
```

## Troubleshooting

| Issue | Action |
|-------|--------|
| `xq-infra` not found | Run `npm install -g @chauhaidang/xq-test-infra@1.0.3` |
| Port in use | Run `xq-infra down` in other project dirs; stop conflicting containers |
| Services not ready | Wait a few seconds after `xq-infra up` before running tests |
| Auth errors (npm) | Ensure `NODE_AUTH_TOKEN` or `.npmrc` for GitHub Packages |
