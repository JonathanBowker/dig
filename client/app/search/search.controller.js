'use strict';

// TODO: clean this controller.  loading was being used
// by two $watch handlers.

angular.module('digApp')
.controller('SearchCtrl', ['$scope','$state', '$http', '$q', '$modal', 'imageSearchService', 'euiSearchIndex', 'euiConfigs',
    function($scope, $state, $http, $q, $modal, imageSearchService, euiSearchIndex, euiConfigs) {
    $scope.loading = false;
    $scope.imagesimLoading = false;
    $scope.searchConfig = {};
    $scope.searchConfig.filterByImage = false;
    $scope.searchConfig.euiSearchIndex = '';
    $scope.imageFilters = {};
    $scope.euiConfigs = euiConfigs;
    $scope.facets = euiConfigs.facets;
    $scope.notificationHasRun = true;


    $scope.saveQuery = function() {
        $modal.open({
            templateUrl: 'app/queries/save-query.html',
            controller: 'SaveQueryCtrl',
            resolve: {
                digState: function() {
                    return {
                        searchTerms: $scope.queryString.submitted,
                        filters: $scope.filterStates,
                        includeMissing: $scope.includeMissing,
                        selectedSort: $scope.selectedSort
                    };
                }, elasticUIState: function() {
                    return {
                        queryState: $scope.indexVM.query ? $scope.indexVM.query.toJSON() : {},
                        filterState: $scope.indexVM.filters.getAsFilter() ? $scope.indexVM.filters.getAsFilter().toJSON() : {}
                    };
                }
            },
            size: 'sm'
        });
    };

    $scope.init = function() {
        $scope.showresults = false;
        $scope.queryString = {
            live: '', submitted: ''
        };
        $scope.filterStates = {
            aggFilters: {},
            textFilters: {},
            dateFilters: {}
        };
        $scope.includeMissing = {
            aggregations: {},
            allIncludeMissing: false
        };

        $scope.selectedSort = {};

        if($state.params && $state.params.query && $state.params.query.digState) {

            if($state.params.query.digState.searchTerms) {
                $scope.queryString.live = $state.params.query.digState.searchTerms;
            }

            if($state.params.query.digState.filters) {
                if($state.params.query.digState.filters.aggFilters) {
                    $scope.filterStates.aggFilters = _.cloneDeep($state.params.query.digState.filters.aggFilters);
                }

                if($state.params.query.digState.filters.textFilters) {
                    $scope.filterStates.textFilters = _.cloneDeep($state.params.query.digState.filters.textFilters);
                }

                if($state.params.query.digState.filters.dateFilters) {
                    $scope.filterStates.dateFilters = _.cloneDeep($state.params.query.digState.filters.dateFilters);
                }

                if($state.params.query.digState.filters.withImagesOnly) {
                    $scope.filterStates.withImagesOnly = $state.params.query.digState.filters.withImagesOnly;
                }
            }
            
            if($state.params.query.digState.includeMissing) {
                if($state.params.query.digState.includeMissing.allIncludeMissing) {
                    $scope.includeMissing.allIncludeMissing = $state.params.query.digState.includeMissing.allIncludeMissing;
                }
                
                if($state.params.query.digState.includeMissing.aggregations) {
                    $scope.includeMissing.aggregations = _.cloneDeep($state.params.query.digState.includeMissing.aggregations);
                }
            }

            if($state.params.query.notificationHasRun === false) {
                $scope.notificationHasRun = $state.params.query.notificationHasRun;
                $scope.notificationLastRun = new Date($state.params.query.lastRunDate);  
                $http.put('api/queries/' + $state.params.query.id, {lastRunDate: new Date(), notificationHasRun: true});
            } else if($state.params.query.digState.selectedSort) {
                $scope.selectedSort = _.cloneDeep($state.params.query.digState.selectedSort);
            }

            $scope.$on('$locationChangeSuccess', function() {
                if($state.current.name === 'search.results.list' && $scope.showresults === false) {
                    $scope.submit();
                }
            });

            if($state.params.callSubmit && $state.current.name === 'search.results.list' && $scope.showresults === false) {
                $scope.submit();
            }
        }
    };

    $scope.clearNotification = function() {
        if($state.params.query && $scope.notificationHasRun === false && $scope.notificationLastRun) {
            $scope.notificationLastRun = null;
            $scope.notificationHasRun = true;
        }
    };

    $scope.removeAggFilter = function(key1, key2) {
        $scope.filterStates.aggFilters[key1][key2] = false;
    };

    $scope.removeMissingFilter = function(key) {
        $scope.includeMissing.aggregations[key].active = false;
    };

    $scope.setAllIncludeMissing = function() {
        $scope.includeMissing.allIncludeMissing = !$scope.includeMissing.allIncludeMissing;
        for(var aggregation in $scope.includeMissing.aggregations) {
            $scope.includeMissing.aggregations[aggregation].active = $scope.includeMissing.allIncludeMissing;
        }
    };

    $scope.removeDateFilter = function(key1, key2) {
        $scope.filterStates.dateFilters[key1][key2] = null;
    };
    
    $scope.removeTextFilter = function(textKey) {
        $scope.filterStates.textFilters[textKey].live = '';
        $scope.filterStates.textFilters[textKey].submitted = '';
    };

    $scope.submit = function() {
        if($state.params.query && $scope.queryString.live !== $state.params.query.digState.searchTerms) {
            $scope.clearNotification();
        }
        
        $scope.queryString.submitted = $scope.queryString.live;
        if(!$scope.searchConfig.euiSearchIndex) {
            $scope.searchConfig.euiSearchIndex = euiSearchIndex;
        }
        $scope.viewList();
    };

    $scope.viewList = function() {
        $state.go('search.results.list');
    };

    $scope.enableCheck = function(searchUrl) {
        if (imageSearchService.isImageSearchEnabled(searchUrl)) {
            return searchUrl;
        }
        else {
            return '';
        }
    };

    $scope.toggleImageSearchEnabled = function(searchUrl) {
        imageSearchService.setImageSearchEnabled(searchUrl, !imageSearchService.isImageSearchEnabled(searchUrl));
    };

    $scope.setImageSearchEnabled = function(searchUrl, flag) {
        imageSearchService.setImageSearchEnabled(searchUrl, flag);
    };

    $scope.isImageSearchEnabled = function(searchUrl) {
        return imageSearchService.isImageSearchEnabled(searchUrl);
    };

    $scope.getImageSearchFilter = function(searchUrl) {
        return imageSearchService.getImageSearchFilter(searchUrl);
    };

    $scope.clearSearch = function() {
        $scope.queryString.live = '';
        $scope.submit();
    };

    $scope.reload = function() {
        $state.go('search.results.list', {}, {
            reload: true
        });
    };

    $scope.getActiveImageSearch = function() {
        return imageSearchService.getActiveImageSearch();
    };

    $scope.toggleActiveImageSearch = function(imgUrl) {
        var  isEnabled = imageSearchService.isImageSearchEnabled(imgUrl);
        var getActive = imageSearchService.getActiveImageSearch();
        if (isEnabled == true && getActive.url != imgUrl) {
            imageSearchService.toggleActiveImageSearch(imgUrl, true);
            $scope.searchConfig.filterByImage = true;
        }
        else if (isEnabled != true && getActive.url == imgUrl) {
                var a = Object.keys(imageSearchService.getImageSearchResults());
                var Urls = a.slice(0);
                if (Object.keys(imageSearchService.getImageSearchResults()).length > 1) {
                    for (var x in Urls) {//look for them              
                        if (imageSearchService.isImageSearchEnabled(Urls[x]) == true) {
                            imageSearchService.toggleActiveImageSearch(Urls[x], true);
                            break;
                        }
                    }
                }
                else {
                imageSearchService.setImageSearchEnabled(imgUrl, false);
            }
        }
        else if (isEnabled != true && getActive.url != imgUrl) {
            imageSearchService.setImageSearchEnabled(imgUrl, false);
        }
        else if (isEnabled == true && getActive.url == imgUrl) {
            imageSearchService.setImageSearchEnabled(imgUrl, true);
        }
        else{   
            imageSearchService.clearActiveImageSearch();
        }//end else
    };

    $scope.getImageSearchResults = function() {
        return imageSearchService.getImageSearchResults();
    };

    $scope.clearSpecificImageSearch = function(url) {
        imageSearchService.clearSpecificImageSearch(url);
    };

    $scope.getSpecificImageSearchResults = function(url) {
        return imageSearchService.getSpecificImageSearchResults(url);

    };

    $scope.getImageSearchResultsUrls = function() {
        return Object.keys(imageSearchService.getImageSearchResults());
    };

    $scope.logThis = function(stuff) {
        console.log(stuff);
    };

    $scope.clearActiveImageSearch = function() {

        $scope.searchConfig.filterByImage = false;
        imageSearchService.clearActiveImageSearch();
    };


    $scope.clearImageSearch = function(imgUrl) {

        if (imageSearchService.getImageSearchResultsLength() > 1) {

            if (imgUrl == imageSearchService.getActiveImageSearch().url) {
                imageSearchService.switchActive(imgUrl);
            }
            var promise = imageSearchService.enablePromise(imgUrl);

                promise.then(function(value) {

                   imageSearchService.clearSpecificImageSearch(imgUrl);

                }, function(reason) {

                });

        }//end if

        else {//if length == 1

            if (imgUrl == imageSearchService.getActiveImageSearch().url) {
                var promise = imageSearchService.enablePromise(imgUrl);
                promise.then(function(value) {

                   imageSearchService.clearSpecificImageSearch(imgUrl);

                }, function(reason) {
                });
            }//end if
            else {//If not active
                $scope.clearActiveImageSearch();
            }//end else

        }//end else

    };//end clearImageSearch             

    $scope.toggleImageFilter = function(imgUrl) {
        imageSearchService.toggleImageFilter(imgUrl);

    };

    $scope.imageSearch = function(imgUrl) {
        for (var x in $scope.deleteList) {
            imageSearchService.clearSpecificImageSearch($scope.deleteList[x]);

        }
        $scope.deleteList = [];
        $scope.displayImageBreadcrumb = true;
        imageSearchService.imageSearch(imgUrl);

    };

    $scope.getDisplayImageSrc = function(doc) {
        var src = '';
        var currentSearch = imageSearchService.getActiveImageSearch();

        // Default behavior.  Grab the only cached versions of the images from our docs.
        if(doc._source.hasImagePart && doc._source.hasImagePart.cacheUrl) {
            src = doc._source.hasImagePart.cacheUrl;
        } else if(doc._source.hasImagePart[0] && doc._source.hasImagePart[0].cacheUrl) {
            src = doc._source.hasImagePart[0].cacheUrl;
        }

        /* jshint camelcase:false */
        // If we have an active image search, check for a matching image.
        if(currentSearch &&
            imageSearchService.isImageSearchEnabled(currentSearch.url) &&
            doc._source.hasFeatureCollection.similar_images_feature) {
            var imgFeature = _.find(doc._source.hasFeatureCollection.similar_images_feature,
                function(item) {
                    return item.featureValue === currentSearch.url;
                });

            // Verify that the current search url is in the similar images feature.  If so, select the matching
            // image.
            if(imgFeature) {
                var imgObj = _.find(doc._source.hasFeatureCollection.similar_images_feature,
                    function(item) {
                        return (typeof item.featureObject !== 'undefined');
                    });
                var imgMatch = _.find(doc._source.hasImagePart,
                    function(part) {
                        return (part.uri === imgObj.featureObject.imageObjectUris[0]);
                    });
                src = (imgMatch && imgMatch.cacheUrl) ? imgMatch.cacheUrl : src;
            }
        }
        /* jshint camelcase:true */

        return src;
    };

    $scope.toggleListItemOpened = function(index) {
        $scope.opened[index] = !($scope.opened[index]);
    };

    $scope.isListItemOpened = function(index) {
        return ($scope.opened[index]) ? true : false;
    };

    $scope.$watch(function() {
            return imageSearchService.getActiveImageSearch();
        }, function(newVal) {
            if(newVal) {
                if(newVal.status === 'searching') { 
                    $scope.imagesimLoading = true;
                } else if(newVal.status === 'success' && newVal.enabled) {
                    console.log("Watch triggered, set searchConfig.filterByImage to TRUE");
                    $scope.imagesimLoading = false;

                    $scope.searchConfig.filterByImage = true;
                } else {
                    $scope.imagesimLoading = false;
                    $scope.searchConfig.filterByImage = false;
                }
            } else {
                $scope.imagesimLoading = false;
                $scope.searchConfig.filterByImage = false;
            }
        },
        true);


    $scope.$watch('indexVM.loading',
        function(newValue, oldValue) {
            if(newValue !== oldValue) {
                $scope.loading = newValue;

                if($scope.loading === false && $scope.showresults === false && !$scope.indexVM.error) {
                    $scope.showresults = true;
                }

                if($scope.showresults && $scope.indexVM.sort && $scope.indexVM.sort.field() !== '_timestamp') {
                    $scope.clearNotification();
                }

                // First ensure filters are initialized, then check to see if user made updates
                if($scope.showresults && $scope.loading === false && $state.params.query && $state.params.query.elasticUIState.filterState) {
                    var currentFilters = $scope.indexVM.filters.getAsFilter() ? $scope.indexVM.filters.getAsFilter().toJSON() : {};
                    var originalFilters = $state.params.query.elasticUIState.filterState;

                    if(angular.equals(currentFilters, originalFilters)) {
                        $scope.filtersInitialized = true;
                    } else {
                        if($scope.filtersInitialized) {
                            $scope.filtersInitalized = null;
                            $scope.clearNotification();
                        }
                    }
                }
            }
        }
    );

    $scope.$watch('indexVM.error', function() {
        if($scope.indexVM.error) {
            $scope.loading = false;
            $scope.showresults = false;

            $state.go('search.error');
        }
    }, true);

    if($state.current.name === 'search') {
        $scope.viewList();
    }

    $scope.init();

}]);