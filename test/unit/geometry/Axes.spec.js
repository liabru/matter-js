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
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
  
    });
});

describe('Axes.rotate', () => { 
    it('should be able to rotate axes from valid axes', () => {
        // Arrange
		const axes = Axes.fromVertices(getTestVerticesSqaureWithoutBody());
		const angle = 90.;
		    
        // Act
        Axes.rotate(axes, angle);
    
		// Assert
		assertXY(axes[0], -0.8939966636005579, -0.4480736161291702);
		assertXY(axes[1], 0.4480736161291702, -0.8939966636005579);
  
	});
	
	it('should not be able to rotate axes from valid axes and undefined angle', () => {
        // Arrange
		const axes = Axes.fromVertices(getTestVerticesSqaureWithoutBody());
		const angle = undefined;
		    
        // Act
        Axes.rotate(axes, angle);
    
		// Assert
		// TODO: This causes the result to be NaN. This probaby should be fixed.
		assertXY(axes[0], NaN, NaN );
		assertXY(axes[1], NaN, NaN );
  
    });

    it('should not be able to rotate axes from undefined axes', () => {
        // Arrange
		const axes = undefined;
		const angle = 90.;
    
        // Act
        const result = () => Axes.rotate(axes, angle);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
  
    });
});