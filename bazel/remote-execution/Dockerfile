# https://github.com/puppeteer/puppeteer/blob/866addd132270e56cb1f84885f2897123087215c/docker/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.35.0@sha256:f9032ca7bfc11f3d808377f0d2ddd8c1068c3f1a0daf8032166d14cd7cc4d2be

# Switch back to `root` because Puppeteer sets up a non-root user in the
# image- preventing us from preparing Firefox dependencies.
USER root

# Perform update/upgrade with Debian bullseye added.
# This allows us to install Firefox for its dependencies.
RUN echo 'deb http://deb.debian.org/debian bullseye main' >> /etc/apt/sources.list
RUN apt-get -y update && apt-get -y upgrade

# Install Firefox so that all dependencies are available. Firefox will
# still be launched via Bazel's managed version.
RUN apt-get -y install firefox-esr
