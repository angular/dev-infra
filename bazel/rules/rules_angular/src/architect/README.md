# Angular Architect

Architect is a subsystem of Angular CLI which performs build and test steps.
This makes it a simple, and natural integration point with Bazel as the orchestration.

This is not as fast as the other rules in this repository, but it should be guaranteed
to serve as a drop-in replacement for any Angular workspace.
