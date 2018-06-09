all: lib/hoquet.js hoquet.js

lib/hoquet.js: lib node_modules
	cp node_modules/hoquet/hoquet.js lib/

node_modules:
	yarn install

lib:
	mkdir -p lib

clean:
	rm -fr lib node_modules

.PHONY: clean all

