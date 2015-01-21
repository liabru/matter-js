'use strict';

describe('Common', function() {
    describe('now', function() {
        it('should return performance.now if available', function() {
            // We mock window.performance
            var performanceMock = {
                now: function() {
                    return 42;
                }
            };
            window.performance = performanceMock;
            spyOn(performanceMock, 'now').and.callThrough();;

            var result = Common.now();

            expect(performanceMock.now).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return performance.webkitNow if available and performance.now is not available', function() {
            // We mock window.performance
            var performanceMock = {
                webkitNow: function() {
                    return 42;
                }
            };
            window.performance = performanceMock;
            spyOn(performanceMock, 'webkitNow').and.callThrough();

            var result = Common.now();

            expect(performanceMock.webkitNow).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return performance.msNow if available and performance.now and performance.webkitNow are not available', function() {
            // We mock window.performance
            var performanceMock = {
                msNow: function() {
                    return 42;
                }
            };
            window.performance = performanceMock;
            spyOn(performanceMock, 'msNow').and.callThrough();

            var result = Common.now();

            expect(performanceMock.msNow).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return performance.oNow if available and performance.now, performance.webkitNow and performance.msNow are not available', function() {
            // We mock window.performance
            var performanceMock = {
                oNow: function() {
                    return 42;
                }
            };
            window.performance = performanceMock;
            spyOn(performanceMock, 'oNow').and.callThrough();

            var result = Common.now();

            expect(performanceMock.oNow).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return performance.mozNow if available and performance.now, performance.webkitNow, performance.msNow and performance.oNow are not available', function() {
            // We mock window.performance
            var performanceMock = {
                mozNow: function() {
                    return 42;
                }
            };
            window.performance = performanceMock;
            spyOn(performanceMock, 'mozNow').and.callThrough();

            var result = Common.now();

            expect(performanceMock.mozNow).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return Date.now if available and performance is not available', function() {
            // We mock window.performance
            window.performance = undefined;

            // We mock window.Date
            function DateMock() {
                this.getTime = function() {
                    return 42;
                };
            }
            DateMock.now = function() {
                return 42;
            }
            window.Date = DateMock;
            var DateMockInstance = new DateMock();
            spyOn(DateMockInstance, 'getTime').and.callThrough();
            spyOn(DateMock, 'now').and.callThrough();

            var result = Common.now();

            expect(DateMock.now).toHaveBeenCalled();
            expect(DateMockInstance.getTime).not.toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should return Date.getTime if nothing else is available', function() {
            // We mock window.performance
            window.performance = undefined;

            // We mock window.Date
            function DateMock() {
                this.getTime = function() {
                    return 42;
                };
            }
            window.Date = DateMock;
            var DateMockInstance = new DateMock();
            var spy = spyOn(window, 'Date').and.callThrough();

            var result = Common.now();

            expect(window.Date).toHaveBeenCalled();
            expect(result).toBe(42);
        });
    });
});
