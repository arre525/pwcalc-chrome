#!/bin/bash
#
# Calculate passwords like pwcalc in Chrome
#
# Usage:
#   pwcalc.sh <alias> [length]
#
# Example:
#   pwcalc.sh gmail.com 8
#

ALIAS="$1"
LENGTH="${2:-16}"

case "`uname -s`" in
    Darwin) SHASUM=shasum;;  # MacOS
    *)      SHASUM=sha1sum;; # Linux
esac

test -z "$ALIAS" && read -p "# enter alias: " ALIAS
read -s -p "# enter secret: " SECRET
echo
echo -n "${SECRET}${ALIAS}" | $SHASUM | xxd -r -p | base64 | colrm $((LENGTH +1))

