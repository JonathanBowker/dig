'use strict';

angular.module('digApp')
  .service('imageSearchService', ['$http', 'simHost', function($http, simHost) {
    var service = {};
    var imageSearchResults = [];
    var simFilters = [];
    var activeImageSearch = null;

    service.imageSearch = function(imgUrl) {
        imageSearchResults[imgUrl] = {
            url: imgUrl,
            status: 'searching',
            enabled: false,
        }

        // TODO: remove this if we switch to async image searches.
                
        activeImageSearch = imageSearchResults[imgUrl];

        $http.get(simHost + '/ds/similar/images?uri=' + encodeURIComponent(imgUrl))
        .success(function() {
            imageSearchResults[imgUrl].status = 'success';
            imageSearchResults[imgUrl].enabled = true;
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

    service.toggleActiveImageSearch = function(imageUrl, flag) {
    	if (flag) {
    	activeImageSearch = imageSearchResults[imageUrl];   
    	}//end if
    	if (!flag) {
    	activeImageSearch = imageSearchResults[imageUrl];   
    	}//end else
    };

    service.clearActiveImageSearch = function() {
        activeImageSearch = null;
    };

    service.checkImageSearch = function() {//for watch function that either turns filter on or off
    	for (var arrayUrl in imageSearchResults) {
    		if (imageSearchResults[arrayUrl].status == 'success') {//if any are active return true.
    			return true;
    		}
    	}
    	return false;
    };


    service.clearImageSearch = function(imageUrl, switchVal) {

if (switchVal ==1) {

      			console.log("case1");
                imageSearchResults[imageUrl].enabled = false; //Maybe run an imageSearch on null and then DELETE EVERYTHING?  
}
                /**var Urls = Object.keys(imageSearchResults);
	    		for (var x in Urls) {//for the remaining filters
	    			if (Urls[x] !=imageUrl) {//find one that is not the active
                        console.log("set new ActiveImageSearch in clearImageSearch");
	    				activeImageSearch = imageSearchResults[Urls[x]];//make that one active
                        //imageSearchResults[imageUrl].enabled = false;
	    				delete imageSearchResults[imageUrl];//and delete the old one
	    			}//end if
	    		}//end for*/

if (switchVal ==2) {
    		    console.log("case2");
                
                //activeImageSearch = null;
                //imageSearchResults = [];
                //imageSearchResults[imageUrl].enabled = false; //Maybe run an imageSearch on null and then DELETE EVERYTHING?  
                //imageSearchResults[imageUrl].enabled = false; //Maybe run an imageSearch on null and then DELETE EVERYTHING?  
                imageSearchResults = [];

}
if (switchVal ==3) {
	    	    console.log("case3");
	        	delete imageSearchResults[imageUrl];//delete it
    	
   		}//end switch
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

    return service;
}]);
