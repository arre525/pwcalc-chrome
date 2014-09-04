var app = app || {};

app.model = function () {

    "use strict";
    var _aliases = [];

    var o = {
        alias: "",
        secret: "",
        pwlen: 16
    };

    Object.defineProperties(o, {
        "version": {
            value: chrome.runtime.getManifest().version
        },
        "password": {
            get: function () {
                if ( this.secret.length && this.alias.length && ! /\s/.test(this.alias) ) {
                    return b64_sha1(this.secret + this.alias).substring(0, this.pwlen);
                } else {
                    return "";
                }
            }
        },
        "aliases": {
            get: function () {
                return _aliases.sort(function (l, r) {
                    return l.alias.toLowerCase() === r.alias.toLowerCase() ?
                        0 : (l.alias.toLowerCase() < r.alias.toLowerCase() ? -1 : 1);
                });
            }
        }
    });

    o.addAlias = function () {
        // first try to update pwlen of existing alias
        var aliasIsNew = true;
        for (var i = 0, l = _aliases.length; i < l; i++) {
            if (_aliases[i].alias === this.alias) {
                _aliases[i].pwlen = this.pwlen;
                aliasIsNew = false;
                break;
            }
        }
        if (aliasIsNew) {
            _aliases.push({ "alias": this.alias, "pwlen": this.pwlen });
        }
        chrome.storage.local.set({ "aliases": _aliases }, null);
    };

    o.deleteAlias = function (a) {
        _aliases.forEach(function (obj, idx) {
            if (obj.alias === a) {
                _aliases.splice(idx, 1);
            }
        }, this);
        chrome.storage.local.set({ "aliases": _aliases }, null);
    };

    o.getLocalStorage = function (callback) {
        chrome.storage.local.get(["aliases"], function (obj) {
            if (obj.aliases) {
                obj.aliases.forEach(function (item) {
                    _aliases.push(item);
                });
            }
            callback();
        });
    };

    return o;
};
