#!/usr/bin/env bash

orbName=${1}
orbVersion=${2}

cd ${BUILD_WORKSPACE_DIRECTORY}/circleci-orb

# Pack the Orb (i.e. inline the built scripts etc.)
circleci orb pack $PWD > $PWD/packed-orb.yml

# Print the packed ORB for debugging/sanity check.
cat $PWD/packed-orb.yml

read -p "Do you want to proceed publishing? (press any key to continue)" -n 1 -r

# Run the publish with the provided version and orb name.
circleci orb publish $PWD/packed-orb.yml "${orbName}@${orbVersion}"
