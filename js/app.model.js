var app = app || {};

app.model = function () {

    "use strict";
    var _alias = "";
    var _pwlen = 16;
    var _aliases = [];
    var _rememberLast = true;

    var o = {
        secret: "",
    };

    Object.defineProperties(o, {
        "version": {
            value: chrome.runtime.getManifest().version
        },
        "alias": {
            get: function () { return _alias; },
            set: function (newValue) {
                _alias = newValue;
                chrome.storage.local.set({ "lastAlias": newValue }, null);
            }
        },
        "pwlen": {
            get: function () { return _pwlen; },
            set: function (newValue) {
                _pwlen = newValue;
                chrome.storage.local.set({ "lastPwlen": newValue }, null);
            }
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
        },
        "rememberLast": {
            get: function () { return _rememberLast; },
            set: function (newValue) {
                _rememberLast = newValue;
                chrome.storage.local.set({ "rememberLast": _rememberLast }, null);
            }
        }
    });

    o.addAlias = function () {
        var i,l;
        if (/\s/.test(this.alias)) {
            throw new Error("addAlias: alias contains white space");
        }

        // first try to update pwlen of existing alias
        var aliasIsNew = true;
        for (i = 0, l = _aliases.length; i < l; i++) {
            if (_aliases[i].alias === this.alias) {
                _aliases[i].pwlen = this.pwlen;
                aliasIsNew = false;
            }
        }
        if (aliasIsNew) {
            _aliases.push({"alias": this.alias, "pwlen": this.pwlen});
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
        var that = this;
        chrome.storage.local.get(["aliases", "lastAlias", "lastPwlen", "rememberLast"], function (obj) {
            if (obj.hasOwnProperty("rememberLast")) {
                _rememberLast = obj.rememberLast;
            }
            if (obj.aliases) {
                obj.aliases.forEach(function (item) {
                    _aliases.push(item);
                });
            }
            if (_rememberLast && obj.lastAlias && obj.lastPwlen) {
                that.alias = obj.lastAlias;
                that.pwlen = obj.lastPwlen;
            }
            callback();
        });
    };

    return o;
};
