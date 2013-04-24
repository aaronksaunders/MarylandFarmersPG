'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('Services').factory("FacebookService", function ($window, $rootScope) {

    var loggedIn = false;

    document.addEventListener('deviceready', function () {

        // Use ChildBrowser instead of redirecting the main page.
        jso_registerRedirectHandler(window.plugins.childBrowser.showWebPage);

        /*
         * Register a handler on the childbrowser that detects redirects and
         * lets JSO to detect incomming OAuth responses and deal with the content.
         */
        window.plugins.childBrowser.onLocationChange = function (_url) {

            var url = decodeURIComponent(_url);
            console.log("Checking location: " + url);
            jso_checkfortoken('facebook', url, function () {
                $rootScope.$apply(function () {
                    console.log("Closing child browser, because a valid response was detected.");
                    window.plugins.childBrowser.close();
                });
            });
        };


        // jso_dump displays a list of cached tokens using console.log if debugging is enabled.
        //jso_dump();
    }, false);

//Activate :active state
    document.addEventListener("touchstart", function () {
    }, false);


    return  {
        login: function ($rootScope, _callback) {
            /*
             * Configure the OAuth providers to use.
             */
            jso_configure({
                "facebook": {
                    client_id: "512624875433451", // Where Do I Vote - DC
                    redirect_uri: "https://www.facebook.com/connect/login_success.html",
                    authorization: "https://www.facebook.com/dialog/oauth",
                    presenttoken: "qs"
                }
            }, {"debug": false, callback: function (_result) {
                console.log("i am back: jso_configured ");
                loggedIn = _result;


                jso_ensureTokens({
                    "facebook": ["read_stream", "publish_stream"]
                }, function () {
                    loggedIn = true;
                    console.log("i am back: jso_ensureTokens ");
                    _callback && _callback()
                });
            }});


        },
        logout: function () {
            jso_wipe();
            alert("Successfully logged out of  Facebook");
        },
        homeFeed: function ($scope) {

            if (!loggedIn) {
                this.login(null, function () {
                    homeFeed($scope);
                });
                return;
            }
            console.log("Loading home feed...");
            // Perform the protected OAuth calls.
            $.oajax({
                url: "https://graph.facebook.com/me/home",
                jso_provider: "facebook",
                jso_scopes: ["read_stream", "publish_stream"],
                jso_allowia: true,
                dataType: 'json',
                success: function (data) {
                    $scope.facebookResponse = data.data;
                }
            });

        },
        // <code>
        //    data: {
        //        message: "message text",
        //        link: "link",
        //        picture: "image url"
        //    },
        // </code>
        postToWall: function ($scope, _wallData) {
            console.log("Post to wall...");
            // Perform the protected OAuth calls.
            $.oajax({
                type: "POST",
                url: "https://graph.facebook.com/me/feed",
                jso_provider: "facebook",
                jso_scopes: ["read_stream", "publish_stream"],
                jso_allowia: true,
                dataType: 'json',
                data: _wallData,
                success: function (data) {
                    console.log("Post response (facebook):");
                    console.log(data);
                    $scope.facebookResponse = data.data;
                },
                error: function (e) {
                    console.log(e);
                }
            });

        }
    };

});