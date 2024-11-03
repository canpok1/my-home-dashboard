#!/bin/sh
cd $(dirname $0)
cd ../../
npm run -w fetcher install:chromium
node --enable-source-maps packages/fetcher/src/App.js $@
