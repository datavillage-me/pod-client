#!/usr/bin/env bash

set -e

REGISTRY="europe-west1-docker.pkg.dev/dv-cluster/datavillage"

image="s4m-onboarding"
PACKAGE_VERSION=latest

echo ${REGISTRY}/${image}:${PACKAGE_VERSION}
docker build -t ${REGISTRY}/${image}:${PACKAGE_VERSION} .
docker push ${REGISTRY}/${image}:${PACKAGE_VERSION}
