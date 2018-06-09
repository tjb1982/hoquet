all: dist/hoquet.js dist/lib/hoquet.js

dist:
	mkdir dist

dist/lib: dist
	mkdir dist/lib

dist/hoquet.js: dist
	cp hoquet.js ./dist/

dist/lib/hoquet.js: dist/lib
	cp node_modules/hoquet/hoquet.js dist/lib/

clean:
	rm -r dist

.PHONY: clean
