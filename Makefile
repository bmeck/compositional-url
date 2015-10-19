all:
	@mkdir -p out build
	@babel 1>/dev/null lib\
		--optional runtime\
		--out-dir out\
	 	--source-maps true
	@browserify out/index.js -d\
		--bare\
	 	| exorcist build/bundle.js.map > build/bundle.js
	@uglifyjs\
		--in-source-map build/bundle.js.map\
		--source-map build/bundle.min.js.map\
		--source-map-url bundle.min.js.map\
		--screw-ie8 -o build/bundle.min.js --\
		build/bundle.js
	@echo built

watch:
	watch-run -i -p "lib/**.js" -- make all

clean:
	rm -rf out/ build/
