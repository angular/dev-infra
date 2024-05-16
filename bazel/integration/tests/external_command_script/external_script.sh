#!/usr/bin/env bash

if [[ "$1" != "First" ]]; then
  echo "First argument not matching: $1"
  exit 1
fi

if [[ "$2" != "Second" ]]; then
  echo "Second argument not matching: $2"
  exit 1
fi
