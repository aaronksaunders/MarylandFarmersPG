angular.module("myApp").controller('AppController', function ($rootScope, $scope, $location, $window, ParseService) {
    $scope.triggerAside = function () {
        console.log("trigger aside");
        Lungo.Router.aside('main', 'aside1');
    };


    $scope.wasClicked = function (_objectValue) {
        $rootScope.currentObject = _objectValue;
    };

    $scope.farmers = [];


    var startUpApp = function (_location) {

        $scope.queryStatus = {
            page: 0,
            limit: 25,
            skip: 0,
            location: _location
        };

        $scope.loadMore = function () {
            ParseService.query($scope);
        }

        $scope.loadMore();

        // Set this watch to update the query when user 
        // enters search parameters
        $rootScope.$watch('searchParameters', function (_paramaters) {

            if (!_paramaters) return;

            // reset the basic parameters
            $scope.queryStatus = {
                page: 0,
                limit: 25,
                skip: 0,
                searchDistance: _paramaters.searchDistance,
                searchString: _paramaters.searchString
            };

            $scope.loadMore();

        });
    };

    // set up the parse service and load default data
    alert("ready");
    ParseService.initialize($scope, startUpApp);


});

angular.module("myApp").controller('SearchController', function ($rootScope, $scope, ParseService) {

    // set default search distande
    $scope.searchDistance = 10;

    $scope.setSearchParameters = function () {
        $rootScope.searchParameters = {
            searchString: $scope.searchString || "",
            searchDistance: $scope.searchDistance || ""
        };
    };
});


angular.module("myApp").controller('MapController', function ($rootScope, $scope) {

    $scope.center;
    $scope.latLng;


    $scope.mapOptions = {
        //center: new google.maps.LatLng(35.784, -78.670),
        zoom: 15,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    }

    $rootScope.$watch('theLocation', function (_location) {
        $scope.safeApply(function () {
            $scope.myMap.panTo(_location);
            google.maps.event.trigger($scope.myMap, 'resize');
        });
    });

    navigator.geolocation.getCurrentPosition(function (position) {

        console.log("position " + position);

        $rootScope.theLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        $scope.mapOptions = {
            center: $rootScope.theLocation,
            scrollwheel: false,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    });

});


/**
 *
 * @param $scope
 * @param $routeParams
 * @param ParseService
 * @constructor
 */
angular.module("myApp").controller('DetailController', function ($rootScope, $scope, $routeParams, ParseService) {

    //alert("hello " + $routeParams.object_id);
    //$scope.data = angular.element("#main-article").scope();
    //$routeParams.object_id = $scope.data.lv;
    //debugger;

    $scope.marker = {};
    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    }

    $scope.currentObject = null;
    $scope.noDescriptionString = "No Description Provided";


    // when rootScope object is changed, update the controller object
    $rootScope.$watch('currentObject', function (_currentObject) {
        console.log("currentObject was updated " + _currentObject.id);
        $scope.currentObject = _currentObject;
    });


    // once the local objectChanges, start updating everything
    $scope.$watch('currentObject', function (center) {

        var o = $scope.currentObject && $scope.currentObject.parseObject;
        $scope.descriptionString = $scope.currentObject && o.get("Description");
        if ($scope.descriptionString === "" || !$scope.descriptionString) {
            $scope.descriptionString = "No Description Provided";
        }

        $scope.phoneString = $scope.currentObject && o.get("Phone");
        if ($scope.phoneString === "" || !$scope.phoneString) {
            $scope.phoneString = "No Phone Provided";
        }

        // set the map
        if (o) {

            $scope.center = new google.maps.LatLng(o.get("Latitude"), o.get("Longitude"));

            console.log("object information " + JSON.stringify(o.toJSON()));

            //Lungo.View.Article.title(o.get("Name"));


            $scope.safeApply(function () {

                google.maps.event.trigger($scope.simpleDetailMap, 'resize');

                $scope.marker = new google.maps.Marker({
                    map: $scope.simpleDetailMap,
                    position: $scope.center
                });
                $scope.simpleDetailMap.panTo($scope.center);

            });


        }

    });

    //
    // set the map options
    $scope.mapOptions = {
        //center: $scope.center,
        scrollwheel: false,
        zoom: 15,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    /**
     * set the current object whenever the user clicks a row
     *
     * @param _object
     */
    $scope.setCurrentFarmer = function (_object) {
        console.log(_object);
        ParseService.setCurrentObject(_object);

    };

    $scope.showDirections = function () {
        alert("show directions");
    };

    $scope.openWebsiteURL = function (_currentObject) {
        var url = _currentObject.parseObject.get('Website');
        if (url) {
            window.open("http://" + url, '_system');
        } else {
            alert("no website provided");
        }
    };

    $scope.callPhoneNumber = function () {
        alert("call phone number");
    };

    if (false) {
        ParseService.getById($scope, $rootScope.currentObjectId/*$routeParams.object_id*/, function () {

            $scope.safeApply(function () {
                console.log("currentObject " + ParseService.getCurrentObject());
                $scope.currentObject = ParseService.getCurrentObject();
            });


        });
    }

});

angular.module("myApp").controller('PhotoCtrl', function ($scope) {
    $scope.photoURI = "Empty";

    $scope.takePhoto = function () {
        navigator.camera.getPicture(function (imgUri) {
            //var image = document.getElementById("photo");
            $scope.$apply(function () {
                setCurrentPhoto(imgUri);
            });

        }, function () {
            navigator.notification.alert("Photo fail :(", null, "Oh noes!", "I can cope with it");
        }, {
            quality: 100,
            destinationType: navigator.camera.DestinationType.FILE_URI
        });
    };

    function setCurrentPhoto(_imgUri) {
        $scope.photoURI = _imgUri + "";
        console.log($scope.photoURI);

    };
});