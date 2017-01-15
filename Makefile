.PHONY: build
build:
	node --harmony_async_await build

.PHONY: commit
commit: build
	git add dist && \
		git commit -m "Distribution $(DATE)"

.PHONY: push
push: commit
	git subtree push --prefix dist origin gh-pages
