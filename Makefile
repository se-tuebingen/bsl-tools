build:
		npm run build

test:
		cd tests/javascript && cp ../../dist/bsl_tools.js bsl_tools.js
		
		cd tests/scribble && ./test.sh

