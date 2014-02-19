var Sleeping = {};

(function() {

    var _motionWakeThreshold = 0.18,
        _motionSleepThreshold = 0.08,
        _minBias = 0.9;

    Sleeping.update = function(bodies) {
        // update bodies sleeping status
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i],
                motion = body.speed * body.speed + body.angularSpeed * body.angularSpeed;

            var minMotion = Math.min(body.motion, motion),
                maxMotion = Math.max(body.motion, motion);
        
            // biased average motion estimation between frames
            body.motion = _minBias * minMotion + (1 - _minBias) * maxMotion;
            
            if (body.sleepThreshold > 0 && body.motion < _motionSleepThreshold) {
                body.sleepCounter += 1;
                
                if (body.sleepCounter >= body.sleepThreshold)
                    Sleeping.set(body, true);
            } else if (body.sleepCounter > 0) {
                body.sleepCounter -= 1;
            }
        }
    };

    Sleeping.afterCollisions = function(pairs) {
        // wake up bodies involved in collisions
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i],
                collision = pair.collision,
                bodyA = collision.bodyA, 
                bodyB = collision.bodyB;
        
            if ((bodyA.isSleeping && bodyB.isSleeping) || bodyA.isStatic || bodyB.isStatic)
                continue;
        
            if (bodyA.isSleeping || bodyB.isSleeping) {
                var sleepingBody = (bodyA.isSleeping && !bodyA.isStatic) ? bodyA : bodyB,
                    movingBody = sleepingBody === bodyA ? bodyB : bodyA;

                if (!sleepingBody.isStatic && movingBody.motion > _motionWakeThreshold) {
                    Sleeping.set(sleepingBody, false);
                }
            }
        }
    };

    Sleeping.set = function(body, isSleeping) {
        if (isSleeping) {
            body.isSleeping = true;
            body.sleepCounter = body.sleepThreshold;

            body.positionImpulse.x = 0;
            body.positionImpulse.y = 0;

            body.positionPrev.x = body.position.x;
            body.positionPrev.y = body.position.y;

            body.anglePrev = body.angle;
            body.speed = 0;
            body.angularSpeed = 0;
            body.motion = 0;
        } else {
            body.isSleeping = false;
            body.sleepCounter = 0;
        }
    };

})();