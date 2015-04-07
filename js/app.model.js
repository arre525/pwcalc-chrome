var app = app || {};

app.model = function () {

    "use strict";
    var _aliases = [];
    var _rememberLast = true;
    var _autoExpire = true;

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
        "rememberLast": {
            get: function () { return _rememberLast; },
            set: function (newValue) {
                _rememberLast = newValue;
                if (newValue === false) {
                    for (var i = 0, l = _aliases.length; i < l; i++) {
                        delete _aliases[i].last;
                    }
                    chrome.storage.local.set({ "aliases": _aliases }, null);
                }
                chrome.storage.local.set({ "rememberLast": _rememberLast }, null);
            }
        },
        "autoExpire": {
            get: function () { return _autoExpire; },
            set: function (newValue) {
                _autoExpire = newValue;
                chrome.storage.local.set({ "autoExpire": _autoExpire }, null);
            }
        }
    });

    o.addAlias = function () {
        if (/\s|\"|\'/.test(this.alias)) {
            throw new Error("addAlias: alias contains white space or quote sign");
        }
        // first try to update pwlen of existing alias
        var aliasIsNew = true;
        for (var i = 0, l = _aliases.length; i < l; i++) {
            if (_aliases[i].alias === this.alias) {
                _aliases[i].pwlen = this.pwlen;
                if (this.rememberLast) {
                    _aliases[i].last = 1;
                }
                aliasIsNew = false;
            } else {
                delete _aliases[i].last;
            }
        }
        if (aliasIsNew) {
            if (this.rememberLast) {
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
        chrome.storage.local.get(["aliases", "autoExpire", "rememberLast"], function (obj) {
            if (obj.hasOwnProperty("rememberLast")) {
                _rememberLast = obj.rememberLast;
            }
            if (obj.hasOwnProperty("autoExpire")) {
                _autoExpire = obj.autoExpire;
            }
            if (obj.aliases) {
                obj.aliases.forEach(function (item) {
                    _aliases.push(item);
                    if (_rememberLast && item.last) {
                        that.alias = item.alias;
                        that.pwlen = item.pwlen;
                    }
                });
            }
            callback();
        });
    };

    return o;
};
