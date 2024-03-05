#!/bin/bash
while getopts t:d:b:u:j: flag;
do
    case "${flag}" in
        t) DATE="${OPTARG}";;
        d) DRIVER="${OPTARG}";;
        j) JDK_LEVEL="${OPTARG}";;
        *) echo "Invalid option";;
    esac
done

if [ "$JDK_LEVEL" == "11" ]; then
    echo "Test skipped because the guide does not support Java 11."
    exit 0
fi

sed -i "\#<artifactId>liberty-maven-plugin</artifactId>#a<configuration><install><runtimeUrl>https://public.dhe.ibm.com/ibmdl/export/pub/software/openliberty/runtime/nightly/$DATE/$DRIVER</runtimeUrl></install></configuration>" system/pom.xml inventory/pom.xml
cat system/pom.xml inventory/pom.xml

../scripts/testApp.sh
