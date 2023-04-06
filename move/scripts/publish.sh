#!/bin/sh

./get_test_gas.sh

gas_address=$(sui client gas | awk 'NR==4{print $1}')


output=$(sui client publish . --gas $gas_address --gas-budget 30000)

echo "${output}"

package_id=$(echo $output | grep -oP '(?<=packageId": String\(")[^"]+')

# extract all objects
objects=$(echo $output | grep -o -P '(?<=----- Object changes ----).*(?=----- Balance changes ----)')

# extract statistics
statistics=$(echo $objects | grep -o -P '(?<=Statistics).*(?=version)')
statistics_object_id=$(echo $statistics | grep -oP '(?<=objectId": String\(")[^"]+')

echo "packageId: ${package_id}"
echo "statisticsObjectId: ${statistics_object_id}"

echo "VITE_MOVE_PACKAGE_ID=${package_id}" > ../../.env
echo "VITE_MOVE_STATISTICS_OBJECT_ID=${statistics_object_id}" >> ../../.env


