chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create("index.html", {
        "id" : "pwcalc",
        "bounds": {
            "width": 400,
            "height": 600
        },
        minWidth: 400,
        maxWidth: 400,
        minHeight: 600,
        maxHeight: 600,
        resizable: false
    });
});
