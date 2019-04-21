deploy-function:
	(cd lib; gcloud beta functions deploy tabelog_shop --trigger-http)

build:
	npm run build
deploy:
	rsync -v -r --delete dist/ kmc:private_html/meshi-cards