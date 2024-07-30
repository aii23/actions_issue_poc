#!/bin/bash

zk lightnet stop

zk lightnet start

zk deploy struct_lightnet

sleep 1m

node build/src/call_dispatch.js struct_lightnet 5