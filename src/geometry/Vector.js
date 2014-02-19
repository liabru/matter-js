// TODO: consider params for reusing vector objects

var Vector = {};

(function() {

    Vector.magnitude = function(vector) {
        return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
    };

    Vector.magnitudeSquared = function(vector) {
        return (vector.x * vector.x) + (vector.y * vector.y);
    };

    Vector.rotate = function(vector, angle) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return {
            x: vector.x * cos - vector.y * sin,
            y: vector.x * sin + vector.y * cos
        };
    };

    Vector.rotateAbout = function(vector, angle, point) {
        var cos = Math.cos(angle), sin = Math.sin(angle);
        return {
            x: point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin),
            y: point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos)
        };
    };

    Vector.normalise = function(vector) {
        var magnitude = Vector.magnitude(vector);
        if (magnitude === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / magnitude, y: vector.y / magnitude };
    };

    Vector.dot = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
    };

    Vector.cross = function(vectorA, vectorB) {
        return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);
    };

    Vector.add = function(vectorA, vectorB) {
        return { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y };
    };

    Vector.sub = function(vectorA, vectorB) {
        return { x: vectorA.x - vectorB.x, y: vectorA.y - vectorB.y };
    };

    Vector.mult = function(vector, scalar) {
        return { x: vector.x * scalar, y: vector.y * scalar };
    };

    Vector.div = function(vector, scalar) {
        return { x: vector.x / scalar, y: vector.y / scalar };
    };

    Vector.perp = function(vector, negate) {
        negate = negate === true ? -1 : 1;
        return { x: negate * -vector.y, y: negate * vector.x };
    };

    Vector.neg = function(vector) {
        return { x: -vector.x, y: -vector.y };
    };

})();