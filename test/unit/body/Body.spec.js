const {assertFloat, assertXY, assertBounds} = require("../TestUtil");
const {
	getTestBodyWithoutParts,
	getTestBodyPartsWithoutParent,
	getTestBodyWithPartsWithParent,
	} = require("../TestData");
const Body = require("../../../src/body/Body");

describe('Body.create', () => { 
    it('should create a body with the correct default properties not providing any options', () => {
        // Arrange
		let options = undefined;
		 
        // Act
		const result = Body.create(options);
    
        // Assert
		assertFloat(result.angle, 0.);
		assertFloat(result.anglePrev, 0.);
		assertFloat(result.angularVelocity, 0.);
		assertFloat(result.area, 1600.);
		assertXY(result.axes[0], 0., 1.);
		assertXY(result.axes[1], -1., 0.);
		assertBounds(result.bounds, -20., -20., 20., 20.);
		expect(result.chamfer).toBeNull();
		assertFloat(result.circleRadius, 0.);
		expect(result.collisionFilter.category).toEqual(1);
		expect(result.collisionFilter.group).toEqual(0);
		expect(result.collisionFilter.mask).toEqual(4294967295);
		assertXY(result.constraintImpulse, 0., 0.);
		assertFloat(result.constraintImpulse.angle, 0.);
		assertFloat(result.deltaTime, 16.666666666666668);
		assertFloat(result.density, 0.001);
		expect(result.events).toBeNull();
		assertXY(result.force, 0., 0.);
		assertFloat(result.friction, 0.1);
		assertFloat(result.frictionAir, 0.01);
		assertFloat(result.frictionStatic, 0.5);
		expect(result.id).toEqual(0);
		assertFloat(result.inertia, 1706.6666666666667);
		assertFloat(result.inverseInertia, 0.0005859375);
		assertFloat(result.inverseMass, 0.625);
		expect(result.isSensor).toEqual(false);
		expect(result.isSleeping).toEqual(false);
		expect(result.isStatic).toEqual(false);
		expect(result.label).toEqual('Body');
		assertFloat(result.mass, 1.6);
		assertFloat(result.motion, 0.);
		expect(result.parent.id).toEqual(0);
		expect(result.parts.length).toEqual(1);
		expect(result.plugin).toEqual({});
		assertXY(result.position, 0., 0.);
		assertXY(result.positionImpulse, 0., 0.);
		assertXY(result.positionPrev, 0., 0.);
		expect(result.render.fillStyle).toEqual("#f5d259");
		expect(result.render.lineWidth).toEqual(0);
		assertFloat(result.render.lineWidth, 0.);
		assertFloat(result.render.opacity, 1.);
		assertFloat(result.render.sprite.xOffset, 0.5);
		assertFloat(result.render.sprite.xScale, 1.);
		assertFloat(result.render.sprite.yOffset, 0.5);
		assertFloat(result.render.sprite.yScale, 1.);
		expect(result.render.strokeStyle).toEqual("#ccc");
		expect(result.render.visible).toEqual(true);
		assertFloat(result.restitution, 0.);
		expect(result.sleepCounter).toEqual(0);
		assertFloat(result.sleepThreshold, 60.);
		assertFloat(result.slop, 0.05);
		assertFloat(result.speed, 0.);
		assertFloat(result.timeScale, 1.);
		assertFloat(result.torque, 0.);
		expect(result.totalContacts).toEqual(0);
		expect(result.type).toEqual('body');
		assertXY(result.velocity, 0., 0.);
		assertXY(result.vertices[0], -20., -20.);
		assertXY(result.vertices[1], 20., -20.);
		assertXY(result.vertices[2], 20., 20.);
		assertXY(result.vertices[3], -20., 20.);
	});
	
	it('should create a body with the correct properties providing valid options', () => {
		// Arrange
		let options = getTestBodyWithoutParts();
		options.parts = getTestBodyPartsWithoutParent();
			    
        // Act
		const result = Body.create(options);
    
        // Assert
		assertFloat(result.angle, 101.);
		assertFloat(result.anglePrev, 102.);
		assertFloat(result.angularSpeed, 103.);
		assertFloat(result.angularVelocity, 104.);
		assertFloat(result.area, 105.);
		assertXY(result.axes[0], 106., 107.);
		assertXY(result.axes[1], 108., 109.);
		assertBounds(result.bounds, 340.9248627604002, 437.0721468056014, 546.1588065481358, 734.1632738161854);
		assertXY(result.chamfer[0], 114., 115.);
		assertXY(result.chamfer[1], 116., 117.);
		assertFloat(result.circleRadius, 118.);
		expect(result.collisionFilter.category).toEqual(119);
		expect(result.collisionFilter.group).toEqual(121);
		expect(result.collisionFilter.mask).toEqual(120);
		assertXY(result.constraintImpulse, 122., 123.);
		assertFloat(result.constraintImpulse.angle, 124.);
		assertFloat(result.deltaTime, 125.);
		assertFloat(result.density, 1.2952380952380953);
		expect(result.events).toBeNull();
		assertXY(result.force, 127., 128.);
		assertFloat(result.friction, 129.);
		assertFloat(result.frictionAir, 130.);
		assertFloat(result.frictionStatic, 131.);
		expect(result.id).toEqual(132);
		assertFloat(result.inertia, 133.);
		assertFloat(result.inverseInertia, 0.007518796992481203);
		assertFloat(result.inverseMass, 0.007352941176470588);
		expect(result.isSensor).toEqual(false);
		expect(result.isSleeping).toEqual(false);
		expect(result.isStatic).toEqual(false);
		expect(result.label).toEqual('Body');
		assertFloat(result.mass, 136.);
		assertFloat(result.motion, 137.);
		expect(result.parent.id).toEqual(132);
		expect(result.parts.length).toEqual(3);
		expect(result.plugin).toEqual({});
		assertXY(result.position, 297.7412587412587, 298.7412587412587);
		assertXY(result.positionImpulse, 141., 142.);
		assertXY(result.positionPrev, 297.7412587412587, 298.7412587412587);
		expect(result.render.fillStyle).toEqual("rgba(1,4,6,0.1)");
		expect(result.render.lineWidth).toEqual(147.);
		assertFloat(result.render.lineWidth, 147.);
		assertFloat(result.render.opacity, 145.);
		assertFloat(result.render.sprite.xOffset, 149.78958839253315);
		assertFloat(result.render.sprite.xScale, 148.);
		assertFloat(result.render.sprite.yOffset, 150.53438229725583);
		assertFloat(result.render.sprite.yScale, 149.);
		expect(result.render.strokeStyle).toEqual("#abc");
		expect(result.render.visible).toEqual(false);
		assertFloat(result.restitution, 152.);
		expect(result.sleepCounter).toEqual(0);
		assertFloat(result.sleepThreshold, 153.);
		assertFloat(result.slop, 154.);
		assertFloat(result.speed, 155.);
		assertFloat(result.timeScale, 156.);
		assertFloat(result.torque, 157.);
		expect(result.totalContacts).toEqual(158);
		expect(result.type).toEqual('body');
		assertXY(result.velocity, 159., 160.);
		assertXY(result.vertices[0], 387.15880654813583, 574.1632738161854);
		assertXY(result.vertices[1], 384.92277102138115, 574.1512271116169);
		assertXY(result.vertices[2], 340.9248627604002, 439.7481614149658);
		assertXY(result.vertices[3], 342.28094012193526, 437.0721468056014);
    });
});

describe('Body.nextGroup', () => {
	it('should calculate and set the valid next group id if colliding', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const isNonColliding = false;
		 
			// Act
			const result = Body.nextGroup(isNonColliding);
		    
			// Assert
			expect(result).toEqual(1);
			expect(Body._nextCollidingGroupId).toEqual(2);
			expect(Body._nextNonCollidingGroupId).toEqual(-1);
		});
	});

	it('should calculate and set the valid next group id three times if colliding', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const isNonColliding = false;
		 
			// Act
			let result = Body.nextGroup(isNonColliding);
			result = Body.nextGroup(isNonColliding);
			result = Body.nextGroup(isNonColliding);
		    
			// Assert
			expect(result).toEqual(3);
			expect(Body._nextCollidingGroupId).toEqual(4);
			expect(Body._nextNonCollidingGroupId).toEqual(-1);
		});
	});

	it('should calculate and set the valid next group id if colliding is undefined', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const isNonColliding = undefined;
		 
			// Act
			const result = Body.nextGroup(isNonColliding);
		    
			// Assert
			expect(result).toEqual(1);
			expect(Body._nextCollidingGroupId).toEqual(2);
			expect(Body._nextNonCollidingGroupId).toEqual(-1);
		});
	});

	it('should calculate and set the valid next group id if non colliding', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const isNonColliding = true;
		 
			// Act
			const result = Body.nextGroup(isNonColliding);
		    
			// Assert
			expect(result).toEqual(-1);
			expect(Body._nextCollidingGroupId).toEqual(1);
			expect(Body._nextNonCollidingGroupId).toEqual(-2);
		});
	});

	it('should calculate and set the valid next group id three times if colliding', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const isNonColliding = true;
		 
			// Act
			let result = Body.nextGroup(isNonColliding);
			result = Body.nextGroup(isNonColliding);
			result = Body.nextGroup(isNonColliding);
		    
			// Assert
			expect(result).toEqual(-3);
			expect(Body._nextCollidingGroupId).toEqual(1);
			expect(Body._nextNonCollidingGroupId).toEqual(-4);
		});
	});
});

describe('Body.nextCategory', () => {
	it('should calculate and set the valid next category', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
		 
			// Act
			const result = Body.nextCategory();
		    
			// Assert
			expect(result).toEqual(2);
			expect(Body._nextCategory).toEqual(2);
		});
	});

	it('should be able to calculate and set the valid next category maximum times', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
		 
			// Act
			let result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();
					    
			// Assert
			expect(result).toEqual(1073741824);
			expect(Body._nextCategory).toEqual(1073741824);
		});
	});

	it('should not be able to calculate and set the valid next category past maximum times', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body"); 
		 
			// Act
			let result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();
			result = Body.nextCategory();

			result = Body.nextCategory();

			result = Body.nextCategory();
					    
			// Assert
			// TODO: This should probably result in an error.			
			expect(result).toEqual(-2147483648);
			expect(Body._nextCategory).toEqual(-2147483648);
		});
	});
});

describe('Body.setStatic', () => {
	it('should be able to set a default body to static when all parts are not static yet', () => {
		// Arrange
		let body = getTestBodyWithPartsWithParent();
		body.parts[0].isStatic = false;
		body.parts[1].isStatic = false;
		body.parts[2].isStatic = false;
		const isStatic = true;

		// Act 
		Body.setStatic(body, isStatic);

		// Assert
		let part = body.parts[0];
		assertFloat(part.restitution, 0.);
		assertFloat(part.friction, 1.);
		assertFloat(part.mass, Infinity);
		assertFloat(part.inertia, Infinity);
		assertFloat(part.density, Infinity);
		assertFloat(part.inverseMass, 0.);
		assertXY(part.position, 139., 140.);
		assertFloat(part.anglePrev, 101.);
		assertFloat(part.angularVelocity, 0.);
		assertFloat(part.speed, 0.);
		assertFloat(part.angularSpeed, 0.);
		assertFloat(part.motion, 0.);
		assertFloat(part._original.restitution, 152.);
		assertFloat(part._original.friction, 129.);
		assertFloat(part._original.mass, 136.);
		assertFloat(part._original.inertia, 133.);
		assertFloat(part._original.inverseInertia, 134.);
		assertFloat(part._original.inverseMass, 135.);
		assertFloat(part._original.density, 126);
  
		part = body.parts[1];
		assertFloat(part.restitution, 0.);
		assertFloat(part.friction, 1.);
		assertFloat(part.mass, Infinity);
		assertFloat(part.inertia, Infinity);
		assertFloat(part.density, Infinity);
		assertFloat(part.inverseMass, 0.);
		assertXY(part.position, 239., 240.);
		assertFloat(part.anglePrev, 201.);
		assertFloat(part.angularVelocity, 0.);
		assertFloat(part.speed, 0.);
		assertFloat(part.angularSpeed, 0.);
		assertFloat(part.motion, 0.);
		assertFloat(part._original.restitution, 252.);
		assertFloat(part._original.friction, 229.);
		assertFloat(part._original.mass, 236.);
		assertFloat(part._original.inertia, 233.);
		assertFloat(part._original.inverseInertia, 234.);
		assertFloat(part._original.inverseMass, 235.);
		assertFloat(part._original.density, 226);
    
		part = body.parts[2];
		assertFloat(part.restitution, 0.);
		assertFloat(part.friction, 1.);
		assertFloat(part.mass, Infinity);
		assertFloat(part.inertia, Infinity);
		assertFloat(part.density, Infinity);
		assertFloat(part.inverseMass, 0.);
		assertXY(part.position, 339., 340.);
		assertFloat(part.anglePrev, 301.);
		assertFloat(part.angularVelocity, 0.);
		assertFloat(part.speed, 0.);
		assertFloat(part.angularSpeed, 0.);
		assertFloat(part.motion, 0.);
		assertFloat(part._original.restitution, 352.);
		assertFloat(part._original.friction, 329.);
		assertFloat(part._original.mass, 336.);
		assertFloat(part._original.inertia, 333.);
		assertFloat(part._original.inverseInertia, 334.);
		assertFloat(part._original.inverseMass, 335.);
		assertFloat(part._original.density, 326);
	});

	it('should be able to set a default body back from static without an _original', () => {
		// Arrange
		let body = getTestBodyWithPartsWithParent();
		let body2 = getTestBodyWithPartsWithParent();
		body.parts[0].isStatic = true;
		body.parts[1].isStatic = true;
		body.parts[2].isStatic = true;

		const isStatic = false;

		// Act 
		Body.setStatic(body, isStatic);

		// Assert
		let part = body.parts[0];
		let part2 = body2.parts[0];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
		
  
		part = body.parts[1];
		part2 = body2.parts[1];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
    
		part = body.parts[2];
		part2 = body2.parts[2];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
	});

	it('should be able to set a default body back from static without an _original with undefined isStatic', () => {
		// Arrange
		let body = getTestBodyWithPartsWithParent();
		let body2 = getTestBodyWithPartsWithParent();
		body.parts[0].isStatic = true;
		body.parts[1].isStatic = true;
		body.parts[2].isStatic = true;

		const isStatic = undefined;

		// Act 
		Body.setStatic(body, isStatic);

		// Assert
		let part = body.parts[0];
		let part2 = body2.parts[0];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(undefined);
		
  
		part = body.parts[1];
		part2 = body2.parts[1];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(undefined);
    
		part = body.parts[2];
		part2 = body2.parts[2];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(undefined);
	});


	it('should be able to set a default body back from static without an _original', () => {
		// Arrange
		let body = getTestBodyWithPartsWithParent();
		let body2 = getTestBodyWithPartsWithParent();
		body.parts[0].isStatic = true;
		body.parts[1].isStatic = true;
		body.parts[2].isStatic = true;

		const isStatic = false;

		// Act 
		Body.setStatic(body, isStatic);

		// Assert
		// TODO: body.isStatic becomes undefined this way. Maybe this is undesired?	
		let part = body.parts[0];
		let part2 = body2.parts[0];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
		
  
		part = body.parts[1];
		part2 = body2.parts[1];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
    
		part = body.parts[2];
		part2 = body2.parts[2];
		assertFloat(part.restitution, part2.restitution);
		assertFloat(part.friction, part2.friction);
		assertFloat(part.mass, part2.mass);
		assertFloat(part.inertia, part2.inertia);
		assertFloat(part.density, part2.density);
		assertFloat(part.inverseMass, part2.inverseMass);
		assertXY(part.position, part2.position.x, part2.position.y);
		assertFloat(part.anglePrev, part2.anglePrev);
		assertFloat(part.angularVelocity, part2.angularVelocity);
		assertFloat(part.speed, part2.speed);
		assertFloat(part.angularSpeed, part2.angularSpeed);
		assertFloat(part.motion, part2.motion);
		expect(part.isStatic).toEqual(false);
	});

	it('should be not able to set a undefined body', () => {
		// Arrange
		let body = undefined;
		const isStatic = true;

		// Act 
		let result = () => Body.setStatic(body, isStatic);

		// Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe('Body.setMass', () => {
	it('should be able to set the mass on a default body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const mass = 42.1;

		// Act
		Body.setMass(body, mass);

		// Assert
		assertFloat(body.mass, 42.1);
		assertFloat(body.inverseMass, 0.023752969121140142);
		assertFloat(body.inertia, 41.17132352941176);
		assertFloat(body.inverseInertia, 0.02428875037951173);
		assertFloat(body.density, 0.40095238095238095);
	});

	it('should be not able to set an undefined mass on a default body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const mass = undefined;

		// Act
		Body.setMass(body, mass);

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		expect(body.mass).toEqual(undefined);
		expect(body.inverseMass).toEqual(NaN);
		expect(body.inertia).toEqual(NaN);
		expect(body.inverseInertia).toEqual(NaN);
		expect(body.density).toEqual(NaN);
	});

	it('should be not able to set an mass on an undefined body', () => {
		// Arrange
		const body = undefined;
		const mass = 42.1;

		// Act
		let result = () => Body.setMass(body, mass);

		// Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});
