(function() {

    var Engine = Matter.Engine;

    Example.engine = function(demo) {
        // some example engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false,
            metrics: { extended: true }
        };

        return Engine.create(options);
    };

})();