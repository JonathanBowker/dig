'use strict';

describe('Directive: sparkline', function () {

    // load the necessary modules
    beforeEach(module('digApp'));

    var scope, element;

    // Initialize the mock scope
    beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope.$new();
        scope.data = [1,4,2,4,9];
    }));

    it('should initialize all fields in element tag to the appropriate values', function () {
        inject(function ($compile) {
            element = angular.element('<sparkline data="data" graph-type="line"></sparkline>');

            $compile(element)(scope);
            element.scope().$digest();
        });
        expect(element.isolateScope().data).toBe(scope.data);
        expect(element.isolateScope().graphType).toBe('line');
    });

    it('should initialize all fields in div with attribute to the appropriate values', function () {
        inject(function ($compile) {
            element = angular.element('<div sparkline data="data" graph-type="bar"></div>');

            $compile(element)(scope);
            element.scope().$digest();
        });
        expect(element.isolateScope().data).toBe(scope.data);
        expect(element.isolateScope().graphType).toBe('bar');
    }); 

    it('should change data displayed if data changes', function () {
        inject(function ($compile) {
            element = angular.element('<sparkline data="data" graph-type="type"></sparkline>');

            $compile(element)(scope);
            element.scope().$digest();
        });

        expect(element.isolateScope().data).toBe(scope.data);

        scope.data = [1,6,3];
        element.scope().$digest();
        expect(element.isolateScope().data).toBe(scope.data);
    }); 

});