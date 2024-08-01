#!/bin/bash

zk lightnet stop

zk lightnet start

zk deploy -y brokenstruct_lightnet

echo 'Sleep one minute after deploy'

sleep 1m

node build/src/call_dispatch.js brokenstruct_lightnet 5

echo 'Sleep two minutes after dispatch'

sleep 2m

node build/src/fetch_actions.js brokenstruct_lightnet

sleep 1m

node build/src/call_dispatch.js brokenstruct_lightnet 5

echo 'Sleep two minutes after dispatch'

sleep 2m

node build/src/fetch_actions.js brokenstruct_lightnet

sleep 1m

node build/src/call_dispatch.js brokenstruct_lightnet 5

echo 'Sleep two minutes after dispatch'

sleep 2m

node build/src/fetch_actions.js brokenstruct_lightnet

sleep 1m

node build/src/call_dispatch.js brokenstruct_lightnet 5

echo 'Sleep two minutes after dispatch'

sleep 2m

for i in {1..40}
do
  sleep 30s
  node build/src/call_dispatch.js brokenstruct_lightnet 1
done



node build/src/fetch_actions.js brokenstruct_lightnet


