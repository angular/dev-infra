## shared-scripts

This is a Directory containing scripts that are commonly used in consumer Angular projects or
Bazel actions.

#### Important Note for authors:

We also expose the `BUILD.bazel` files here as this allows for fine-grained dependencies when
scripts are used within Bazel actions, and it helps with using these shared scripts directly
in the `angular/dev-infra` repository itself.
