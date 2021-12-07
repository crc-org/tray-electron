BUILDER_IMAGE_NAME ?= crcont/electron-tray-builder
CONTAINER_RUNTIME ?= podman
OUT_DIR ?= $(shell pwd)/release

# Add default target
.PHONY: all
all: build

.PHONY: build_release_container
build_release_container: Dockerfile .dockerignore
	@$(CONTAINER_RUNTIME) build -t $(BUILDER_IMAGE_NAME) -f Dockerfile .

.PHONY: release
release: build_release_container
	@$(CONTAINER_RUNTIME) run --rm -v $(OUT_DIR):/repo/release:Z -it $(BUILDER_IMAGE_NAME)
	@echo "Artficats can be found at $(OUT_DIR)"

.PHONY: clean
clean:
	rm -rf $(OUT_DIR)

.PHONY: build
build: vendor
	npm run release

.PHONY: dev
dev:
	npm run start:dev

.PHONY: vendor
vendor:
	npm install
	cd frontend && npm install
