deploy-function:
	(cd lib; gcloud beta functions deploy tabelog_shop --trigger-http)