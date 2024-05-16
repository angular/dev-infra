load("//docs/pipeline:_guides.bzl", _generate_guides = "generate_guides")
load("//docs/pipeline:_stackblitz.bzl", _generate_stackblitz = "generate_stackblitz")
load("//docs/pipeline:_playground.bzl", _generate_playground = "generate_playground")
load("//docs/pipeline:_tutorial.bzl", _generate_tutorial = "generate_tutorial")

generate_guides = _generate_guides
generate_stackblitz = _generate_stackblitz
generate_playground = _generate_playground
generate_tutorial = _generate_tutorial
