build:
		npm run build

test:
		cd tests/javascript && cp ../../dist/bsl_tools.js bsl_tools.js

		cd tests/scribble && ./test.sh

update_build_fallback:
		cp -r node_modules build_backup/node_modules
		node -v > build_backup/node_version.txt
		uname -o > build_backup/os.txt
		uname -m > build_backup/arch.txt

fallback_build_parser:
		cd build_backup && node_modules/.bin/tspegjs -o ../src/BSL_Parser.ts ../src/grammar/bsl.pegjs

fallback_build_ts:
		build_backup/node_modules/.bin/esbuild src/bsl_tools.ts --bundle --minify --sourcemap=inline --target=chrome58,firefox57,safari11,edge16 --outfile=dist/bsl_tools.js --watch --loader:.css=text
