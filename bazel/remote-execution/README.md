### Pushing a docker image to Cloud Artifacts

**Note**: GCP Remote build execution does not allow arbitrary images from e.g. Docker registry
or from GitHub packages. Only `pkg.dev` or `gcr.io`.

```bash
gcloud auth configure-docker \
    us-west2-docker.pkg.dev

sudo docker tag ghcr.io/puppeteer/puppeteer:20.5.0@sha256:c40e0fa5da89259dbd93e0421e7faec7c39efef36fd7cbb62b24ff7f7151602b \
  us-west2-docker.pkg.dev/internal-200822/remote-execution-images/angular-devinfra-rbe-image:202305
````
