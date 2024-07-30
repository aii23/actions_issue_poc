#!/bin/bash

zk lightnet stop

zk lightnet start

zk deploy validstruct_lightnet

echo 'Sleep one minute after deploy'

sleep 1m

node build/src/call_dispatch.js validstruct_lightnet 5

echo 'Sleep two minutes after dispatch'

sleep 2m

node build/src/fetch_actions.js validstruct_lightnet