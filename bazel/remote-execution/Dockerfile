# https://github.com/puppeteer/puppeteer/blob/866addd132270e56cb1f84885f2897123087215c/docker/Dockerfile
FROM ghcr.io/puppeteer/puppeteer:24.36.0@sha256:60273620ab047d273d77f8535cd3adaffa9c138e3b38ba7934d8934a7b5d3c92

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
