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

    case "`uname -s`" in
        Linux)  SHASUM=sha1sum;; # Linux
        *)      SHASUM=shasum;;  # MacOS, *BSD
    esac

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

pwcalc $*
