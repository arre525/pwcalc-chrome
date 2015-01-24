#!/bin/sh
#
# Usage:
#   pwcalc.sh <alias> [length]
#
# Example:
#   pwcalc.sh gmail.com 8
#

pwcalc() {
    local ALIAS="$1"
    local LENGTH="${2:-16}"

    SHASUM=$(which shasum 2>/dev/null || which sha1sum 2>/dev/null)

    test -z "$ALIAS" && read -p "# enter alias: " ALIAS
    stty -echo
    read -p "# enter secret: " SECRET
    stty echo
    echo;echo
    /bin/echo -n "${SECRET}${ALIAS}" \
        | $SHASUM \
        | xxd -r -p \
        | base64 \
        | colrm $((LENGTH +1))
}

pwcalc "$@"
