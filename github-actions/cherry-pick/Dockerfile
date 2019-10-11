FROM alpine:3.10

# TODO(josephperrott): investigate using a base that has these common utils.
RUN apk --no-cache add jq bash git curl

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
