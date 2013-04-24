'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('Services', [], function ($provide) {
    $provide.factory("ParseService", function () {


        var Farmer = Parse.Object.extend("farmers");
        var currentFarmer = null;
        var lastGeoQuery = null;


        return {
            initialize: function ($scope, _callback) {

                console.log("initialize parse");

                Parse.initialize("7w2l6VzIOcI7XEqENkuswSk3J47i0D7KSesexRVL", "cjqeg1nBDkKwfsU28U8iHmPyIY8jBGbwc0ElYkek");
                Parse.GeoPoint.current({
                    success: function (_resp) {
                        console.log("got location " + JSON.stringify(_resp));
                        lastGeoQuery = _resp;
                        _callback && _callback(_resp);
                    },
                    error: function (_error, _resp) {
                        console.log("got location error" + JSON.stringify(_error));
                    }
                })
            },
            setCurrentObject: function (_object) {
                currentFarmer = _object;
            },
            getCurrentObject: function () {
                return currentFarmer;
            },
            query: function ($scope) {
                var that = this;

//                try {
//                    Parse.GeoPoint.current({
//                        success: function (_resp) {
//                            console.log("got location " + JSON.stringify(_resp));
//                            $scope.queryStatus.location = _resp;
//                            that._query($scope);
//                        },
//                        error: function (_error, _resp) {
//                            console.log("got location error" + JSON.stringify(_error));
//                        }
//                    })
//                } catch (EE) {
//                    console.log(EE);
                    that._query($scope);
//                }
            },
            _query: function ($scope) {

                console.log("in parse query " + $scope.deviceName + " " + JSON.stringify($scope.queryStatus));

                //console.log("query all assets " + JSON.stringify(arguments));
                var query = new Parse.Query(Farmer);

                // limit the query
                query.limit($scope.queryStatus.limit);

                // sort by name
                //query.ascending("Name");


                // set up the skip for paging
                if ($scope.queryStatus.page !== 0) {
                    query.skip($scope.queryStatus.limit * $scope.queryStatus.page);
                } else {
                    query.skip(0);
                }

                // if we have a location then use it
                $scope.queryStatus.location = $scope.queryStatus.location || lastGeoQuery;
                if ($scope.queryStatus.location) {
                    query.withinMiles("location", $scope.queryStatus.location, ($scope.queryStatus.searchDistance || 10));
                }

                // if we have a name then use it
                if ($scope.queryStatus.searchString && $scope.queryStatus.searchString !== "") {
                    query.contains("Name", $scope.queryStatus.searchString);
                }

                console.log("the query " + JSON.stringify(query));

                // increase the page number
                $scope.queryStatus.page = $scope.queryStatus.page + 1;


                query.find({
                    success: function (results) {

                        console.log(results.length);

                        $scope.$apply(function () {
                            if ($scope.queryStatus.page !== 1) {
                                for (var i in results) {

                                    // the distance
                                    var loc = results[i].get("location") || null;
                                    var dist;//var dist = loc && loc.latitude && loc.longitude ? Math.round(loc.milesTo($scope.queryStatus.location)) : "none";


                                    $scope.farmers.push({
                                        id: results[i].id,
                                        name: results[i].get("Name"),
                                        address: results[i].get("Address") + ", " + results[i].get("City"),
                                        hours: results[i].get("openTimes"),
                                        distance: dist,
                                        parseObject: results[i]
                                    });

                                }
                                ;
                            } else {
                                $scope.farmers = results.map(function (obj) {

                                    // the distance
                                    var loc = obj.get("location") || null;
                                    var dist;//var dist = loc && loc.latitude && loc.longitude ? Math.round(loc.milesTo($scope.queryStatus.location)) : "none";

                                    return  {
                                        id: obj.id,
                                        name: obj.get("Name"),
                                        address: obj.get("Address") + ", " + obj.get("City"),
                                        hours: obj.get("openTimes"),
                                        distance: dist,
                                        parseObject: obj
                                    };

                                });
                            }
                        });
                    },
                    error: function (error) {
                        alert("Error in query: " + error.code + " " + error.message);
                    }
                });
            },
            getById: function ($scope, _objId, _callback) {
                console.log("get object by id");
                var Farmer = Parse.Object.extend("farmers");
                var query = new Parse.Query(Farmer);
                query.get(_objId, {
                    success: function (_results) {

                        debugger;
                        currentFarmer = {
                            id: _results.id,
                            name: _results.get("Name"),
                            address: _results.get("Address") + ", " + _results.get("City"),
                            hours: _results.get("openTimes"),
                            parseObject: _results
                        };

                        _callback();

                    },
                    error: function (_object, _error) {
                        alert("Error in getById: " + _error.code + " " + _error.message);
                    }
                });
            }
        };
    })

});