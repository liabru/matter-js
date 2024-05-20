const {assertFloat, assertXY, assertBounds} = require("../TestUtil");
const {
	getTestBodyWithoutParts,
	getTestBodyPartsWithoutParent
	} = require("../TestData");
const Body = require("../../../src/body/Body");

describe('Body.create', () => { 
    it('should create a body with the correct default properties', () => {
        // Arrange
			    
        // Act
		const result = Body.create();
    
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