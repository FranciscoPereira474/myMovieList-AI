## Job Dependencies Diagram

This ASCII diagram maps the key branches (`dev`, MR preview, and `main`) to pipeline stages and job flows for the project's `.gitlab-ci.yml`.

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                    DEV BRANCH                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  ┌─────────────┐    ┌──────────┐    ┌──────────┐    ┌───────────────────────┐         ║
║  │  test_suite │───▶│ (manual) │───▶│ deploy   │───▶│ promote_to_main (M)   │         ║
║  │   (check)   │    │deploy_prv│    │preview   │    └───────────┬───────────┘         ║
║  └─────────────┘    └──────────┘    └──────────┘                │                     ║
║                      (on manual MR)    │                        │                     ║
║                                        │                        │                     ║
║                                        ▼                        │                     ║
║                                 ┌────────────┐                  │                     ║
║                                 │ notify_mr  │                  │                     ║
║                                 └────────────┘                  │                     ║
║                                                                 │                     ║
╚═════════════════════════════════════════════════════════════════╪═════════════════════╝
                                                                  │
                              ┌───────────────────────────────────┘
                              │  AUTOMATIC / MANUAL PROMOTE (dev->main)
                              ▼
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                                   MAIN BRANCH                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐                  ║
║  │ deploy_production│───▶│  health_check   │───▶│ auto_rollback if │                  ║
║  │   (production)   │    │   (verify)      │    │   health check   │                  ║
║  └──────────────────┘    └─────────────────┘    │     fails        │                  ║
║                                                 └────────┬─────────┘                  ║
║                                                          │                            ║
║                                                          ▼                            ║
║                                                   ┌───────────────┐                   ║
║                                                   │  vercel       │                   ║ 
║                                                   │  rollback     │                   ║
║                                                   └───────────────┘                   ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝

``` 

Legend:
- Arrows show typical job ordering and handoffs.
- `(M)` indicates manual jobs; `notify_mr` runs after preview succeeds and posts the preview URL.
- The `auto_rollback` job runs on failure of `health_check` and is configured with `when: on_failure`.
