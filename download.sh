#!/bin/bash
#
#This bash-script fetches a dataset containing Twitter tweets in a CSV format.

# The directory in which this file exists.
DIR="$( cd "$( dirname "$0" )" && pwd)"
#A Subdirectoy to store the files
CSV_DIR="${DIR}/csvFiles"

mkdir -p "${CSV_DIR}"


#If CSV-folder is empty, fetch dataset
if [ -z "$(ls -A ${CSV_DIR})" ] ; then
	wget http://cs.stanford.edu/people/alecmgo/trainingandtestdata.zip
	echo "Downloaded"
	unzip trainingandtestdata.zip -d csvFiles/
	rm trainingandtestdata.zip
	echo "Unzipped"
	sed -i '1s;^;polarity,id,date,query,user,tweet\n;' "${CSV_DIR}/training.1600000.processed.noemoticon.csv"
	echo "Updated header"
	mongoimport --drop --db social_net --collection tweets --type csv --headerline --file "${CSV_DIR}/training.1600000.processed.noemoticon.csv"  -h localhost:27017
	echo "Files imported to mongo"
else
	echo "Files already exists, only importing"
	mongoimport --drop --db social_net --collection tweets --type csv --headerline --file "${CSV_DIR}/training.1600000.processed.noemoticon.csv"  -h localhost:27017
	echo "Files imported to mongo"
fi

