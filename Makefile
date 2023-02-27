# detect OS for fallback build
ifeq ($(OS),Windows_NT)
	uname_S := Windows
else
	uname_S := $(shell uname -s)
endif

ifeq ($(uname_S), Windows)
	pkg_arch = win.exe
	esbuild_arch = windows
endif
ifeq ($(uname_S), Darwin)
	pkg_arch = macos
	esbuild_arch = darwin
endif
ifeq ($(uname_S), Linux)
	pkg_arch = linux
	esbuild_arch = linux
endif

build:
	echo "Building Parser TypeScript from Grammar"
	node_modules/.bin/tspegjs -o src/BSL_Parser.ts src/grammar/bsl.pegjs
	echo "Compiling TypeScript and Ressources to JavaScript"
	node_modules/.bin/esbuild src/bsl_tools.ts --bundle --minify --sourcemap=inline --target=chrome58,firefox57,safari11,edge16 --outfile=dist/bsl_tools.js --watch --loader:.css=text --loader:.svg=dataurl

headless_build:
	echo "Building Parser TypeScript from Grammar"
	node_modules/.bin/tspegjs -o src/BSL_Parser.ts src/grammar/bsl.pegjs
	echo "Compiling TypeScript and Ressources to JavaScript"
	node_modules/.bin/esbuild src/bsl_tools.ts --bundle --minify --sourcemap=inline --target=chrome58,firefox57,safari11,edge16 --outfile=dist/bsl_tools.js --loader:.css=text --loader:.svg=dataurl

test:
	cd tests/javascript && cp ../../dist/bsl_tools.js bsl_tools.js
	cd tests/scribble && ./test.sh


ifeq ($(uname_S), Windows)
doc:
	test -d bin || mkdir bin
	test -f bin/mdbook.exe || wget https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-pc-windows-msvc.zip && unzip mdbook-v0.4.27-x86_64-pc-windows-msvc.zip -d bin && rm -f mdbook-v0.4.27-x86_64-pc-windows-msvc.zip
	bin/mdbook.exe build docs --open
endif
ifeq ($(uname_S), Darwin)
doc:
	test -d bin || mkdir bin
	test -f bin/mdbook || curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-apple-darwin.tar.gz | tar -xz --directory=bin
	bin/mdbook build docs --open
endif
ifeq ($(uname_S), Linux)
doc:
	test -d bin || mkdir bin
	test -f bin/mdbook || curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-unknown-linux-gnu.tar.gz | tar -xz --directory=bin
	bin/mdbook build docs --open
endif

update_fallback_build:
	echo "Using npm install to update dependencies"
	npm install
	echo "Using pkg to create tspegjs binaries"
	node_modules/.bin/pkg --out-path fallback_binaries node_modules/.bin/tspegjs
	echo "Installing esbuild binary packages for all platforms"
	npm install --save-dev --force esbuild-linux-64 esbuild-darwin-64 esbuild-windows-64
	echo "Copying binaries to the respective folders"
	cp node_modules/esbuild-linux-64/bin/esbuild fallback_binaries/esbuild-linux
	cp node_modules/esbuild-darwin-64/bin/esbuild fallback_binaries/esbuild-darwin
	cp node_modules/esbuild-windows-64/bin/esbuild fallback_binaries/esbuild-windows
	echo "Uninstalling platform-incompatible binaries"
	npm remove --force esbuild-linux-64 esbuild-darwin-64 esbuild-windows-64
	echo "Downloading MDBook for all platforms"
	wget https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-pc-windows-msvc.zip && unzip mdbook-v0.4.27-x86_64-pc-windows-msvc.zip -d fallback_binaries && rm -f mdbook-v0.4.27-x86_64-pc-windows-msvc.zip
	mv fallback_binaries/mdbook.exe fallback_binaries/mdbook-windows
	curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-apple-darwin.tar.gz | tar -xz --directory=fallback_binaries
	mv fallback_binaries/mdbook fallback_binaries/mdbook-darwin
	curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-unknown-linux-gnu.tar.gz | tar -xz --directory=fallback_binaries
	mv fallback_binaries/mdbook fallback_binaries/mdbook-linux

fallback_build:
	echo "Building Parser TypeScript from Grammar"
	echo "Detected OS $(uname_S), using fallback_binaries/tspegjs-$(pkg_arch)"
	fallback_binaries/tspegjs-$(pkg_arch) -o src/BSL_Parser.ts src/grammar/bsl.pegjs
	echo "Compiling TypeScript and Ressources to JavaScript"
	echo "Detected OS $(uname_S), using fallback_binaries/esbuild-$(esbuild_arch)"
	fallback_binaries/esbuild-$(esbuild_arch) src/bsl_tools.ts --bundle --minify --sourcemap=inline --target=chrome58,firefox57,safari11,edge16 --outfile=dist/bsl_tools.js --watch --loader:.css=text --loader:.svg=dataurl

fallback_doc:
	echo "Detected OS $(uname_S), using fallback_binaries/mdbook-$(esbuild_arch)"
	fallback_binaries/mdbook-$(esbuild_arch) build docs --open
