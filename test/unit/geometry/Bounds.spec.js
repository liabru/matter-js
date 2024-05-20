const {assertBounds} = require("../TestUtil");
const {
	getTestVerticesSqaureWithoutBody,
	getTestBounds,
	} = require("../TestData");
const Bounds = require("../../../src/geometry/Bounds");
const Vector = require("../../../src/geometry/Vector");

describe('Bounds.create', () => { 
    it('should be able to create bounds from valid vertices', () => {
        // Arrange
		const vertices = getTestVerticesSqaureWithoutBody();
			    
        // Act
        const result = Bounds.create(vertices);
    
        // Assert
		assertBounds(result, 1., 1., 3., 3.);
    });

    it('should be able to create bounds from undefined vertices', () => {
        // Arrange
        const vertices = undefined;
    
        // Act
        const result = Bounds.create(vertices);
    
        // Assert
        assertBounds(result, 0., 0., 0., 0.);
  
    });
});

describe('Bounds.update', () => { 
    it('should be able to update bounds with valid vertices', () => {
		// Arrange
		const bounds = getTestBounds();
		const vertices = getTestVerticesSqaureWithoutBody();
		const velocity = Vector.create(5., 6.);
			    
        // Act
        Bounds.update(bounds, vertices, velocity);
    
        // Assert
		assertBounds(bounds, 1., 1., 8., 9.);
	});
	
	it('should be able to update bounds with valid vertices and undefined velocity', () => {
		// Arrange
		const bounds = getTestBounds();
		const vertices = getTestVerticesSqaureWithoutBody();
		const velocity = undefined;
			    
        // Act
        Bounds.update(bounds, vertices, velocity);
    
        // Assert
		assertBounds(bounds, 1., 1., 3., 3.);
	});
	
	it('should not be able to update bounds with undefined vertices and undefined velocity', () => {
		// Arrange
		const bounds = getTestBounds();
		const vertices = undefined;
		const velocity = undefined;
			    
        // Act
        const result = () => Bounds.update(bounds, vertices, velocity);
    
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
	});
	
	it('should not be able to update undefined bounds with valid vertices', () => {
		// Arrange
		const bounds = undefined;
		const vertices = getTestVerticesSqaureWithoutBody();
		const velocity = Vector.create(5., 6.);
			    
        // Act
        const result = () => Bounds.update(bounds, vertices, velocity);
    
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'min')");
	});


});