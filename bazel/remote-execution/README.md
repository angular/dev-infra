### Pushing a docker image to Cloud Artifacts

**Note**: GCP Remote build execution does not allow arbitrary images from e.g. Docker registry
or from GitHub packages. Only `pkg.dev` or `gcr.io`.

```bash
gcloud auth configure-docker \
    us-west2-docker.pkg.dev

sudo docker build . --network=host -t angular-devinfra-rbe-image:latest

sudo docker tag angular-devinfra-rbe-image:latest \
  us-west2-docker.pkg.dev/internal-200822/remote-execution-images/angular-devinfra-rbe-image:202305

sudo docker push us-west2-docker.pkg.dev/internal-200822/remote-execution-images/angular-devinfra-rbe-image:202305
````
