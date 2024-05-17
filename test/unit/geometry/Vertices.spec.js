const {assertFloat, assertXY} = require("../TestUtil");
const {TestSquare} = require("../TestData");
const Vector = require("../../../src/geometry/Vector");
const Vertices = require("../../../src/geometry/Vertices");

describe('Vertices.rotate', () => { 
    it('should be able to rotate the vertices in place', () => {
      // Arrange
      const vertices = TestSquare;
      const angle = 37.;
      const point = Vector.create(42., 42.);
  
      // Act
      const result = Vertices.rotate(vertices, angle, point);
  
      // Assert
      assertXY(result[0], -15.767039597396057, 37.0030873378779);
      assertXY(result[1], -14.236211493505373, 35.716011071163905);
      assertXY(result[2], -12.94913522679137, 37.24683917505459);
      assertXY(result[3], -14.479963330682054, 38.533915441768585);
  
    });

    it('should return undefined when rotating the vertices in place with angle set to zero', () => {
        // Arrange
        const vertices = TestSquare;
        const angle = 0.;
        const point = Vector.create(42., 42.);
    
        // Act
        const result = Vertices.rotate(vertices, angle, point);
    
        // Assert
        expect(result).toEqual(undefined);
    
      });

    it('should not be able to rotate the vertices in place with an undefined angle', () => {
        // Arrange
        const vertices = TestSquare;
        const angle = undefined;
        const point = Vector.create(42., 42.);
    
        // Act
        // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
        const result = Vertices.rotate(vertices, angle, point);
    
        // Assert
        assertXY(result[0], NaN, NaN);
        assertXY(result[1], NaN, NaN);
        assertXY(result[2], NaN, NaN);
        assertXY(result[3], NaN, NaN);
    
      });

      it('should not be able to rotate the vertices in place with undefined point', () => {
        // Arrange
        const vertices = TestSquare;
        const angle = 37.;
        const point = undefined;
    
        // Act
        // TODO: This causes a read from undefined. This should probably be fixed.
        const result = () => Vertices.rotate(vertices, angle, point);
    
        // Assert
        expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
    
      });

      it('should not be able to rotate the vertices in place with undefined vertices', () => {
        // Arrange
        const vertices = undefined;
        const angle = 37.;
        const point = Vector.create(42., 42.);
    
        // Act
        // TODO: This causes a read from undefined. This should probably be fixed.
        const result = () => Vertices.rotate(vertices, angle, point);
    
        // Assert
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
    
      });
  });