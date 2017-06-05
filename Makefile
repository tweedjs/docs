DATE=$(shell date +"%Y-%m-%d %H:%M:%S")

.PHONY: build
build:
	node --harmony_async_await build

.PHONY: commit
commit: build
	git add dist && \
		git commit -m "Distribution $(DATE)"

.PHONY: push
push: commit
	git push --force origin `git subtree split --prefix dist`:gh-pages
