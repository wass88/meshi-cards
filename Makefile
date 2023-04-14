deploy-function:
	(cd lib; gcloud --project meshi-card beta functions deploy tabelog_shop --trigger-http --runtime nodejs18)

build:
	npm run build
deploy:
	rsync -v -r --delete dist/ kmc:private_html/meshi-cards