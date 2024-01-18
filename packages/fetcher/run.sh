#!/bin/sh
cd $(dirname $0)
cd ../../
npm run -w fetcher install:chromium
node packages/fetcher/src/App.js $@
