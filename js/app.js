(function () {

    "use strict";

    var PASSWORD_DUMMY = "[--- password ---]";
    var QRCODE_DUMMY   = "SHA1 Password Calculator";
    var KEY_CODE_SPACE = 32;
    var KEY_CODE_RETURN = 13;
    var KEY_CODE_QUOTE = 222;
    var model = app.model();
    var timer;

    var updateUI = function () {
        $("#message").text("");

        if (/\s|\"|\'/.test(model.alias)) {
            // white space / quote sign found
            $("#message").text("Alias contains white space or quote sign");
            $("#password").addClass("password-disabled").text(PASSWORD_DUMMY);
            $("#btCopy").addClass("ui-state-disabled").attr("tabindex", "-1");
        } else if ( model.password.length < 1 ) {
            // no password
            $("#password").addClass("password-disabled").text(PASSWORD_DUMMY);
            $("#btCopy").addClass("ui-state-disabled").attr("tabindex", "-1");
        } else {
            $("#btCopy").attr("tabindex", "1").removeClass("ui-state-disabled");
            $("#password").removeClass("password-disabled").text(model.password);
        }

        $("#qrcode").empty();
        new QRCode($("#qrcode")[0], {
            text: model.password ? model.password : QRCODE_DUMMY,
            width: 150,
            height: 150,
            colorDark: "grey",
            colorLight: "black",
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    var updateAliasList = function () {
        $("#aliasList").empty();
        $("#aliasCount").text(model.aliases.length);
        if (model.aliases.length < 1) {
            $("#aliasCollapse").collapsible("collapse").addClass("ui-state-disabled");
        } else {
            $("#aliasCollapse").removeClass("ui-state-disabled");
        }
        for (var i = 0, l = model.aliases.length; i < l; i += 1) {
            var o = model.aliases[i];
            $("#aliasList").append(
                '<li><a href="#" class="liAlias" data-alias="' + o.alias +
                '" data-pwlen="' + o.pwlen + '"  >' +
                 o.alias + '<span class="ui-li-count">' +
                 o.pwlen + '</span></a><a href="#" class="liDelete"></a>');
        }
        $("#aliasList").listview("refresh");
    };

    var resetCanvas = function () {
        if (model.autoExpire) {
            $("#progress canvas").removeClass('canvas-full canvas-hidden')
                                 .addClass('canvas-empty');
        } else {
            $("#progress canvas").removeClass('canvas-full canvas-empty')
                                 .addClass('canvas-hidden');
        }
    };

    var startTimer = function () {
        var cnt = 0;
        stopTimer();
        $("#progress canvas").removeClass('canvas-empty').addClass('canvas-full');
        timer = setInterval(function () {
            $("#c" +cnt).removeClass('canvas-full').addClass('canvas-empty');
            if (cnt++ > 13) {
                model.secret = "";
                $("#secret").val("");
                updateUI();
                stopTimer();
            }
        }, 1000);
    };

    var stopTimer = function () {
        resetCanvas();
        if (timer) {
            clearInterval(timer);
            timer = null;
            copyToClipboard(' ');
            $("#alias").focus();
            $("#secret").focus();
        }
    };

    var copy = function () {
        if (model.password.length < 1) {
            return;
        }
        copyToClipboard(model.password);
        model.addAlias();
        updateAliasList();
        popupText("Password coppied to clipboard");
        if (model.autoExpire) {
            startTimer();
        }
    };

    var deleteAlias = function (event) {
        event.stopPropagation();
        model.deleteAlias($(this).prev().data("alias"));
        updateAliasList();
        $("#aliasCount").text(model.aliases.length);
    };

    var clickAlias = function () {
        model.alias = $(this).data("alias");
        model.pwlen = $(this).data("pwlen");
        $("#alias").val(model.alias);
        $("#pwlen").val(model.pwlen).selectmenu("refresh");
        $("#aliasCollapse").collapsible("collapse");
        $("#alias").focus();    // work-around clear-btn
        $("#secret").focus();
        updateUI();
    };

    var popupText = function (text) {
        var $div = $('<div class="ui-loader ui-overlay-shadow ui-body-e ui-corner-all">'
                    +text +'<br></div>');

        setTimeout(function () {
            $div.addClass("popupClipboard")
                .delay(1000)
                .appendTo($("#index")[0])
                .fadeOut(0, function () {
                    $(this).remove();
                });
        }, 200);
    };

    var copyToClipboard = function (text) {
        var $textarea = $("<textarea/>")
            .appendTo("body")
            .val(text)
            .select();
        document.execCommand("copy", false, null);
        $textarea.remove();
    };

    $(document).ready(function () {
        $("a[href], input, select, button").on("focus", stopTimer);

        $("#alias, #secret").on("input", function () {
             model[this.name] = this.value;
             updateUI();
        });

        $("#pwlen").on("input", function () {
             model.pwlen = parseInt(this.value, 10);
             updateUI();
        });

        $(".ui-input-clear").on("click", function () {
             var $input = $(this).prev("input")[0];
             model[$input.name] = "";
             updateUI();
        });

        $("#btCopy").on("click", copy);

        $("body").keydown(function (event) {
            if ((event.metaKey || event.ctrlKey) && event.keyCode === KEY_CODE_RETURN) {
                event.preventDefault();
                var $focus = $( document.activeElement );
                $("#btCopy").trigger("click");
                if (!model.autoExpire) {
                    $focus.focus();
                }
            }
        });

        $("#alias").keydown(function (event) {
            if (event.keyCode === KEY_CODE_SPACE || event.keyCode === KEY_CODE_QUOTE) {
                return false;
            } else {
                return true;
            }
        });

        $(".ui-input-clear, #btCopy").keydown(function (event) {
            if (event.keyCode === KEY_CODE_SPACE) {
                $(event.target).trigger("click");
                event.preventDefault();
            }
        });

        $("#aliasCollapse").on("collapsibleexpand", function () {
            $("#qrcode").hide();
        });

        $("#aliasCollapse").on("collapsiblecollapse", function () {
             $("#qrcode").show();
        });

        $("#aliasList").on("click", "li .liAlias", clickAlias);
        $("#aliasList").on("click", "li .liDelete", deleteAlias);

        $("#rememberLast").click(function () {
            model.rememberLast = $(this).is(":checked");
        });
        $("#autoExpire").click(function () {
            model.autoExpire = $(this).is(":checked");
            resetCanvas();
        });

        model.getLocalStorage(function () {
            $(":input").removeClass("ui-state-disabled");
            $("#version").text(model.version);
            $("#alias").val(model.alias);
            $("#pwlen").val(model.pwlen).selectmenu("refresh");
            $("#rememberLast").prop("checked", model.rememberLast);
            $("#autoExpire").prop("checked", model.autoExpire);
            updateAliasList();
            updateUI();
            resetCanvas();
            if (model.alias) {
                $("#alias").focus(); // work-around clear-btn
                $("#secret").focus();
            } else {
                $("#alias").focus();
            }
        });

    });

})();
