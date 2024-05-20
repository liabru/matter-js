const {assertBounds} = require("../TestUtil");
const {
	getTestVerticesSqaureWithoutBody,
	} = require("../TestData");
const Bounds = require("../../../src/geometry/Bounds");

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