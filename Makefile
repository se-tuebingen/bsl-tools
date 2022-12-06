# detect OS for fallback build
ifeq ($(OS),Windows_NT)
	uname_S := Windows
else
	uname_S := $(shell uname -s)
endif

ifeq ($(uname_S), Windows)
	pkg_arch = win.exe
endif
ifeq ($(uname_S), Darwin)
	pkg_arch = macos
endif
ifeq ($(uname_S), Linux)
	pkg_arch = linux
endif

ifeq ($(uname_S), Windows)
	esbuild_arch = windows
endif
ifeq ($(uname_S), Darwin)
	esbuild_arch = darwin
endif
ifeq ($(uname_S), Linux)
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

update_fallback_build:
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

fallback_build:
	echo "Building Parser TypeScript from Grammar"
	echo "Detected OS $(uname_S), using build_backup/tspegjs-$(pkg_arch)"
	fallback_binaries/tspegjs-$(pkg_arch) -o src/BSL_Parser.ts src/grammar/bsl.pegjs
	echo "Compiling TypeScript and Ressources to JavaScript"
	echo "Detected OS $(uname_S), using build_backup/esbuild-$(esbuild_arch)"
	fallback_binaries/esbuild-$(esbuild_arch) src/bsl_tools.ts --bundle --minify --sourcemap=inline --target=chrome58,firefox57,safari11,edge16 --outfile=dist/bsl_tools.js --watch --loader:.css=text --loader:.svg=dataurl
