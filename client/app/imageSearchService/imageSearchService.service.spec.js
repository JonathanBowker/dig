'use strict';

describe('Service: imageSearchService', function () {
    var simHost = 'http://localhost';

    // load the service's module
    beforeEach(module('digApp'));

    // instantiate service
    var imageSearchService;
    var $httpBackend;
    var imageSearchRequest;

    beforeEach(function() {
        module(function($provide) {
            $provide.constant('simHost', simHost);
        });

        inject(function(_imageSearchService_, _$httpBackend_) {
            imageSearchService = _imageSearchService_;
            $httpBackend = _$httpBackend_;

            imageSearchRequest = $httpBackend.when('GET', new RegExp(simHost + '/ds/similar/images\\?uri=*'))
                .respond(200, {some: 'json'});
        });
    });

    it('should do something', function () {
        expect(imageSearchService).toBeDefined();
        expect(imageSearchService).toBeTruthy();
    });

    it('should initialize with getActiveImageSearch() as null', function() {
        var activeSearch = imageSearchService.getActiveImageSearch();
        expect(activeSearch).toBeNull();
    });

    it('should return message for getImageSearchStatus call of invalid url', function() {
        var status = imageSearchService.getImageSearchStatus('http://fake');
        expect(status).toBe('no search available');
    });

    it('should set active image search on successful search', function() {
        imageSearchService.imageSearch('http://foo');

        var activeSearch = imageSearchService.getActiveImageSearch();

        $httpBackend.flush();

        expect(activeSearch).not.toBeNull();

        expect(activeSearch.url).toBeDefined();
        expect(activeSearch.url).toBe('http://foo');
        expect(activeSearch.status).toBeDefined();
        expect(activeSearch.status).toBe('success');
    });

    it('should set active image search on pending search', function() {
        imageSearchService.imageSearch('http://foo');

        var activeSearch = imageSearchService.getActiveImageSearch();

        expect(activeSearch).not.toBeNull();

        expect(activeSearch.url).toBeDefined();
        expect(activeSearch.url).toBe('http://foo');
        expect(activeSearch.status).toBeDefined();
        expect(activeSearch.status).toBe('searching');

        $httpBackend.flush();

        expect(activeSearch).not.toBeNull();

        expect(activeSearch.url).toBeDefined();
        expect(activeSearch.url).toBe('http://foo');
        expect(activeSearch.status).toBeDefined();
        expect(activeSearch.status).toBe('success');
    });

    it('should clear active image search on failure', function() {
        imageSearchRequest.respond(500, '');

        imageSearchService.imageSearch('http://foo');

        $httpBackend.flush();

        var activeSearch = imageSearchService.getActiveImageSearch();
        expect(activeSearch).toBeNull();
    });

    it('should return the status for available searches', function() {
        var imgUrl = 'http://foo';

        imageSearchService.imageSearch(imgUrl);
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('searching');

        $httpBackend.flush();

        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('success');
    });

    it('should clear only the active image search for clearActiveImageSearch', function() {
        var imgUrl = 'http://foo';

        imageSearchService.imageSearch(imgUrl);
        $httpBackend.flush();

        imageSearchService.clearActiveImageSearch();

        var activeSearch = imageSearchService.getActiveImageSearch();
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('success');

        expect(activeSearch).toBeNull();
    });

    it('should clear all search requests for clearImageSearches', function() {
        var imgUrl = 'http://foo';

        imageSearchService.imageSearch('http://foo');
        $httpBackend.flush();

        imageSearchService.clearImageSearches();

        var activeSearch = imageSearchService.getActiveImageSearch();
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('no search available');
        expect(activeSearch).toBeNull();
    });

    it('should set the enable state of a search to true after it completes', function() {
        var imgUrl = 'http://foo';

        imageSearchService.imageSearch(imgUrl);
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('searching');
        expect(imageSearchService.isImageSearchEnabled(imgUrl)).toBe(false);

        $httpBackend.flush();
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('success');
        expect(imageSearchService.isImageSearchEnabled(imgUrl)).toBe(true);
    });

    it('should allow the toggling of an image searchs enabled state', function() {
        var imgUrl = 'http://foo';

        imageSearchService.imageSearch(imgUrl);
        $httpBackend.flush();
        expect(imageSearchService.getImageSearchStatus(imgUrl)).toBe('success');
        expect(imageSearchService.isImageSearchEnabled(imgUrl)).toBe(true);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        expect(imageSearchService.isImageSearchEnabled(imgUrl)).toBe(false);

        imageSearchService.setImageSearchEnabled(imgUrl, true);
        expect(imageSearchService.isImageSearchEnabled(imgUrl)).toBe(true);
    });


    it('should set the activeImageSearch to another filter', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');

        imageSearchService.imageSearch(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://footwo');

        imageSearchService.setActiveImageSearch(imgUrl);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');
    });


    // it('should resolve true if the enabled field is set to false', function() {
    //     var imgUrl = 'http://foo';
    //     var testFlag = false;
    //     imageSearchService.imageSearch(imgUrl);

    //        var promise = imageSearchService.enablePromise(imgUrl);

    //             promise.then(function(value) {
    //                testFlag = true;
    //                console.log("WAS SWITCHED");

    //             }, function(reason) {
    //                console.log("WAS NOT SWITCHED");
    //                                testFlag = true;

    //             });
    //     expect(testFlag).toBe(true);
        
    // });

    it('should switch the activeImageSearch to another filter (only one enabled)', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');

        imageSearchService.imageSearch(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://footwo');

        imageSearchService.switchActive(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');
    });


    it('should switch the activeImageSearch to another filter (both enabled)', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');

        imageSearchService.imageSearch(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://footwo');
        imageSearchService.setImageSearchEnabled(imgUrl, true);

        imageSearchService.switchActive(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');
    });

    it('should switch the activeImageSearch to another filter (both unenabled)', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');

        imageSearchService.imageSearch(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://footwo');
        imageSearchService.setImageSearchEnabled(imgUrlII, false);

        imageSearchService.switchActive(imgUrlII);
        expect(imageSearchService.getActiveImageSearch().url).toBe('http://foo');
    });

    it('should return the number of filters in imageSearchResults', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        expect(imageSearchService.getImageSearchResultsLength()).toBe(1);

        imageSearchService.imageSearch(imgUrlII);
        expect(imageSearchService.getImageSearchResultsLength()).toBe(2);
    });

    it('should return the imageSearchresults object associated with the passed in url', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        imageSearchService.imageSearch(imgUrlII);

        expect(imageSearchService.getSpecificImageSearchResults(imgUrl).url).toBe('http://foo');
        expect(imageSearchService.getSpecificImageSearchResults(imgUrlII).url).toBe('http://footwo');
    });

    it('should clear the imageSearchresults object associated with the passed in url', function() {
        var imgUrl = 'http://foo';
        var imgUrlII = 'http://footwo';
        imageSearchService.imageSearch(imgUrl);

        imageSearchService.setImageSearchEnabled(imgUrl, false);
        imageSearchService.imageSearch(imgUrlII);

        expect(imageSearchService.getSpecificImageSearchResults(imgUrl).url).toBe('http://foo');
        expect(imageSearchService.getSpecificImageSearchResults(imgUrlII).url).toBe('http://footwo');

        imageSearchService.clearSpecificImageSearch(imgUrl);
        expect(imageSearchService.getImageSearchResultsLength()).toBe(1);
        expect(imageSearchService.getSpecificImageSearchResults(imgUrlII).url).toBe('http://footwo');

    });    
});
