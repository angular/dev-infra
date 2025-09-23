# https://github.com/puppeteer/puppeteer/blob/866addd132270e56cb1f84885f2897123087215c/docker/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.22.2@sha256:897ff1b3c914f858185ea724f7db2f2f8c76d6a6a1cb827fc1f1d3b1d3890566

# Switch back to `root` because Puppeteer sets up a non-root user in the
# image- preventing us from preparing Firefox dependencies.
USER root

# Perform update/upgrade with Debian bullseye added. Puppeteer uses
# `node:18` which does not have the repository added for installing Firefox.
RUN echo 'deb http://deb.debian.org/debian bullseye main' >> /etc/apt/sources.list
RUN apt-get -y update && apt-get -y upgrade

# Install Firefox so that all dependencies are available. Firefox will
# still be launched via Bazel's managed version.
RUN apt-get -y install firefox-esr
