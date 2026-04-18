# ADS-AI GitLab CI/CD Pipeline

This document explains the GitLab CI pipeline defined in `.gitlab-ci.yml` at the repo root, including stages, jobs, rules, and notes about how the pipeline executes.

## Overview

- **Default image**: `node:20` (used unless job overrides it).
- **Cache**: `adsai/node_modules/` and `adsai/.next/cache/` keyed by commit ref.
- **Workflow rules**: pipelines run on merge request events and on `main` or `dev` branches.

## Pipeline Stages

The pipeline defines the following ordered stages:

- **check** — run lint/tests (quality gates)
- **preview** — builds and publishes preview deployments for MRs; notifies MR with preview URL
- **promote** — manual promotion jobs for moving `dev` to `main`
- **production** — deployment to production (Vercel)
- **verify** — run production health checks
- **rollback** — automatic rollback job when verification fails

Jobs are assigned to these stages and execute in stage order. Jobs in the same stage may run in parallel unless explicit dependencies are added.

## Jobs (summary)

- **test_suite** (stage: `check`)
  - Purpose: Install dependencies and run test/lint steps.
  - Runs: `cd adsai && npm ci` (lint/test steps are commented out but advertised).
  - Triggers: MR events and commits to `main`/`dev`.

- **deploy_preview** (stage: `preview`)
  - Purpose: Build & deploy a preview for merge requests using Vercel.
  - Steps: install `vercel` CLI, `vercel pull`, `vercel build`, `vercel deploy --prebuilt` (stores preview URL in `preview_url.txt`).
  - Environment: `review/$CI_MERGE_REQUEST_IID` (with `on_stop: stop_preview`).
  - Trigger: Manual on MR pipelines.

- **notify_mr** (stage: `preview`)
  - Purpose: Post a comment on the MR with the preview URL (uses `curlimages/curl` image).
  - Depends on: `deploy_preview` (declared with `needs`).
  - Notes: Uses CI API and `GITLAB_API_TOKEN` to post a MR note.

- **stop_preview** (stage: `preview`)
  - Purpose: Manually stop the preview environment for the MR (environment action `stop`).
  - Trigger: Manual on MR pipelines.

- **promote_to_main** (stage: `promote`)
  - Purpose: Manual job to merge the current commit (on `dev`) into `main` and push it.
  - Image: `alpine:latest`, installs `git`, uses `$GITLAB_API_TOKEN` to authenticate push.
  - Trigger: Manual when running on `dev` branch.

- **deploy_production** (stage: `production`)
  - Purpose: Build and deploy production app to Vercel using `vercel` CLI.
  - Triggers: Automatically runs for commits to `main`.

- **health_check** (stage: `verify`)
  - Purpose: Basic health check (HTTP HEAD) against production URL to verify deployment.
  - Image: `curlimages/curl:latest`.
  - Behavior: Sleeps briefly to allow propagation, then runs `curl --fail` against the URL.
  - Trigger: `main` branch.

- **auto_rollback** (stage: `rollback`)
  - Purpose: If `health_check` fails, attempt `vercel rollback` (uses `node:20` image).
  - Needs: `health_check`.
  - When: `on_failure` and runs only for `main` branch.

## How the flow works (high level)

- Merge request pipelines: `test_suite` runs, then optionally `deploy_preview` (manual), which produces a preview URL and triggers `notify_mr` to comment on the MR. A `stop_preview` job can stop the preview manually.
- Promotion: Changes on `dev` can be manually promoted into `main` with `promote_to_main`.
- Production: Commits to `main` trigger `deploy_production`, followed by `health_check`. If verification fails, `auto_rollback` runs (on failure) to rollback the Vercel deployment.

## Important variables and tokens

- `VERCEL_TOKEN` — required to authenticate Vercel CLI for deploys and rollbacks.
- `GITLAB_API_TOKEN` — used to post MR comments and to allow CI push operations.

## Notes & Recommendations

- Consider enabling `npm run lint` and `npm run test` in `test_suite` (they are currently commented out).
- Consider adding explicit `needs:` between jobs where ordering matters within the same stage.
- Protect `main` branch and require passing pipelines before merges.
- Consider adding retry/backoff for health check or multiple checks with increasing delay.

---
Generated from the project's `.gitlab-ci.yml` (stages, jobs, and rules) on 12 Dec 2025.
