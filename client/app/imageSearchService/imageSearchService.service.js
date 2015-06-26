'use strict';

angular.module('digApp')
  .service('imageSearchService', ['$http', '$q', 'simHost', function($http, $q, simHost) {
    var service = {};
    var imageSearchResults = [];
    var activeImageSearch = null;

    service.imageSearch = function(imgUrl) {
        imageSearchResults[imgUrl] = {
            url: imgUrl,
            status: 'searching',
            enabled: false,
            displayed: false,
        };

        // TODO: remove this if we switch to async image searches.
                
        activeImageSearch = imageSearchResults[imgUrl];

        $http.get(simHost + '/ds/similar/images?uri=' + encodeURIComponent(imgUrl))
        .success(function() {
            imageSearchResults[imgUrl].status = 'success';
            imageSearchResults[imgUrl].enabled = true;
            imageSearchResults[imgUrl].displayed = true;

        })
        .error(function(data) {
            imageSearchResults[imgUrl].status = 'error';
            imageSearchResults[imgUrl].error = data;
            activeImageSearch = null;
        });
    };

    service.setImageSearchEnabled = function(imageUrl, enabled) {
        if (imageSearchResults[imageUrl]) {
            imageSearchResults[imageUrl].enabled = enabled;
        }
    };

    service.isImageSearchEnabled = function(imageUrl) {
        return ((imageSearchResults[imageUrl]) ? imageSearchResults[imageUrl].enabled : false);
    };

    service.getActiveImageSearch = function() {
        return activeImageSearch;
    };

    service.setActiveImageSearch = function(imageUrl) {
    	activeImageSearch = imageSearchResults[imageUrl];   
    };

    service.clearActiveImageSearch = function() {
        activeImageSearch = null;

    };

    service.enablePromise = function(imgUrl) {
            
            imageSearchResults[imgUrl].enabled = false;
                return $q(function(resolve, reject) {
                    setTimeout(function() {
                        if (imageSearchResults[imgUrl].enabled == false) {
                            resolve(true);
                            console.log("resolved TRUE");
                        }//end if
                        else {
                            reject(false);
                        }//end else
                    }, 0);
                });
            };//end service   

    service.switchActive = function(imgUrl) {
        var Urls = Object.keys(imageSearchResults);
        for (var x in Urls) {
            if (Urls[x] != imageSearchResults[imgUrl].url) {
                activeImageSearch = imageSearchResults[Urls[x]];
            }
        }

    };

    service.getImageSearchStatus = function(imageUrl) {
        return (imageSearchResults[imageUrl] ? imageSearchResults[imageUrl].status : 'no search available');
    };

    service.getImageSearchResults = function() {
        return imageSearchResults;
    };

    service.getImageSearchResultsLength = function() {
    	return Object.keys(imageSearchResults).length;
    };

    service.getSpecificImageSearchResults = function(imageUrl) {
        return imageSearchResults[imageUrl];
    };

    service.clearImageSearches = function() {
        activeImageSearch = null;
        imageSearchResults = [];
    };

    service.clearSpecificImageSearch = function(imageUrl) {
        delete imageSearchResults[imageUrl];
    };

    return service;
}]);
