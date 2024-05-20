const {assertXY} = require("../TestUtil");
const {
	getTestVerticesSqaureWithoutBody,
	} = require("../TestData");
const Axes = require("../../../src/geometry/Axes");

describe('Axes.fromVertices', () => { 
    it('should be able to create axes from valid vertices', () => {
        // Arrange
		const vertices = getTestVerticesSqaureWithoutBody();
		    
        // Act
        const result = Axes.fromVertices(vertices);
    
        // Assert
		assertXY(result[0], 0., 1.);
		assertXY(result[1], -1., 0.);
  
    });

    it('should not be able to create axes from undefined vertices', () => {
        // Arrange
        const vertices = undefined;
    
        // Act
        const result = () => Axes.fromVertices(vertices);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});