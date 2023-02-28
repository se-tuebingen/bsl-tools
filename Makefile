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
	echo "Copy JS"
	cp dist/bsl_tools.js docs/bsl_tools.js
	test -d bin || mkdir bin
	test -f bin/mdbook.exe || wget https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-pc-windows-msvc.zip && unzip mdbook-v0.4.27-x86_64-pc-windows-msvc.zip -d bin && rm -f mdbook-v0.4.27-x86_64-pc-windows-msvc.zip
	bin/mdbook.exe build docs --open
	echo "workaround for mdbooks, so it points correctly to scribble demo"
	test -d docs/demo/ && rm -rf docs/demo/scribble/ || mkdir docs/demo
	cp -R tests/scribble/output/html/test docs/demo/scribble
endif
ifeq ($(uname_S), Darwin)
doc:
	echo "Copy JS"
	cp dist/bsl_tools.js docs/bsl_tools.js
	test -d bin || mkdir bin
	test -f bin/mdbook || curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-apple-darwin.tar.gz | tar -xz --directory=bin
	bin/mdbook build docs --open
	echo "workaround for mdbooks, so it points correctly to scribble demo"
	test -d docs/demo && rm -rf docs/demo/scribble/ || mkdir docs/demo
	cp -R tests/scribble/output/html/test docs/demo/scribble
endif
ifeq ($(uname_S), Linux)
doc:
	echo "Copy JS"
	cp dist/bsl_tools.js docs/bsl_tools.js
	test -d bin || mkdir bin
	test -f bin/mdbook || curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.27/mdbook-v0.4.27-x86_64-unknown-linux-gnu.tar.gz | tar -xz --directory=bin
	bin/mdbook build docs --open
	echo "workaround for mdbooks, so it points correctly to scribble demo"
	test -d docs/demo && rm -rf docs/demo/scribble/ || mkdir docs/demo
	cp -R tests/scribble/output/html/test docs/demo/scribble
endif

update_fallback_build:
	echo "Fallback build has moved to the branch fallback_build"

fallback_build:
	echo "Fallback build has moved to the branch fallback_build"

fallback_doc:
	echo "Fallback build has moved to the branch fallback_build"
