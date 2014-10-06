var app = app || {};

app.model = function () {

    "use strict";
    var _aliases = [];
    var _restoreLast = true;

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
        },
        "restoreLast": {
            get: function () { return _restoreLast; },
            set: function (newValue) {
                _restoreLast = newValue;
                chrome.storage.local.set({ "restoreLast": _restoreLast }, null);
            }
        }
    });

    o.addAlias = function () {
        if (/\s/.test(this.alias)) {
            throw new Error("addAlias: alias contains white space");
        }
        // first try to update pwlen of existing alias
        var aliasIsNew = true;
        for (var i = 0, l = _aliases.length; i < l; i++) {
            if (_aliases[i].alias === this.alias) {
                _aliases[i].pwlen = this.pwlen;
                if (this.restoreLast) {
                    _aliases[i].last = 1;
                }
                aliasIsNew = false;
            } else {
                delete _aliases[i].last;
            }
        }
        if (aliasIsNew) {
            if (this.restoreLast) {
                _aliases.push({"alias": this.alias, "pwlen": this.pwlen, "last": 1});
            } else {
                _aliases.push({"alias": this.alias, "pwlen": this.pwlen});
            }
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
        chrome.storage.local.get(["aliases", "restoreLast"], function (obj) {
            if (obj.aliases) {
                obj.aliases.forEach(function (item) {
                    _aliases.push(item);
                    if (item.last) {
                        that.alias = item.alias;
                        that.pwlen = item.pwlen;
                    }
                });
            }
            if (obj.hasOwnProperty("restoreLast")) {
                _restoreLast = obj.restoreLast;
            }
            callback();
        });
    };

    return o;
};
