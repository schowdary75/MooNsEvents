# Benchmark reports

This directory contains committed benchmark evidence, not capacity claims. A report belongs here
only after `npm run benchmark` completes successfully for the exact commit and its raw workflow
artifact has been reviewed.

The canonical baseline runs from the manually triggered **Reproducible benchmark** GitHub Actions
workflow. It uses a production-mode API with constrained MySQL and Redis containers on the same
hosted runner as the load generator. The runner records its environment because GitHub-hosted
hardware and contention can vary.

## Publishing the first result

1. Trigger the workflow for the commit being evaluated.
2. Confirm the job passed its validity checks and download `benchmark-<commit>`.
3. Review `result.json`, `resources.csv`, and the top MySQL statement digests.
4. Copy the generated `report.md` here as `YYYY-MM-DD-github-actions-<short-commit>.md` without
   changing measured values.
5. Keep the workflow artifact as the machine-readable source for the Markdown report.

No report is committed merely because the harness exists. A failed or unavailable run is evidence
that the method still needs work, not permission to estimate results.
