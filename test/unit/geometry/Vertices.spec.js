const {assertFloat, assertXY} = require("../TestUtil");
const {TestSquare} = require("../TestData");
const Vector = require("../../../src/geometry/Vector");
const Vertices = require("../../../src/geometry/Vertices");
const Body = require("../../../src/body/Body");

describe('Vertices.create', () => { 
    it('should be able to create the vertices with valid points and body', () => {
        // Arrange
        const points = TestSquare;
        const body = Body.create();
            
        // Act
        const result = Vertices.create(points, body);
    
        // Assert
        assertXY(result[0], 1., 1.);
        assertXY(result[1], 3., 1.);
        assertXY(result[2], 3., 3.);
        assertXY(result[3], 1., 3.);
        expect(result.length).toEqual(4);
        expect(result[0].body.id).toEqual(body.id);
        expect(result[1].body.id).toEqual(body.id);
        expect(result[2].body.id).toEqual(body.id);
        expect(result[3].body.id).toEqual(body.id);
        expect(result[0].isInternal).toEqual(false);
        expect(result[1].isInternal).toEqual(false);
        expect(result[2].isInternal).toEqual(false);
        expect(result[3].isInternal).toEqual(false);
        expect(result[0].index).toEqual(0);
        expect(result[1].index).toEqual(1);
        expect(result[2].index).toEqual(2);
        expect(result[3].index).toEqual(3);

    });

    it('should be able to create the vertices with valid points and undefined body', () => {
        // Arrange
        const points = TestSquare;
        const body = undefined;
            
        // Act
        const result = Vertices.create(points, body);
    
        // Assert
        assertXY(result[0], 1., 1.);
        assertXY(result[1], 3., 1.);
        assertXY(result[2], 3., 3.);
        assertXY(result[3], 1., 3.);
        expect(result.length).toEqual(4);
        expect(result[0].body).toEqual(undefined);
        expect(result[1].body).toEqual(undefined);
        expect(result[2].body).toEqual(undefined);
        expect(result[3].body).toEqual(undefined);
        expect(result[0].isInternal).toEqual(false);
        expect(result[1].isInternal).toEqual(false);
        expect(result[2].isInternal).toEqual(false);
        expect(result[3].isInternal).toEqual(false);
        expect(result[0].index).toEqual(0);
        expect(result[1].index).toEqual(1);
        expect(result[2].index).toEqual(2);
        expect(result[3].index).toEqual(3);

    });

    it('should not be able to create the vertices with undefined points and valid body', () => {
        // Arrange
        const points = undefined;
        const body = Body.create();
            
        // Act
        // TODO: This causes a read from undefined. This should probably be fixed.
        const result = () => Vertices.create(points, body);
    
        // Assert
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
    });
});

describe('Vertices.fromPath', () => { 
    it('should be able to create the vertices with valid path', () => {
        // Arrange
        const path = "1 2 L 3, 4 L 5 6";
        const body = Body.create();
            
        // Act
        const result = Vertices.fromPath(path, body);
    
        // Assert
        assertXY(result[0], 1., 2.);
        assertXY(result[1], 3., 4.);
        assertXY(result[2], 5., 6.);
        expect(result.length).toEqual(3);
        expect(result[0].body.id).toEqual(body.id);
        expect(result[1].body.id).toEqual(body.id);
        expect(result[2].body.id).toEqual(body.id);
        expect(result[0].isInternal).toEqual(false);
        expect(result[1].isInternal).toEqual(false);
        expect(result[2].isInternal).toEqual(false);
        expect(result[0].index).toEqual(0);
        expect(result[1].index).toEqual(1);
        expect(result[2].index).toEqual(2);

    });
  
    it('should be able to create the vertices with an undefined body', () => {
        // Arrange
        const path = "1 2 L 3, 4 L 5 6";
        const body = undefined;
            
        // Act
        const result = Vertices.fromPath(path, body);
    
        // Assert
        assertXY(result[0], 1., 2.);
        assertXY(result[1], 3., 4.);
        assertXY(result[2], 5., 6.);
        expect(result.length).toEqual(3);
        expect(result[0].body).toEqual(undefined);
        expect(result[1].body).toEqual(undefined);
        expect(result[2].body).toEqual(undefined);
        expect(result[0].isInternal).toEqual(false);
        expect(result[1].isInternal).toEqual(false);
        expect(result[2].isInternal).toEqual(false);
        expect(result[0].index).toEqual(0);
        expect(result[1].index).toEqual(1);
        expect(result[2].index).toEqual(2);

    });
  
    it('should (not?) be able to create the vertices with an invalid path', () => {
        // Arrange
        const path = "1 2 L123NND L 5 6";
        const body = Body.create();
            
        // Act
        // TODO: This causes the result to have NaN y on the second Vector. This probaby should be fixed.
        const result = Vertices.fromPath(path, body);
    
        // Assert
        assertXY(result[0], 1., 2.);
        assertXY(result[1], 123., NaN);
        assertXY(result[2], 5., 6.);
        expect(result.length).toEqual(3);
        expect(result[0].body.id).toEqual(body.id);
        expect(result[1].body.id).toEqual(body.id);
        expect(result[2].body.id).toEqual(body.id);
        expect(result[0].isInternal).toEqual(false);
        expect(result[1].isInternal).toEqual(false);
        expect(result[2].isInternal).toEqual(false);
        expect(result[0].index).toEqual(0);
        expect(result[1].index).toEqual(1);
        expect(result[2].index).toEqual(2);

    });
    
    it('should not be able to create the vertices with an undefined path', () => {
        // Arrange
        const path = undefined;
        const body = Body.create();
            
        // Act
        // TODO: This causes a read from undefined. This should probably be fixed.
        const result = () => Vertices.fromPath(path, body);
    
        // Assert
        expect(result).toThrow("Cannot read properties of undefined (reading 'replace')");

    });
});

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