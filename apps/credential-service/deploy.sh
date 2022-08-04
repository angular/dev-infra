if [ -z $(which gcloud) ]; then
  echo "###################################################################"
  echo "# Failed:                                                         #"
  echo "#  gcloud must be installed in order to deploy this service        #"
  echo "###################################################################"
  exit 1;
fi

gcloud run deploy credential-service --platform=managed --region=us-central1 --source $(dirname "$0")
