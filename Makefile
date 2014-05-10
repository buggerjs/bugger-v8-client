default: all

MOCHA = node_modules/.bin/mocha

watch:
	wachs -o "**/*.js" make test-unit

.PHONY : test test-unit test-integration
test: test-unit test-integration
test-unit:
	NODE_ENV=test ${MOCHA} test/unit
test-integration:
	NODE_ENV=test ${MOCHA} test/integration

.PHONY: release release-patch release-minor release-major

release:
	git push --tags origin HEAD:master
	npm publish
