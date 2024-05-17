const {assertFloat, assertXY} = require("../TestUtil");
const {testSquare, testBodyWithParts, testVerticesSqaureWithoutBody, testVerticesAreaZeroWithoutBody, testVerticesNegAreaWithoutBody} = require("../TestData");
const Vector = require("../../../src/geometry/Vector");
const Vertices = require("../../../src/geometry/Vertices");

describe('Vertices.create', () => { 
    it('should be able to create the vertices with valid points and body', () => {
        // Arrange
        const points = testSquare;
        const body = testBodyWithParts;
            
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
        const points = testSquare;
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
        const body = testBodyWithParts;
            
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
        const body = testBodyWithParts;
            
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
        const body = testBodyWithParts;
            
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
        const body = testBodyWithParts;
            
        // Act
        // TODO: This causes a read from undefined. This should probably be fixed.
        const result = () => Vertices.fromPath(path, body);
    
        // Assert
        expect(result).toThrow("Cannot read properties of undefined (reading 'replace')");

    });
});

describe('Vertices.area', () => { 
    it('should be able to calulate the area with valid vertices and signed true', () => {
        // Arrange
        const vertices = testVerticesNegAreaWithoutBody;
        const signed = true;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, -4.);
  
    });

    it('should be able to calulate the area with valid vertices and signed false', () => {
        // Arrange
        const vertices = testVerticesNegAreaWithoutBody;
        const signed = false;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 4.);
  
    });

    it('should be able to calulate the area with valid vertices and signed undefined', () => {
        // Arrange
        const vertices = testVerticesNegAreaWithoutBody;
        const signed = undefined;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 4.);
  
    });

    it('should be able to calulate the area with valid vertices whose area add up to zero signed true', () => {
        // Arrange
        const vertices = testVerticesAreaZeroWithoutBody;
        const signed = true;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 0.);
  
    });

    it('should be able to calulate the area with valid vertices whose area add up to zero signed false', () => {
        // Arrange
        const vertices = testVerticesAreaZeroWithoutBody;
        const signed = false;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 0.);
  
    });

    it('should not be able to calulate the area with undefined vertices and signed true', () => {
        // Arrange
        const vertices = undefined;
        const signed = true;
  
        // Act
        const result = () => Vertices.area(vertices, signed);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.rotate', () => { 
    it('should be able to rotate the vertices in place', () => {
        // Arrange
        const points = testVerticesNegAreaWithoutBody;
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
        const vertices = testSquare;
        const angle = 0.;
        const point = Vector.create(42., 42.);
    
        // Act
        const result = Vertices.rotate(vertices, angle, point);
    
        // Assert
        expect(result).toEqual(undefined);
    
      });

    it('should not be able to rotate the vertices in place with an undefined angle', () => {
        // Arrange
        const vertices = testSquare;
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
        const vertices = testSquare;
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
  
describe('Vertices.centre', () => { 
    it('should be able to get the centre of the valid vertices', () => {
        // Arrange
        const vertices = testVerticesSqaureWithoutBody;
    
        // Act
        const result = Vertices.centre(vertices);
    
        // Assert
        assertXY(result, 2., 2.);
  
    });

    it('should not be able to get the centre of undefined vertices', () => {
        // Arrange
        const vertices = undefined;
    
        // Act
        const result = () => Vertices.centre(vertices);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.mean', () => { 
    it('should be able to get the mean of the valid vertices', () => {
        // Arrange
        const vertices = testVerticesSqaureWithoutBody;
    
        // Act
        const result = Vertices.mean(vertices);
    
        // Assert
        assertXY(result, 2., 2.);
  
    });

    it('should not be able to get the mean of undefined vertices', () => {
        // Arrange
        const vertices = undefined;
    
        // Act
        const result = () => Vertices.mean(vertices);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.inertia', () => { 
    it('should be able to get the inertia of the valid vertices', () => {
        // Arrange
        const vertices = testVerticesSqaureWithoutBody;
        const mass = 37.3;
    
        // Act
        const result = Vertices.inertia(vertices, mass);
    
        // Assert
        assertFloat(result, 211.36666666666665);
  
    });

    it('should be able to get the inertia of the valid vertices with negative mass', () => {
        // Arrange
        const vertices = testVerticesSqaureWithoutBody;
        const mass = -37.3;
    
        // Act
        const result = Vertices.inertia(vertices, mass);
    
        // Assert
        assertFloat(result, -211.36666666666665);
  
    });

    it('should not be able to get the inertia of the valid vertices with undefined mass', () => {
        // Arrange
        const vertices = testVerticesSqaureWithoutBody;
        const mass = undefined;
    
        // Act
        const result = Vertices.inertia(vertices, mass);
    
        // Assert
        // TODO: This causes the result to be NaN. This probaby should be fixed.
        assertFloat(result, NaN);
  
    });



    it('should not be able to get the inertia of undefined vertices', () => {
        // Arrange
        const vertices = undefined;
        const mass = 37.3;
    
        // Act
        const result = () => Vertices.inertia(vertices);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});