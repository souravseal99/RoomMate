# Branch Protection Rules

This document outlines the required GitHub branch protection settings for the `main` and `develop` branches. It ensures that the pipeline is enforced and not accidentally bypassed by contributors.

## Required Status Checks (develop)
- app-quality
- server-quality
- server-tests
- pr-summary

## Required Status Checks (main)
- All of the checks required for `develop`
- security-scan

## Settings
Ensure the following repository settings are enabled:
- Require branches to be up to date before merging: true
- Require linear history: true
- Allow force pushes: false
