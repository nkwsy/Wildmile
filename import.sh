#!/bin/bash
find /usr/data/ -name '*.json' -exec mongoimport --file {} --jsonArray \;