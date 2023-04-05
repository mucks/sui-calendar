#!/bin/sh

output=$(sui client publish . --gas 0x24bbe93500fb94b08f9e9fe421bb898c598636142b05f939d1881a99e033186d --gas-budget 30000)

echo "${output}"

package_id=$(echo $output | grep -oP '(?<=packageId": String\(")[^"]+')

# extract all objects
objects=$(echo $output | grep -o -P '(?<=----- Object changes ----).*(?=----- Balance changes ----)')

# extract statistics
statistics=$(echo $objects | grep -o -P '(?<=Statistics).*(?=version)')
statistics_object_id=$(echo $statistics | grep -oP '(?<=objectId": String\(")[^"]+')

echo "packageId: ${package_id}"
echo "statisticsObjectId: ${statistics_object_id}"

echo "REACT_APP_MOVE_PACKAGE_ID=${package_id}" > ./frontend/.env
echo "REACT_APP_MOVE_STATISTICS_OBJECT_ID=${statistics_object_id}" >> ./frontend/.env
echo "BROWSER=none" >> ./frontend/.env


