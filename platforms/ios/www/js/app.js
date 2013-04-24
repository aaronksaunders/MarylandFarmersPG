'use strict';
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


angular.module('something', []).config(function ($compileProvider) {
    $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});


console.log('initializeLungo');

// Declare app level module which depends on filters, and services
angular.module('myApp', ['Centralway.lungo-angular-bridge', 'ui', 'Services']).
    config(['$routeProvider', '$locationProvider', '$compileProvider', function ($routeProvider, $locationProvider, $compileProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'HomeController'
        });
        $routeProvider.when('/map', {
            templateUrl: 'partials/map.html',
            controller: 'MapController'
        });
        $routeProvider.when('/detail/detail-article/:object_id', {
            templateUrl: 'partials/detail.html',
            controller: 'DetailController'
        });
        $routeProvider.when('/search/search-article', {
            templateUrl: 'partials/search.html',
            controller: 'SearchController'
        });
        $routeProvider.otherwise({redirectTo: '/'});

        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);

        $locationProvider.html5Mode(false);

    }]).run(function ($rootScope) {
        $rootScope.$on('handleEmit', function (event, args) {
            $rootScope.$broadcast('handleBroadcast', args);
        });
    }).factory('phonegapReady2',function ($rootScope) {
        return function (fn) {
            console.log("in phonegap ready");
            var queue = [];

            var impl = function () {
                queue.push(Array.prototype.slice.call(arguments));
            };

            document.addEventListener('deviceready', function () {
                queue.forEach(function (args) {
                    fn.apply(this, args);
                });
                impl = fn;
            }, false);

            return function () {
                return impl.apply(this, arguments);
            };
        };
    }).directive('whenScrolled', function () {
        return function (scope, elm, attr) {
            var raw = elm[0];

            elm.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            });
        };
    });



