# https://github.com/puppeteer/puppeteer/blob/866addd132270e56cb1f84885f2897123087215c/docker/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:20.9.0@sha256:23247f96e0384b2b8f12c9f59c4f3b44907b92dccfcf9dac31724f911d40e3fb

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
