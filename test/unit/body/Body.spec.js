const { assertFloat, assertXY, assertBounds, assertVertex } = require("../TestUtil");
const {
	getTestBodyWithoutParts,
	getTestBodyPartsWithoutParent,
	getTestBodyWithPartsWithParent,
	getTestSquare,
} = require("../TestData");
const Body = require("../../../src/body/Body");
const Vector = require("../../../src/geometry/Vector");

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

describe('Body.setDensity', () => {
	it('should be able to set the density on a default body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const density = 42.1;

		// Act
		Body.setDensity(body, density);

		// Assert
		assertFloat(body.mass, 4420.5);
		assertFloat(body.inverseMass, 0.00022621875353466802);
		assertFloat(body.inertia, 4322.988970588235);
		assertFloat(body.inverseInertia, 0.00023132143218582596);
		assertFloat(body.density, 42.1);
	});

	it('should not be able to set the density on a default body with undefined density', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const density = undefined;

		// Act
		Body.setDensity(body, density);

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		expect(body.mass).toEqual(NaN);
		expect(body.inverseMass).toEqual(NaN);
		expect(body.inertia).toEqual(NaN);
		expect(body.inverseInertia).toEqual(NaN);
		expect(body.density).toEqual(undefined);
	});

	it('should not be able to set the density on an undefined body', () => {
		// Arrange
		const body = undefined;
		const density = 42.1;

		// Act
		let result = () => Body.setDensity(body, density);

		// Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe("Body.setInertia()", () => {
	it('should mutate value of inertia and inverse inertia to valid values', () => {
		// Arrange     
		const body = getTestBodyWithPartsWithParent();
		body.inertia = 0;
		body.inverseInertia = 0;
		const inertia = 12;

		// Act
		Body.setInertia(body, inertia)

		// Assert
		assertFloat(body.inertia, 12)
		assertFloat(body.inverseInertia, 0.08333333333333333)
	});

	it('should not be able mutate value of inertia and inverse inertia to valid values with undefined inertia', () => {
		// Arrange     
		const body = getTestBodyWithPartsWithParent();
		body.inertia = 0;
		body.inverseInertia = 0;
		const inertia = undefined;

		// Act
		Body.setInertia(body, inertia)

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		expect(body.inertia).toEqual(undefined);
		expect(body.inverseInertia).toEqual(NaN);
	});

	it('should not be mutate value of inertia and inverse inertia to valid values on undefined body', () => {
		// Arrange     
		const body = undefined;
		const inertia = 12;

		// Act
		let result = () => Body.setInertia(body, inertia);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setVertices', () => {
	it('should mutate the body to contain valid values', () => {
		// Arrange     
		const vertices = getTestSquare();
		const body = getTestBodyWithPartsWithParent();

		// Act
		Body.setVertices(body, vertices)

		// Assert
		assertFloat(body.area, 4.0);
		assertXY(body.axes[0], 0.0, 1.0);
		assertXY(body.axes[1], -1.0, 0.0);
		assertBounds(body.bounds, 138., 139., 299., 301.);
		assertFloat(body.density, 126.);
		assertFloat(body.inertia, 1344.);
		assertFloat(body.inverseInertia, 0.000744047619047619);
		assertFloat(body.inverseMass, 0.001984126984126984);
		assertFloat(body.mass, 504.);
		assertXY(body.position, 139., 140.);
		assertXY(body.velocity, 159., 160.);
		assertVertex(body.vertices[0], body.id, 138., 139., 0, false);
		assertVertex(body.vertices[1], body.id, 140., 139., 1, false);
		assertVertex(body.vertices[2], body.id, 140., 141., 2, false);
		assertVertex(body.vertices[3], body.id, 138., 141., 3, false);

	});

	it('should not be able mutate the body to contain valid values with undefined vertices', () => {
		// Arrange     
		const vertices = undefined;
		const body = getTestBodyWithPartsWithParent();

		// Act
		let result = () => Body.setVertices(body, vertices)

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);

	});

	it('should not be able mutate the body to contain valid values on undefined body', () => {
		// Arrange     
		const vertices = getTestSquare();
		const body = undefined;

		// Act
		let result = () => Body.setVertices(body, vertices)

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);

	});
});

describe('Body.setParts', () => {
	it('should update body with parts with setting autohull to false', () => {
		// Arrange
		const body = getTestBodyWithoutParts();
		const parts = getTestBodyPartsWithoutParent();

		const autoHull = false;

		// Act
		Body.setParts(body, parts, autoHull);

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertFloat(part.area, 510.);
		assertBounds(part.bounds, 161., 162., 322., 325.);
		assertFloat(part.density, 1.1215686274509804);
		assertFloat(part.inertia, 566.);
		assertFloat(part.inverseInertia, 0.0017667844522968198);
		assertFloat(part.inverseMass, 0.0017482517482517483);
		assertFloat(part.mass, 572.);
		assertXY(part.position, 297.7412587412587, 298.7412587412587);
		assertXY(part.positionPrev, 297.7412587412587, 298.7412587412587);
		assertXY(part.vertices[0], 161., 162.);
		assertXY(part.vertices[1], 163., 164.);
		assertXY(part.vertices[2], 161., 165.);
		expect(part.parts.length).toEqual(3);
		expect(part.vertices.length).toEqual(3);

		part = body.parts[1];
		assertFloat(part.area, 205.);
		assertBounds(part.bounds, 261., 262., 422., 425.);
		assertFloat(part.density, 226.);
		assertFloat(part.inertia, 233.);
		assertFloat(part.inverseInertia, 234.);
		assertFloat(part.inverseMass, 235.);
		assertFloat(part.mass, 236.);
		assertXY(part.position, 239., 240.);
		assertXY(part.positionPrev, 243., 244.);
		assertXY(part.vertices[0], 261., 262.);
		assertXY(part.vertices[1], 263., 264.);
		assertXY(part.vertices[2], 261., 265.);
		expect(part.vertices.length).toEqual(3);

		part = body.parts[2];
		assertFloat(part.area, 305.);
		assertBounds(part.bounds, 361., 362., 522., 525.);
		assertFloat(part.density, 326.);
		assertFloat(part.inertia, 333.);
		assertFloat(part.inverseInertia, 334.);
		assertFloat(part.inverseMass, 335.);
		assertFloat(part.mass, 336.);
		assertXY(part.position, 339., 340.);
		assertXY(part.positionPrev, 343., 344.);
		assertXY(part.vertices[0], 361., 362.);
		assertXY(part.vertices[1], 363., 364.);
		assertXY(part.vertices[2], 361., 365.);
		expect(part.vertices.length).toEqual(3);
	});

	it('should update body with parts without setting autohull', () => {
		// Arrange
		const body = getTestBodyWithoutParts();
		const parts = getTestBodyPartsWithoutParent();

		const autoHull = undefined;

		// Act
		Body.setParts(body, parts, autoHull);

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertFloat(part.area, 510.);
		assertBounds(part.bounds, 400., 402., 661., 665.);
		assertFloat(part.density, 1.1215686274509804);
		assertFloat(part.inertia, 566.);
		assertFloat(part.inverseInertia, 0.0017667844522968198);
		assertFloat(part.inverseMass, 0.0017482517482517483);
		assertFloat(part.mass, 572.);
		assertXY(part.position, 297.7412587412587, 298.7412587412587);
		assertXY(part.positionPrev, 297.7412587412587, 298.7412587412587);
		assertVertex(part.vertices[0], body.id, 502., 504., 0, false);
		assertVertex(part.vertices[1], body.id, 500., 505., 1, false);
		assertVertex(part.vertices[2], body.id, 400., 405., 2, false);
		assertVertex(part.vertices[3], body.id, 400., 402., 3, false);
		expect(part.parts.length).toEqual(3);
		expect(part.vertices.length).toEqual(4);

		part = body.parts[1];
		assertFloat(part.area, 205.);
		assertBounds(part.bounds, 261., 262., 422., 425.);
		assertFloat(part.density, 226.);
		assertFloat(part.inertia, 233.);
		assertFloat(part.inverseInertia, 234.);
		assertFloat(part.inverseMass, 235.);
		assertFloat(part.mass, 236.);
		assertXY(part.position, 239., 240.);
		assertXY(part.positionPrev, 243., 244.);
		assertXY(part.vertices[0], 261., 262.);
		assertXY(part.vertices[1], 263., 264.);
		assertXY(part.vertices[2], 261., 265.);
		expect(part.vertices.length).toEqual(3);

		part = body.parts[2];
		assertFloat(part.area, 305.);
		assertBounds(part.bounds, 361., 362., 522., 525.);
		assertFloat(part.density, 326.);
		assertFloat(part.inertia, 333.);
		assertFloat(part.inverseInertia, 334.);
		assertFloat(part.inverseMass, 335.);
		assertFloat(part.mass, 336.);
		assertXY(part.position, 339., 340.);
		assertXY(part.positionPrev, 343., 344.);
		assertXY(part.vertices[0], 361., 362.);
		assertXY(part.vertices[1], 363., 364.);
		assertXY(part.vertices[2], 361., 365.);
		expect(part.vertices.length).toEqual(3);
	});

	it('should update body with parts with setting autohull to true', () => {
		// Arrange
		const body = getTestBodyWithoutParts();
		const parts = getTestBodyPartsWithoutParent();

		const autoHull = true;

		// Act
		Body.setParts(body, parts, autoHull);

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertFloat(part.area, 510.);
		assertBounds(part.bounds, 400., 402., 661., 665.);
		assertFloat(part.density, 1.1215686274509804);
		assertFloat(part.inertia, 566.);
		assertFloat(part.inverseInertia, 0.0017667844522968198);
		assertFloat(part.inverseMass, 0.0017482517482517483);
		assertFloat(part.mass, 572.);
		assertXY(part.position, 297.7412587412587, 298.7412587412587);
		assertXY(part.positionPrev, 297.7412587412587, 298.7412587412587);
		assertVertex(part.vertices[0], body.id, 502., 504., 0, false);
		assertVertex(part.vertices[1], body.id, 500., 505., 1, false);
		assertVertex(part.vertices[2], body.id, 400., 405., 2, false);
		assertVertex(part.vertices[3], body.id, 400., 402., 3, false);
		expect(part.parts.length).toEqual(3);
		expect(part.vertices.length).toEqual(4);

		part = body.parts[1];
		assertFloat(part.area, 205.);
		assertBounds(part.bounds, 261., 262., 422., 425.);
		assertFloat(part.density, 226.);
		assertFloat(part.inertia, 233.);
		assertFloat(part.inverseInertia, 234.);
		assertFloat(part.inverseMass, 235.);
		assertFloat(part.mass, 236.);
		assertXY(part.position, 239., 240.);
		assertXY(part.positionPrev, 243., 244.);
		assertXY(part.vertices[0], 261., 262.);
		assertXY(part.vertices[1], 263., 264.);
		assertXY(part.vertices[2], 261., 265.);
		expect(part.vertices.length).toEqual(3);

		part = body.parts[2];
		assertFloat(part.area, 305.);
		assertBounds(part.bounds, 361., 362., 522., 525.);
		assertFloat(part.density, 326.);
		assertFloat(part.inertia, 333.);
		assertFloat(part.inverseInertia, 334.);
		assertFloat(part.inverseMass, 335.);
		assertFloat(part.mass, 336.);
		assertXY(part.position, 339., 340.);
		assertXY(part.positionPrev, 343., 344.);
		assertXY(part.vertices[0], 361., 362.);
		assertXY(part.vertices[1], 363., 364.);
		assertXY(part.vertices[2], 361., 365.);
		expect(part.vertices.length).toEqual(3);
	});

	it('should not be able update an undefined body with parts with setting autohull to false', () => {
		// Arrange
		const body = undefined;
		const parts = getTestBodyPartsWithoutParent();

		const autoHull = false;

		// Act
		let result = () => Body.setParts(body, parts, autoHull);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setCentre', () => {
	it('should be able to set the centre on a default body, not relative', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const centre = { x: 42., y: 43. };
		const relative = false;

		// Act 
		Body.setCentre(body, centre, relative);

		// Assert
		assertXY(body.position, 42., 43.);
		assertXY(body.positionPrev, 46., 47.);
	});

	it('should be able to set the centre on a default body, with undefined relative', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const centre = { x: 42., y: 43. };
		const relative = undefined;

		// Act 
		Body.setCentre(body, centre, relative);

		// Assert
		assertXY(body.position, 42., 43.);
		assertXY(body.positionPrev, 46., 47.);
	});

	it('should be able to set the centre on a default body, relative', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const centre = { x: 42., y: 43. };
		const relative = true;

		// Act 
		Body.setCentre(body, centre, relative);

		// Assert
		assertXY(body.position, 181., 183.);
		assertXY(body.positionPrev, 185., 187.);
	});

	it('should not be able to set an undefined centre on a default body, not relative', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const centre = undefined;
		const relative = false;

		// Act 
		let result = () => Body.setCentre(body, centre, relative);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});

	it('should not be able to set the centre on an undefined body, not relative', () => {
		// Arrange
		const body = undefined;
		const centre = { x: 42., y: 43. };
		const relative = false;

		// Act 
		let result = () => Body.setCentre(body, centre, relative);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setPosition', () => {
	it('should update body with position without setting velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const position = Vector.create(37., 37.); // true random
		const updateVelocity = false;

		// Act
		Body.setPosition(body, position, updateVelocity);

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertXY(part.position, 37., 37.);
		assertXY(part.positionPrev, 41., 41.);
		assertXY(part.velocity, 159., 160.);
		assertBounds(part.bounds, 59., 59., 220., 222.);
		assertXY(part.position, 37., 37.);
		assertXY(part.velocity, 159., 160.);
		assertXY(part.vertices[0], 59., 59.);
		assertXY(part.vertices[1], 61., 61.);
		assertXY(part.vertices[2], 59., 62.);


		part = body.parts[1];
		assertXY(part.position, 137., 137.);
		assertXY(part.positionPrev, 243., 244.);
		assertXY(part.velocity, 259., 260.);
		assertBounds(part.bounds, 159., 159., 320., 322.);
		assertXY(part.position, 137., 137.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 159., 159.);
		assertXY(part.vertices[1], 161., 161.);
		assertXY(part.vertices[2], 159., 162.);

		part = body.parts[2];
		assertXY(part.position, 237., 237.);
		assertXY(part.positionPrev, 343., 344.);
		assertXY(part.velocity, 359., 360.);
		assertBounds(part.bounds, 259., 259., 420., 422.);
		assertXY(part.position, 237., 237.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 259., 259.);
		assertXY(part.vertices[1], 261., 261.);
		assertXY(part.vertices[2], 259., 262.);
	});

	it('should update body with position with setting undefined velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const position = Vector.create(37., 37.); // true random
		const updateVelocity = undefined;

		// Act
		Body.setPosition(body, position, updateVelocity);

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertXY(part.position, 37., 37.);
		assertXY(part.positionPrev, 41., 41.);
		assertXY(part.velocity, 159., 160.);
		assertBounds(part.bounds, 59., 59., 220., 222.);
		assertXY(part.position, 37., 37.);
		assertXY(part.velocity, 159., 160.);
		assertXY(part.vertices[0], 59., 59.);
		assertXY(part.vertices[1], 61., 61.);
		assertXY(part.vertices[2], 59., 62.);


		part = body.parts[1];
		assertXY(part.position, 137., 137.);
		assertXY(part.positionPrev, 243., 244.);
		assertXY(part.velocity, 259., 260.);
		assertBounds(part.bounds, 159., 159., 320., 322.);
		assertXY(part.position, 137., 137.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 159., 159.);
		assertXY(part.vertices[1], 161., 161.);
		assertXY(part.vertices[2], 159., 162.);

		part = body.parts[2];
		assertXY(part.position, 237., 237.);
		assertXY(part.positionPrev, 343., 344.);
		assertXY(part.velocity, 359., 360.);
		assertBounds(part.bounds, 259., 259., 420., 422.);
		assertXY(part.position, 237., 237.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 259., 259.);
		assertXY(part.vertices[1], 261., 261.);
		assertXY(part.vertices[2], 259., 262.);
	});

	it('should update body with position and setting velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const position = Vector.create(37., 37.) // true random
		const updateVelocity = true

		// Act
		Body.setPosition(body, position, updateVelocity)

		// Assert
		let part = body.parts[0];
		expect(part.id).toEqual(body.id);
		assertXY(part.position, 37., 37.)
		assertXY(part.positionPrev, 139., 140.)
		assertFloat(part.speed, 144.9586147836685)
		assertXY(part.velocity, -102., -103.)
		assertBounds(part.bounds, -43., -44., 61., 62.)
		assertXY(part.vertices[0], 59., 59.)
		assertXY(part.vertices[1], 61., 61.)
		assertXY(part.vertices[2], 59., 62.)

		part = body.parts[1];
		assertBounds(part.bounds, 57., 56., 161., 162.)
		assertXY(part.position, 137., 137.)
		assertXY(part.velocity, 259., 260.)
		assertXY(part.vertices[0], 159., 159.)
		assertXY(part.vertices[1], 161., 161.)
		assertXY(part.vertices[2], 159., 162.)

		part = body.parts[2];
		assertBounds(part.bounds, 157., 156., 261., 262.)
		assertXY(part.position, 237., 237.)
		assertXY(part.velocity, 359., 360.)
		assertXY(part.vertices[0], 259., 259.)
		assertXY(part.vertices[1], 261., 261.)
		assertXY(part.vertices[2], 259., 262.)
	});

	it('should not be able to update body with undefined position without setting velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const position = undefined;
		const updateVelocity = false;

		// Act
		let result = () => Body.setPosition(body, position, updateVelocity);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});

	it('should not be able to update undefined body with position without setting velocity', () => {
		// Arrange
		const body = undefined;
		const position = Vector.create(37., 37.) // true random
		const updateVelocity = false;

		// Act
		let result = () => Body.setPosition(body, position, updateVelocity);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setAngle', () => {
	it('should be able to set the angle on a default body, not updating the velocity', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const updateVelocity = false;
			const angle = 37.;

			// Act
			Body.setAngle(body, angle, updateVelocity);

			// Assert
			let part = body.parts[0];
			expect(part.id).toEqual(body.id);
			assertFloat(part.angle, 37.);
			assertFloat(part.anglePrev, 38.);
			assertXY(part.axes[0], 139.9796525125889, -55.594036392897955);
			assertXY(part.axes[1], 142.6034190498416, -56.650374008432436);
			assertBounds(part.bounds, 167.8614319097795, 127.32394861358623, 329.62151002436985, 289.5558579204094);
			assertXY(part.position, 139., 140.);
			assertXY(part.vertices[0], 167.8614319097795, 128.3802862291207);
			assertXY(part.vertices[1], 170.4851984470322, 127.32394861358623);
			assertXY(part.vertices[2], 170.62151002436985, 129.55585792040935);


			part = body.parts[1];
			assertFloat(part.angle, 137.);
			assertFloat(part.anglePrev, 202.);
			assertXY(part.axes[0], 271.16797937522296, -108.41091716962202);
			assertXY(part.axes[1], 273.7917459124756, -109.46725478515651);
			assertBounds(part.bounds, 299.04975877241355, 74.50706783686216, 460.80983688700394, 236.7389771436853);
			assertXY(part.position, 270.1883268626341, 87.18311922327594);
			assertXY(part.vertices[0], 299.04975877241355, 75.56340545239664);
			assertXY(part.vertices[1], 301.6735253096662, 74.50706783686216);
			assertXY(part.vertices[2], 301.80983688700394, 76.73897714368529);
		

			part = body.parts[2];
			assertFloat(part.angle, 237.);
			assertFloat(part.anglePrev, 302.);
			assertXY(part.axes[0], 402.35630623785704, -161.22779794634607);
			assertXY(part.axes[1], 404.9800727751097, -162.28413556188056);
			assertBounds(part.bounds, 430.2380856350476, 21.6901870601381, 591.998163749638, 183.92209636696123);
			assertXY(part.position, 401.37665372526817, 34.366238446551876);
			assertXY(part.vertices[0], 430.2380856350476, 22.74652467567259);
			assertXY(part.vertices[1], 432.8618521723003, 21.6901870601381);
			assertXY(part.vertices[2], 432.998163749638, 23.92209636696124);
		});
	});

	it('should be able to set the angle on a default body, not using the undefined update velocity', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const updateVelocity = undefined;
			const angle = 37.;

			// Act
			Body.setAngle(body, angle, updateVelocity);

			// Assert
			let part = body.parts[0];
			expect(part.id).toEqual(body.id);
			assertFloat(part.angle, 37.);
			assertFloat(part.anglePrev, 38.);
			assertXY(part.axes[0], 139.9796525125889, -55.594036392897955);
			assertXY(part.axes[1], 142.6034190498416, -56.650374008432436);
			assertBounds(part.bounds, 167.8614319097795, 127.32394861358623, 329.62151002436985, 289.5558579204094);
			assertXY(part.position, 139., 140.);
			assertXY(part.vertices[0], 167.8614319097795, 128.3802862291207);
			assertXY(part.vertices[1], 170.4851984470322, 127.32394861358623);
			assertXY(part.vertices[2], 170.62151002436985, 129.55585792040935);


			part = body.parts[1];
			assertFloat(part.angle, 137.);
			assertFloat(part.anglePrev, 202.);
			assertXY(part.axes[0], 271.16797937522296, -108.41091716962202);
			assertXY(part.axes[1], 273.7917459124756, -109.46725478515651);
			assertBounds(part.bounds, 299.04975877241355, 74.50706783686216, 460.80983688700394, 236.7389771436853);
			assertXY(part.position, 270.1883268626341, 87.18311922327594);
			assertXY(part.vertices[0], 299.04975877241355, 75.56340545239664);
			assertXY(part.vertices[1], 301.6735253096662, 74.50706783686216);
			assertXY(part.vertices[2], 301.80983688700394, 76.73897714368529);
		

			part = body.parts[2];
			assertFloat(part.angle, 237.);
			assertFloat(part.anglePrev, 302.);
			assertXY(part.axes[0], 402.35630623785704, -161.22779794634607);
			assertXY(part.axes[1], 404.9800727751097, -162.28413556188056);
			assertBounds(part.bounds, 430.2380856350476, 21.6901870601381, 591.998163749638, 183.92209636696123);
			assertXY(part.position, 401.37665372526817, 34.366238446551876);
			assertXY(part.vertices[0], 430.2380856350476, 22.74652467567259);
			assertXY(part.vertices[1], 432.8618521723003, 21.6901870601381);
			assertXY(part.vertices[2], 432.998163749638, 23.92209636696124);
		});
	});	

	it('should be able to set the angle on a default body, updating the velocity', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const updateVelocity = true;
			const angle = 37.;

			// Act
			Body.setAngle(body, angle, updateVelocity);

			// Assert
			let part = body.parts[0];
			expect(part.id).toEqual(body.id);
			assertFloat(part.angle, 37.);
			assertFloat(part.anglePrev, 101.);
			assertFloat(part.angularSpeed, 64.);
			assertFloat(part.angularVelocity, -64.);
			assertXY(part.axes[0], 139.9796525125889, -55.594036392897955);
			assertXY(part.axes[1], 142.6034190498416, -56.650374008432436);
			assertBounds(part.bounds, 167.8614319097795, 127.32394861358623, 329.62151002436985, 289.5558579204094);
			assertXY(part.position, 139., 140.);
			assertXY(part.vertices[0], 167.8614319097795, 128.3802862291207);
			assertXY(part.vertices[1], 170.4851984470322, 127.32394861358623);
			assertXY(part.vertices[2], 170.62151002436985, 129.55585792040935);

			part = body.parts[1];
			assertFloat(part.angle, 137.);
			assertFloat(part.anglePrev, 202.);
			assertXY(part.axes[0], 271.16797937522296, -108.41091716962202);
			assertXY(part.axes[1], 273.7917459124756, -109.46725478515651);
			assertBounds(part.bounds, 299.04975877241355, 74.50706783686216, 460.80983688700394, 236.7389771436853);
			assertXY(part.position, 270.1883268626341, 87.18311922327594);
			assertXY(part.vertices[0], 299.04975877241355, 75.56340545239664);
			assertXY(part.vertices[1], 301.6735253096662, 74.50706783686216);
			assertXY(part.vertices[2], 301.80983688700394, 76.73897714368529);

			part = body.parts[2];
			assertFloat(part.angle, 237.);
			assertFloat(part.anglePrev, 302.);
			assertXY(part.axes[0], 402.35630623785704, -161.22779794634607);
			assertXY(part.axes[1], 404.9800727751097, -162.28413556188056);
			assertBounds(part.bounds, 430.2380856350476, 21.6901870601381, 591.998163749638, 183.92209636696123);
			assertXY(part.position, 401.37665372526817, 34.366238446551876);
			assertXY(part.vertices[0], 430.2380856350476, 22.74652467567259);
			assertXY(part.vertices[1], 432.8618521723003, 21.6901870601381);
			assertXY(part.vertices[2], 432.998163749638, 23.92209636696124);
		});
	});


	it('should not be able to set an undefined angle on a default body, not updating the velocity', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const updateVelocity = false;
			const angle = undefined;

			// Act
			Body.setAngle(body, angle, updateVelocity);

			// Assert
			let part = body.parts[0];
			expect(part.id).toEqual(body.id);
			expect(part.angle).toEqual(NaN);
			expect(part.anglePrev).toEqual(NaN);
			expect(part.axes[0].x).toEqual(NaN);
			expect(part.axes[0].y).toEqual(NaN);
			expect(part.axes[1].x).toEqual(NaN);
			expect(part.axes[1].y).toEqual(NaN);
			expect(part.bounds.min.x).toEqual(Infinity);
			expect(part.bounds.min.y).toEqual(Infinity);
			expect(part.bounds.max.x).toEqual(-Infinity);
			expect(part.bounds.max.y).toEqual(-Infinity);
			expect(part.vertices[0].x).toEqual(NaN);
			expect(part.vertices[0].y).toEqual(NaN);
			expect(part.vertices[1].x).toEqual(NaN);
			expect(part.vertices[1].y).toEqual(NaN);
			expect(part.vertices[2].x).toEqual(NaN);
			expect(part.vertices[2].y).toEqual(NaN);
			assertXY(part.position, 139., 140.);

			part = body.parts[1];
			expect(part.angle).toEqual(NaN);
			assertFloat(part.anglePrev, 202.);
			expect(part.axes[0].x).toEqual(NaN);
			expect(part.axes[0].y).toEqual(NaN);
			expect(part.axes[1].x).toEqual(NaN);
			expect(part.axes[1].y).toEqual(NaN);
			expect(part.bounds.min.x).toEqual(Infinity);
			expect(part.bounds.min.y).toEqual(Infinity);
			expect(part.bounds.max.x).toEqual(-Infinity);
			expect(part.bounds.max.y).toEqual(-Infinity);
			expect(part.vertices[0].x).toEqual(NaN);
			expect(part.vertices[0].y).toEqual(NaN);
			expect(part.vertices[1].x).toEqual(NaN);
			expect(part.vertices[1].y).toEqual(NaN);
			expect(part.vertices[2].x).toEqual(NaN);
			expect(part.vertices[2].y).toEqual(NaN);
			expect(part.position.x).toEqual(NaN);
			expect(part.position.y).toEqual(NaN);

			part = body.parts[2];
			expect(part.angle).toEqual(NaN);
			assertFloat(part.anglePrev, 302.);
			expect(part.axes[0].x).toEqual(NaN);
			expect(part.axes[0].y).toEqual(NaN);
			expect(part.axes[1].x).toEqual(NaN);
			expect(part.axes[1].y).toEqual(NaN);
			expect(part.bounds.min.x).toEqual(Infinity);
			expect(part.bounds.min.y).toEqual(Infinity);
			expect(part.bounds.max.x).toEqual(-Infinity);
			expect(part.bounds.max.y).toEqual(-Infinity);
			expect(part.vertices[0].x).toEqual(NaN);
			expect(part.vertices[0].y).toEqual(NaN);
			expect(part.vertices[1].x).toEqual(NaN);
			expect(part.vertices[1].y).toEqual(NaN);
			expect(part.vertices[2].x).toEqual(NaN);
			expect(part.vertices[2].y).toEqual(NaN);
			expect(part.position.x).toEqual(NaN);
			expect(part.position.y).toEqual(NaN);
		});
	});

	it('should not be able to set the angle on a undefined body, not updating the velocity', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = undefined;
			const updateVelocity = false;
			const angle = 37.;

			// Act
			let result = () => Body.setAngle(body, angle, updateVelocity);

			// Assert
			// TODO: This causes a read or set from undefined. This should probably be fixed.
			expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/); 
		});
	});	
});

describe('Body.setVelocity', () => {
	it('should be able to set the velocity on a body', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const velocity = { x: 42., y: 43. };

			// Act
			Body.setVelocity(body, velocity);

			// Assert
			assertXY(body.position, 139., 140.);
			assertXY(body.positionPrev, -175.99999999999994, -182.49999999999994);
			assertFloat(body.speed, 60.108235708594876);
			assertXY(body.velocity, 42., 43);
		});
	});

	it('should not be able to set undefined velocity on a body', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = getTestBodyWithPartsWithParent();
			const velocity = undefined;

			// Act
			let result = () => Body.setVelocity(body, velocity);

			// Assert
			// TODO: This causes a read or set from undefined. This should probably be fixed.
			expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
		});
	});

	it('should not be able to set velocity on an undefined body', () => {
		jest.isolateModules(() => {
			// Arrange
			const Body = require("../../../src/body/Body");
			const body = undefined;
			const velocity = { x: 42., y: 43. };

			// Act
			let result = () => Body.setVelocity(body, velocity);

			// Assert
			// TODO: This causes a read or set from undefined. This should probably be fixed.
			expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
		});
	});
});

describe('Body.getVelocity', () => {
	it('should be able to get the velocity from a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		
		// Act
		let result = Body.getVelocity(body);

		// Assert
		assertXY(result, -0.5333333333333333, -0.5333333333333333);
	});

	it('should not be able to get the velocity from an undefined body', () => {
		// Arrange
		const body = undefined;
		
		// Act
		let result = () => Body.getVelocity(body);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.getSpeed', () => {
	it('should be able to get the speed from a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		
		// Act
		let result = Body.getSpeed(body);

		// Assert
		assertFloat(result, 0.7542472332656507);
	});

	it('should not be able to get the speed from an undefined body', () => {
		// Arrange
		const body = undefined;
		
		// Act
		let result = () => Body.getSpeed(body);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});
		
describe('Body.setSpeed', () => {
	it('should be able to set the speed on a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const speed = 42.1;
		
		// Act
		Body.setSpeed(body, speed);

		// Assert
		assertXY(body.position, 139., 140.);
		assertXY(body.positionPrev, 362.26896615965234, 363.26896615965234);
		assertFloat(body.speed, 42.1);
		assertXY(body.velocity, -29.76919548795365, -29.76919548795365);
	});

	it('should not be able to set undefined speed on a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const speed = undefined;
		
		// Act
		Body.setSpeed(body, speed);

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		assertXY(body.position, 139., 140.);
		expect(body.positionPrev.x).toEqual(NaN);
		expect(body.positionPrev.y).toEqual(NaN);
		expect(body.speed).toEqual(NaN);
		expect(body.velocity.x).toEqual(NaN);
		expect(body.velocity.y).toEqual(NaN);
	});

	it('should not be able to set the speed on an undefined body', () => {
		// Arrange
		const body = undefined;
		const speed = 42.1;
		
		// Act
		let result = () => Body.setSpeed(body, speed);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setAngularVelocity', () => {
	it('should be able to set the angular velocity on a body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const velocity = 37.;

		// Act
		Body.setAngularVelocity(body, velocity);
    
		// Assert
		assertFloat(body.angle, 101.);
		assertFloat(body.anglePrev, -176.49999999999994);
		assertFloat(body.angularVelocity, 37.);
		assertFloat(body.angularSpeed, 37.);
	});

	it('should not be able to set an angular velocity on a body with an undefined velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const velocity = undefined;

		// Act
		Body.setAngularVelocity(body, velocity);
    
		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		assertFloat(body.angle, 101.);
		expect(body.anglePrev).toEqual(NaN);
		expect(body.angularSpeed).toEqual(NaN);
		expect(body.angularVelocity).toEqual(NaN);
	});

	it('should not be able to set the angular velocity on an undefined body', () => {
		// Arrange
		const body = undefined;
		const velocity = 37.;

		// Act
		let result = () => Body.setAngularVelocity(body, velocity);
    
		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.getAngularVelocity', () => {
	it('should be able to get the angular velocity from a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		
		// Act
		let result = Body.getAngularVelocity(body);

		// Assert
		assertFloat(result, -0.13333333333333333);
	});

	it('should not be able to get the angular velocity from an undefined body', () => {
		// Arrange
		const body = undefined;
		
		// Act
		let result = () => Body.getAngularVelocity(body);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.getAngularSpeed', () => {
	it('should be able to get the angular speed from a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		
		// Act
		let result = Body.getAngularSpeed(body);

		// Assert
		assertFloat(result, 0.13333333333333333);
	});

	it('should not be able to get the angular speed from an undefined body', () => {
		// Arrange
		const body = undefined;
		
		// Act
		let result = () => Body.getAngularSpeed(body);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.setAngularSpeed', () => {
	it('should be able to set the angular speed on a body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const speed = 37.;

		// Act
		Body.setAngularSpeed(body, speed);
    
		// Assert
		assertFloat(body.angle, 101.);
		assertFloat(body.anglePrev, 378.49999999999994);
		assertFloat(body.angularVelocity, -37.);
		assertFloat(body.angularSpeed, 37.);
	});

	it('should not be able to set an angular speed on a body with an undefined velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const speed = undefined;

		// Act
		Body.setAngularSpeed(body, speed);
    
		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		assertFloat(body.angle, 101.);
		expect(body.anglePrev).toEqual(NaN);
		expect(body.angularSpeed).toEqual(NaN);
		expect(body.angularVelocity).toEqual(NaN);
	});

	it('should not be able to set the angular speed on an undefined body', () => {
		// Arrange
		const body = undefined;
		const speed = 37.;

		// Act
		let result = () => Body.setAngularSpeed(body, speed);
    
		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.translate', () => {
	it('should be able to translate a body without updating the velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let translate = { x: 37., y: 38. };
		let updateVelocity = false;
    
		// Act
		Body.translate(body, translate, updateVelocity);

		// Assert
		let part = body.parts[0];
		assertBounds(part.bounds, 198., 200., 359., 363.);
		assertXY(part.position, 176., 178.);
		assertXY(part.velocity, 159., 160.);
		assertXY(part.vertices[0], 198., 200.);
		assertXY(part.vertices[1], 200., 202.);
		assertXY(part.vertices[2], 198., 203.);

		part = body.parts[1];
		assertBounds(part.bounds, 298., 300., 459., 463.);
		assertXY(part.position, 276., 278.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 298., 300.);
		assertXY(part.vertices[1], 300., 302.);
		assertXY(part.vertices[2], 298., 303.);

		part = body.parts[2];
		assertBounds(part.bounds, 398., 400., 559., 563.);
		assertXY(part.position, 376., 378.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 398., 400.);
		assertXY(part.vertices[1], 400., 402.);
		assertXY(part.vertices[2], 398., 403.);
	});

	it('should be able to translate a body updating with an undefined velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let translate = { x: 37., y: 38. };
		let updateVelocity = undefined;
    
		// Act
		Body.translate(body, translate, updateVelocity);

		// Assert
		let part = body.parts[0];
		assertBounds(part.bounds, 198., 200., 359., 363.);
		assertXY(part.position, 176., 178.);
		assertXY(part.velocity, 159., 160.);
		assertXY(part.vertices[0], 198., 200.);
		assertXY(part.vertices[1], 200., 202.);
		assertXY(part.vertices[2], 198., 203.);

		part = body.parts[1];
		assertBounds(part.bounds, 298., 300., 459., 463.);
		assertXY(part.position, 276., 278.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 298., 300.);
		assertXY(part.vertices[1], 300., 302.);
		assertXY(part.vertices[2], 298., 303.);

		part = body.parts[2];
		assertBounds(part.bounds, 398., 400., 559., 563.);
		assertXY(part.position, 376., 378.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 398., 400.);
		assertXY(part.vertices[1], 400., 402.);
		assertXY(part.vertices[2], 398., 403.);
	});

	it('should not be able to translate a body without updating the velocity using an undefined translate', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let translate = undefined;
		let updateVelocity = false;
    
		// Act
		let result = () => Body.translate(body, translate, updateVelocity);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});

	it('should not be able to translate an undefined body without updating the velocity', () => {
		// Arrange
		const body = undefined;
		let translate = { x: 37., y: 38. };
		let updateVelocity = false;
    
		// Act
		let result = () => Body.translate(body, translate, updateVelocity);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.rotate', () => {
	it('should be able to rotate a default body with a point not updating the velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const rotation = 37.;
		const point = { x: 93., y: 94. };
		const updateVelocity = false;

		// Act
		Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 138.);
		assertFloat(part.anglePrev, 139.);
		assertXY(part.axes[0], 149.99246977540537, 13.684261422309802);
		assertXY(part.axes[1], 152.81037414601002, 13.928013259486477);
		assertBounds(part.bounds, 188.8087486005593, 102.28756246400738, 350.626652971164, 264.5838046198434);
		assertXY(part.position, 157.81180052390778, 99.60629225506382);
		assertXY(part.vertices[0], 188.8087486005593, 102.28756246400738);
		assertXY(part.vertices[1], 191.626652971164, 102.53131430118407);
		assertXY(part.vertices[2], 190.7393630006303, 104.58380461984342);

		part = body.parts[1]
		assertFloat(part.angle, 238.);
		assertFloat(part.anglePrev, 202.);
		assertXY(part.axes[0], 290.88768830563964, 25.871853281144183);
		assertXY(part.axes[1], 293.70559267624435, 26.11560511832087);
		assertBounds(part.bounds, 329.7039671307936, 114.47515432284177, 491.5218715013983, 276.7713964786778);
		assertXY(part.position, 298.70701905414205, 111.7938841138982);
		assertXY(part.vertices[0], 329.7039671307936, 114.47515432284177);
		assertXY(part.vertices[1], 332.5218715013983, 114.71890616001845);
		assertXY(part.vertices[2], 331.6345815308646, 116.7713964786778);

		part = body.parts[2]
		assertFloat(part.angle, 338.);
		assertFloat(part.anglePrev, 302.);
		assertXY(part.axes[0], 431.7829068358739, 38.05944513997858);
		assertXY(part.axes[1], 434.6008112064786, 38.30319697715527);
		assertBounds(part.bounds, 470.5991856610279, 126.66274618167616, 632.4170900316326, 288.9589883375122);
		assertXY(part.position, 439.6022375843763, 123.98147597273258);
		assertXY(part.vertices[0], 470.5991856610279, 126.66274618167616);
		assertXY(part.vertices[1], 473.4170900316326, 126.90649801885284);
		assertXY(part.vertices[2], 472.52980006109885, 128.9589883375122);
	});

	it('should be able to rotate a default body with a point updating with undefined velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const rotation = 37.;
		const point = { x: 93., y: 94. };
		const updateVelocity = undefined;

		// Act
		Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 138.);
		assertFloat(part.anglePrev, 139.);
		assertXY(part.axes[0], 149.99246977540537, 13.684261422309802);
		assertXY(part.axes[1], 152.81037414601002, 13.928013259486477);
		assertBounds(part.bounds, 188.8087486005593, 102.28756246400738, 350.626652971164, 264.5838046198434);
		assertXY(part.position, 157.81180052390778, 99.60629225506382);
		assertXY(part.vertices[0], 188.8087486005593, 102.28756246400738);
		assertXY(part.vertices[1], 191.626652971164, 102.53131430118407);
		assertXY(part.vertices[2], 190.7393630006303, 104.58380461984342);

		part = body.parts[1]
		assertFloat(part.angle, 238.);
		assertFloat(part.anglePrev, 202.);
		assertXY(part.axes[0], 290.88768830563964, 25.871853281144183);
		assertXY(part.axes[1], 293.70559267624435, 26.11560511832087);
		assertBounds(part.bounds, 329.7039671307936, 114.47515432284177, 491.5218715013983, 276.7713964786778);
		assertXY(part.position, 298.70701905414205, 111.7938841138982);
		assertXY(part.vertices[0], 329.7039671307936, 114.47515432284177);
		assertXY(part.vertices[1], 332.5218715013983, 114.71890616001845);
		assertXY(part.vertices[2], 331.6345815308646, 116.7713964786778);

		part = body.parts[2]
		assertFloat(part.angle, 338.);
		assertFloat(part.anglePrev, 302.);
		assertXY(part.axes[0], 431.7829068358739, 38.05944513997858);
		assertXY(part.axes[1], 434.6008112064786, 38.30319697715527);
		assertBounds(part.bounds, 470.5991856610279, 126.66274618167616, 632.4170900316326, 288.9589883375122);
		assertXY(part.position, 439.6022375843763, 123.98147597273258);
		assertXY(part.vertices[0], 470.5991856610279, 126.66274618167616);
		assertXY(part.vertices[1], 473.4170900316326, 126.90649801885284);
		assertXY(part.vertices[2], 472.52980006109885, 128.9589883375122);
	});

	it('should be able to rotate a default body with a point updating the velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const rotation = 37.;
		const point = { x: 93., y: 94. };
		const updateVelocity = true;

		// Act
		Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 138.);
		assertFloat(part.anglePrev, 101.);
		assertXY(part.axes[0], 149.99246977540537, 13.684261422309802);
		assertXY(part.axes[1], 152.81037414601002, 13.928013259486477);
		assertBounds(part.bounds, 188.8087486005593, 61.8938547190712, 210.43845349507177, 104.58380461984342);
		assertXY(part.position, 157.81180052390778, 99.60629225506382);
		assertXY(part.vertices[0], 188.8087486005593, 102.28756246400738);
		assertXY(part.vertices[1], 191.626652971164, 102.53131430118407);
		assertXY(part.vertices[2], 190.7393630006303, 104.58380461984342);

		part = body.parts[1]
		assertFloat(part.angle, 238.);
		assertFloat(part.anglePrev, 202.);
		assertXY(part.axes[0], 290.88768830563964, 25.871853281144183);
		assertXY(part.axes[1], 293.70559267624435, 26.11560511832087);
		assertBounds(part.bounds, 329.7039671307936, 74.0814465779056, 351.3336720253061, 116.7713964786778);
		assertXY(part.position, 298.70701905414205, 111.7938841138982);
		assertXY(part.vertices[0], 329.7039671307936, 114.47515432284177);
		assertXY(part.vertices[1], 332.5218715013983, 114.71890616001845);
		assertXY(part.vertices[2], 331.6345815308646, 116.7713964786778);

		part = body.parts[2]
		assertFloat(part.angle, 338.);
		assertFloat(part.anglePrev, 302.);
		assertXY(part.axes[0], 431.7829068358739, 38.05944513997858);
		assertXY(part.axes[1], 434.6008112064786, 38.30319697715527);
		assertBounds(part.bounds, 470.5991856610279, 86.26903843673998, 492.2288905555404, 128.9589883375122);
		assertXY(part.position, 439.6022375843763, 123.98147597273258);
		assertXY(part.vertices[0], 470.5991856610279, 126.66274618167616);
		assertXY(part.vertices[1], 473.4170900316326, 126.90649801885284);
		assertXY(part.vertices[2], 472.52980006109885, 128.9589883375122);
	});


	it('should be able to rotate a body with an undefined point and not updating the velocity', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const rotation = 37.;
		const point = undefined;
		const updateVelocity = false;

		// Act
		Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 138.);
		assertFloat(part.anglePrev, 139.);
		assertXY(part.axes[0], 149.99246977540537, 13.684261422309802);
		assertXY(part.axes[1], 152.81037414601002, 13.928013259486477);
		assertBounds(part.bounds, 169.99694807665153, 142.68127020894357, 331.8148524472562, 304.9775123647796);
		assertXY(part.position, 139., 140.);
		assertXY(part.vertices[0], 169.99694807665153, 142.68127020894357);
		assertXY(part.vertices[1], 172.81485244725621, 142.92502204612026);
		assertXY(part.vertices[2], 171.92756247672253, 144.97751236477959);

		part = body.parts[1]
		assertFloat(part.angle, 238.);
		assertFloat(part.anglePrev, 202.);
		assertXY(part.axes[0], 290.88768830563964, 25.871853281144183);
		assertXY(part.axes[1], 293.70559267624435, 26.11560511832087);
		assertBounds(part.bounds, 310.89216660688584, 154.86886206777797, 472.71007097749055, 317.165104223614);
		assertXY(part.position, 279.8952185302343, 152.18759185883437);
		assertXY(part.vertices[0], 310.89216660688584, 154.86886206777797);
		assertXY(part.vertices[1], 313.71007097749055, 155.11261390495463);
		assertXY(part.vertices[2], 312.8227810069568, 157.16510422361398);

		part = body.parts[2]
		assertFloat(part.angle, 338.);
		assertFloat(part.anglePrev, 302.);
		assertXY(part.axes[0], 431.7829068358739, 38.05944513997858);
		assertXY(part.axes[1], 434.6008112064786, 38.30319697715527);
		assertBounds(part.bounds, 451.7873851371201, 167.05645392661233, 613.6052895077248, 329.35269608244835);
		assertXY(part.position, 420.79043706046855, 164.37518371766876);
		assertXY(part.vertices[0], 451.7873851371201, 167.05645392661233);
		assertXY(part.vertices[1], 454.6052895077248, 167.30020576378902);
		assertXY(part.vertices[2], 453.7179995371911, 169.35269608244838);
	});

	it('should not be able to rotate a default body with a point not updating the velocity with an undefined rotation', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		const rotation = undefined;
		const point = { x: 93., y: 94. };
		const updateVelocity = false;

		// Act
		Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		let part = body.parts[0];
		expect(part.angle).toEqual(NaN);
		expect(part.anglePrev).toEqual(NaN);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.axes[1].x).toEqual(NaN);
		expect(part.axes[1].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);

		part = body.parts[1]
		expect(part.angle).toEqual(NaN);
		assertFloat(part.anglePrev, 202.);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.axes[1].x).toEqual(NaN);
		expect(part.axes[1].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);

		part = body.parts[2]
		expect(part.angle).toEqual(NaN);
		assertFloat(part.anglePrev, 302.);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.axes[1].x).toEqual(NaN);
		expect(part.axes[1].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);
	});

	it('should not be able to rotate an undefined body with a point not updating the velocity', () => {
		// Arrange
		const body = undefined;
		const rotation = 37.;
		const point = { x: 93., y: 94. };
		const updateVelocity = false;

		// Act
		let result = () => Body.rotate(body, rotation, point, updateVelocity);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.scale', () => {
	it('should be able to scale a body using a point', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let scaleX = 7.;
		let scaleY = 8.;
		let point = { x: 93., y: 94. };

		// Act
		Body.scale(body, scaleX, scaleY, point);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 101.);
		assertFloat(part.anglePrev, 102.);
		assertFloat(part.area, 336.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 569., 638., 742., 822.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 375692344392.70856);
		assertFloat(part.inverseInertia, 2.6617524017330175e-12);
		assertFloat(part.inverseMass, 0.00002362055933484505);
		assertFloat(part.mass, 42336.);
		assertXY(part.position, 415., 462.);
		assertXY(part.vertices[0], 569., 638.);
		assertXY(part.vertices[1], 583., 654.);
		assertXY(part.vertices[2], 569., 662.);

		part = body.parts[1]
		assertFloat(part.angle, 201.);
		assertFloat(part.anglePrev, 202.);
		assertFloat(part.area, 168.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 1269., 1438., 1442., 1622.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 107623281758.02255);
		assertFloat(part.inverseInertia, 9.291669828916522e-12);
		assertFloat(part.inverseMass, 0.0000472411186696901);
		assertFloat(part.mass, 21168.);
		assertXY(part.position, 1115., 1262.);
		assertXY(part.vertices[0], 1269., 1438.);
		assertXY(part.vertices[1], 1283., 1454.);
		assertXY(part.vertices[2], 1269., 1462.);

		part = body.parts[2]
		assertFloat(part.angle, 301.);
		assertFloat(part.anglePrev, 302.);
		assertFloat(part.area, 168.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 1969., 2238., 2142., 2422.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 268069062634.686);
		assertFloat(part.inverseInertia, 3.730381977582996e-12);
		assertFloat(part.inverseMass, 0.0000472411186696901);
		assertFloat(part.mass, 21168.);
		assertXY(part.position, 1815., 2062.);
		assertXY(part.vertices[0], 1969., 2238.);
		assertXY(part.vertices[1], 1983., 2254.);
		assertXY(part.vertices[2], 1969., 2262.);
	});

	it('should be able to scale a body not using a point', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let scaleX = 7.;
		let scaleY = 8.;
		let point = undefined;

		// Act
		Body.scale(body, scaleX, scaleY, point);

		// Assert
		let part = body.parts[0]
		assertFloat(part.angle, 101.);
		assertFloat(part.anglePrev, 102.);
		assertFloat(part.area, 336.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 293., 316., 466., 500.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 243311333527.02026);
		assertFloat(part.inverseInertia, 4.109960623305481e-12);
		assertFloat(part.inverseMass, 0.00002362055933484505);
		assertFloat(part.mass, 42336.);
		assertXY(part.position, 139., 140.);
		assertXY(part.vertices[0], 293., 316.);
		assertXY(part.vertices[1], 307., 332.);
		assertXY(part.vertices[2], 293., 340.);

		part = body.parts[1]
		assertFloat(part.angle, 201.);
		assertFloat(part.anglePrev, 202.);
		assertFloat(part.area, 168.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 993., 1116., 1166., 1300.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 57986153557.518196);
		assertFloat(part.inverseInertia, 1.7245496358161957e-11);
		assertFloat(part.inverseMass, 0.0000472411186696901);
		assertFloat(part.mass, 21168.);
		assertXY(part.position, 839., 940.);
		assertXY(part.vertices[0], 993., 1116.);
		assertXY(part.vertices[1], 1007., 1132.);
		assertXY(part.vertices[2], 993., 1140.);

		part = body.parts[2]
		assertFloat(part.angle, 301.);
		assertFloat(part.anglePrev, 302.);
		assertFloat(part.area, 168.);
		assertXY(part.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(part.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(part.axes[2], -1., 0.);
		assertBounds(part.bounds, 1693., 1916., 1866., 2100.);
		assertFloat(part.density, 126.);
		assertFloat(part.inertia, 185325179969.50208);
		assertFloat(part.inverseInertia, 5.3959208358225496e-12);
		assertFloat(part.inverseMass, 0.0000472411186696901);
		assertFloat(part.mass, 21168.);
		assertXY(part.position, 1539., 1740.);
		assertXY(part.vertices[0], 1693., 1916.);
		assertXY(part.vertices[1], 1707., 1932.);
		assertXY(part.vertices[2], 1693., 1940.);
	});

	it('should be able to scale a body with no parts using a point', () => {
		// Arrange
		const body = getTestBodyWithoutParts();
		body.parts.push(body);
		let scaleX = 7.;
		let scaleY = 8.;
		let point = { x: 93., y: 94. };

		// Act
		Body.scale(body, scaleX, scaleY, point);

		// Assert
		assertFloat(body.angle, 101.);
		assertFloat(body.anglePrev, 102.);
		assertFloat(body.area, 168.);
		assertXY(body.axes[0], 0.7525766947068778, -0.658504607868518);
		assertXY(body.axes[1], 0.49613893835683387, 0.8682431421244593);
		assertXY(body.axes[2], -1., 0.);
		assertBounds(body.bounds, 569., 638., 742., 822.);
		assertFloat(body.density, 126.);
		assertFloat(body.inertia, 19148711497.75123);
		assertFloat(body.inverseInertia, 5.2222834947272416e-11);
		assertFloat(body.inverseMass, 0.0000472411186696901);
		assertFloat(body.mass, 21168.);
		assertXY(body.position, 415., 462.);
		assertXY(body.vertices[0], 569., 638.);
		assertXY(body.vertices[1], 583., 654.);
		assertXY(body.vertices[2], 569., 662.);
	});

	it('should not be able to scale a body using a point and an undefined scale', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let scaleX = undefined;
		let scaleY = undefined;
		let point = { x: 93., y: 94. };

		// Act
		Body.scale(body, scaleX, scaleY, point);

		// Assert
		// TODO: This causes the result to have undefined and NaN properties. This should probably be fixed.
		let part = body.parts[0]
		assertFloat(part.angle, 101.);
		assertFloat(part.anglePrev, 102.);
		expect(part.area).toEqual(NaN);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.density).toEqual(NaN);
		expect(part.inertia).toEqual(NaN);
		expect(part.inverseInertia).toEqual(NaN);
		expect(part.inverseMass).toEqual(NaN);
		expect(part.mass).toEqual(NaN);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);

		part = body.parts[1]
		assertFloat(part.angle, 201.);
		assertFloat(part.anglePrev, 202.);
		expect(part.area).toEqual(NaN);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.density).toEqual(NaN);
		expect(part.inertia).toEqual(NaN);
		expect(part.inverseInertia).toEqual(NaN);
		expect(part.inverseMass).toEqual(NaN);
		expect(part.mass).toEqual(NaN);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);

		part = body.parts[2]
		assertFloat(part.angle, 301.);
		assertFloat(part.anglePrev, 302.);
		expect(part.area).toEqual(NaN);
		expect(part.axes[0].x).toEqual(NaN);
		expect(part.axes[0].y).toEqual(NaN);
		expect(part.bounds.min.x).toEqual(Infinity);
		expect(part.bounds.min.y).toEqual(Infinity);
		expect(part.bounds.max.x).toEqual(-Infinity);
		expect(part.bounds.max.y).toEqual(-Infinity);
		expect(part.density).toEqual(NaN);
		expect(part.inertia).toEqual(NaN);
		expect(part.inverseInertia).toEqual(NaN);
		expect(part.inverseMass).toEqual(NaN);
		expect(part.mass).toEqual(NaN);
		expect(part.position.x).toEqual(NaN);
		expect(part.position.y).toEqual(NaN);
		expect(part.vertices[0].x).toEqual(NaN);
		expect(part.vertices[0].y).toEqual(NaN);
		expect(part.vertices[1].x).toEqual(NaN);
		expect(part.vertices[1].y).toEqual(NaN);
		expect(part.vertices[2].x).toEqual(NaN);
		expect(part.vertices[2].y).toEqual(NaN);
	});

	it('should be able to scale a circular body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		body.circleRadius = 37.37;
		let scaleX = 37.;
		let scaleY = 37.;
		let point = { x: 93., y: 94. };

		// Act
		Body.scale(body, scaleX, scaleY, point);

		// Assert
		assertFloat(body.circleRadius, 1382.6899999999998);
	});

	it('should not be able to scale an undefined body using a point', () => {
		// Arrange
		const body = undefined;
		let scaleX = 7.;
		let scaleY = 8.;
		let point = { x: 93., y: 94. };

		// Act
		let result = () => Body.scale(body, scaleX, scaleY, point);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.update', () => {
	it('should be able to update a valid body providing a delta time', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let deltaTime = 2.;
    
		// Act
		Body.update(body, deltaTime);

		// Assert
		let part = body.parts[0];
		assertFloat(part.angle, 121082.60418646617);
		assertFloat(part.anglePrev, 101.);
		assertFloat(part.angularVelocity, 120981.60418646617);
		assertXY(part.axes[0], 142.05303055391587, -50.05932990410723);
		assertXY(part.axes[1], 144.71622087157778, -51.0119144577884);
		assertBounds(part.bounds, 115357.4911405531, 116033.529738297, 230549.39901876543, 231940.72603011483);
		assertFloat(part.deltaTime, 312.);
		assertFloat(part.density, 126.);
		assertXY(part.force, 127., 128);
		assertFloat(part.frictionAir, 130.);
		assertFloat(part.inertia, 133.);
		assertFloat(part.mass, 136.);
		assertXY(part.position, 115328.19604705882, 116044.96075294117);
		assertXY(part.positionPrev, 139., 140.);
		assertFloat(part.timeScale, 156.);
		assertFloat(part.torque, 157.);
		assertXY(part.velocity, 115189.19604705882, 115904.96075294117);
		assertXY(part.vertices[0], 115357.4911405531, 116034.48232285069);
		assertXY(part.vertices[1], 115360.15433087076, 116033.529738297);
		assertXY(part.vertices[2], 115360.20297170662, 116035.76527717366);
		
		part = body.parts[1]
		assertFloat(part.angle, 201);
		assertFloat(part.anglePrev, 202.);
		assertFloat(part.angularVelocity, 204.);
		assertXY(part.axes[0], 275.2125464370103, -97.68855758816609);
		assertXY(part.axes[1], 277.8757367546722, -98.64114214184728);
		assertBounds(part.bounds, 115490.6506564362, 115985.90051061293, 230682.55853464853, 231893.09680243078);
		assertFloat(part.deltaTime, 225.);
		assertFloat(part.density, 226.);
		assertXY(part.force, 227., 228);
		assertFloat(part.frictionAir, 230.);
		assertFloat(part.inertia, 233.);
		assertFloat(part.mass, 236.);
		assertXY(part.position, 115461.35556294191, 115997.33152525712);
		assertXY(part.positionPrev, 243., 244.);
		assertFloat(part.timeScale, 256.);
		assertFloat(part.torque, 257.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 115490.6506564362, 115986.85309516662);
		assertXY(part.vertices[1], 115493.31384675387, 115985.90051061293);
		assertXY(part.vertices[2], 115493.36248758971, 115988.1360494896);
    
		part = body.parts[2]
		assertFloat(part.angle, 301);
		assertFloat(part.anglePrev, 302.);
		assertFloat(part.angularVelocity, 304.);
		assertXY(part.axes[0], 408.37206232010476, -145.31778527222497);
		assertXY(part.axes[1], 411.03525263776663, -146.27036982590613);
		assertBounds(part.bounds, 115623.8101723193, 115938.27128292888, 230815.71805053164, 231845.46757474673);
		assertFloat(part.deltaTime, 325.);
		assertFloat(part.density, 326.);
		assertXY(part.force, 327., 328);
		assertFloat(part.frictionAir, 330.);
		assertFloat(part.inertia, 333.);
		assertFloat(part.mass, 336.);
		assertXY(part.position, 115594.51507882502, 115949.70229757305);
		assertXY(part.positionPrev, 343., 344.);
		assertFloat(part.timeScale, 356.);
		assertFloat(part.torque, 357.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 115623.8101723193, 115939.22386748256);
		assertXY(part.vertices[1], 115626.47336263696, 115938.27128292888);
		assertXY(part.vertices[2], 115626.5220034728, 115940.50682180555);
	});

	it('should be able to update a valid body providing an undefined delta time', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		let deltaTime = undefined;
    
		// Act
		Body.update(body, deltaTime);

		// Assert
		let part = body.parts[0];
		assertFloat(part.angle, 8401753.82406015);
		assertFloat(part.anglePrev, 101.);
		assertFloat(part.angularVelocity, 8401652.82406015);
		assertXY(part.axes[0], -43.980856722441075, -144.05097792781592);
		assertXY(part.axes[1], -44.81947020798727, -146.75222345939204);
		assertBounds(part.bounds, 7999988.795461703, 8049673.326230091, 15999850.889872752, 16099241.768652093);
		assertFloat(part.deltaTime, 2600.);
		assertFloat(part.density, 126.);
		assertXY(part.force, 127., 128);
		assertFloat(part.frictionAir, 130.);
		assertFloat(part.inertia, 133.);
		assertFloat(part.mass, 136.);
		assertXY(part.position, 7999998.858823529, 8049705.74117647);
		assertXY(part.positionPrev, 139., 140.);
		assertFloat(part.timeScale, 156.);
		assertFloat(part.torque, 157.);
		assertXY(part.velocity, 7999859.858823529, 8049565.74117647);
		assertXY(part.vertices[0], 7999989.634075188, 8049676.0274756225);
		assertXY(part.vertices[1], 7999988.795461703, 8049673.326230091);
		assertXY(part.vertices[2], 7999991.031049223, 8049673.37258136);
		
    
		part = body.parts[1]
		assertFloat(part.angle, 201);
		assertFloat(part.anglePrev, 202.);
		assertFloat(part.angularVelocity, 204.);
		assertXY(part.axes[0], -85.91153099975105, -279.11325450662287);
		assertXY(part.axes[1], -86.75014448529726, -281.81450003819896);
		assertBounds(part.bounds, 7999946.864787426, 8049538.263953513, 15999808.959198475, 16099106.706375513);
		assertFloat(part.deltaTime, 225.);
		assertFloat(part.density, 226.);
		assertXY(part.force, 227., 228);
		assertFloat(part.frictionAir, 230.);
		assertFloat(part.inertia, 233.);
		assertFloat(part.mass, 236.);
		assertXY(part.position, 7999956.928149252, 8049570.678899892);
		assertXY(part.positionPrev, 243., 244.);
		assertFloat(part.timeScale, 256.);
		assertFloat(part.torque, 257.);
		assertXY(part.velocity, 259., 260.);
		assertXY(part.vertices[0], 7999947.703400911, 8049540.965199044);
		assertXY(part.vertices[1], 7999946.864787426, 8049538.263953513);
		assertXY(part.vertices[2], 7999949.100374945, 8049538.310304781);
    
		part = body.parts[2]
		assertFloat(part.angle, 301);
		assertFloat(part.anglePrev, 302.);
		assertFloat(part.angularVelocity, 304.);
		assertXY(part.axes[0], -127.842205277061, -414.1755310854297);
		assertXY(part.axes[1], -128.6808187626072, -416.87677661700593);
		assertBounds(part.bounds, 7999904.934113149, 8049403.201676934, 15999767.028524198, 16098971.644098936);
		assertFloat(part.deltaTime, 325.);
		assertFloat(part.density, 326.);
		assertXY(part.force, 327., 328);
		assertFloat(part.frictionAir, 330.);
		assertFloat(part.inertia, 333.);
		assertFloat(part.mass, 336.);
		assertXY(part.position, 7999914.997474975, 8049435.616623312);
		assertXY(part.positionPrev, 343., 344.);
		assertFloat(part.timeScale, 356.);
		assertFloat(part.torque, 357.);
		assertXY(part.velocity, 359., 360.);
		assertXY(part.vertices[0], 7999905.772726634, 8049405.9029224655);
		assertXY(part.vertices[1], 7999904.934113149, 8049403.201676934);
		assertXY(part.vertices[2], 7999907.169700668, 8049403.248028202);
	});

	it('should not be able to update an undefined body providing a delta time', () => {
		// Arrange
		const body = undefined;
		let deltaTime = 2.;
    
		// Act
		let result = () => Body.update(body, deltaTime);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.updateVelocities', () => {
	it('should be able update all velocities and speeds', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
    
		// Act
		Body.updateVelocities(body);

		// Assert 
		assertFloat(body.speed, 0.7542472332656507);
		assertFloat(body.angularVelocity, -0.13333333333333333);
		assertFloat(body.angularSpeed, 0.13333333333333333);
	});

	it('should not be able update all velocities and speeds on undefined body', () => {
		// Arrange
		const body = undefined;
    
		// Act
		let result = () => Body.updateVelocities(body);

		// Assert 
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body.applyForce', () => {
	it('should be able to apply force to a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		body.force = { x: 3, y: 4 };
		let position = { x: 89., y: 99. };
		let force = { x: 37, y: 42. };

		// Act
		Body.applyForce(body, position, force);

		// Assert 
		assertXY(body.force, 40., 46.);
		assertFloat(body.torque, -426.);
	});

	it('should not be able to apply an undefined force to a valid body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		body.force = { x: 3, y: 4 };
		let position = { x: 89., y: 99. };
		let force = undefined;

		// Act
		let result = () => Body.applyForce(body, position, force);

		// Assert 
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});

	it('should not be able to apply force to a valid body with an undefined position', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();
		body.force = { x: 3, y: 4 };
		let position = undefined;
		let force = { x: 37, y: 42. };

		// Act
		let result = () => Body.applyForce(body, position, force);

		// Assert 
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});

	it('should not be able to apply force to an undefined body', () => {
		// Arrange
		const body = undefined;
		let position = { x: 89., y: 99. };
		let force = { x: 37, y: 42. };

		// Act
		let result = () => Body.applyForce(body, position, force);

		// Assert 
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});

describe('Body._totalProperties', () => {
	it('should sum the properties of all compound parts of the given body', () => {
		// Arrange
		const body = getTestBodyWithPartsWithParent();

		// Act
		const result = Body._totalProperties(body);

		// Assert
		assertFloat(result.area, 510.);
		assertXY(result.centre, 297.7412587412587, 298.7412587412587);
		assertFloat(result.inertia, 566.);
		assertFloat(result.mass, 572.);
	});

	it('should not be able sum the properties of all compound parts of an undefined body', () => {
		// Arrange
		const body = undefined;

		// Act
		const result = () => Body._totalProperties(body);

		// Assert
		// TODO: This causes a read or set from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot .* properties of undefined \(.* '.*'\)$/);
	});
});