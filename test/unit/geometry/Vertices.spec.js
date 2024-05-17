const {assertFloat, assertXY} = require("../TestUtil");
const {
    getTestSquare,
    getTestBodyWithParts,
    getTestVerticesSqaureWithoutBody,
    getTestVerticesAreaZeroWithoutBody,
    getTestVerticesNegAreaWithoutBody } = require("../TestData");
const Vector = require("../../../src/geometry/Vector");
const Vertices = require("../../../src/geometry/Vertices");

describe('Vertices.create', () => { 
    it('should be able to create the vertices with valid points and body', () => {
        // Arrange
        const points = getTestSquare();
        const body = getTestBodyWithParts();
            
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
        const points = getTestSquare();
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
        const body = getTestBodyWithParts();
            
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
        const body = getTestBodyWithParts();
            
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
        const body = getTestBodyWithParts();
            
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
        const body = getTestBodyWithParts();
            
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
        const vertices = getTestVerticesNegAreaWithoutBody();
        const signed = true;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, -4.);
  
    });

    it('should be able to calulate the area with valid vertices and signed false', () => {
        // Arrange
        const vertices = getTestVerticesNegAreaWithoutBody();
        const signed = false;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 4.);
  
    });

    it('should be able to calulate the area with valid vertices and signed undefined', () => {
        // Arrange
        const vertices = getTestVerticesNegAreaWithoutBody();
        const signed = undefined;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 4.);
  
    });

    it('should be able to calulate the area with valid vertices whose area add up to zero signed true', () => {
        // Arrange
        const vertices = getTestVerticesAreaZeroWithoutBody();
        const signed = true;
  
        // Act
        const result = Vertices.area(vertices, signed);
    
        // Assert
        assertFloat(result, 0.);
  
    });

    it('should be able to calulate the area with valid vertices whose area add up to zero signed false', () => {
        // Arrange
        const vertices = getTestVerticesAreaZeroWithoutBody();
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
        const vertices = getTestVerticesSqaureWithoutBody();
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
        const vertices = getTestSquare();
        const angle = 0.;
        const point = Vector.create(42., 42.);
    
        // Act
        const result = Vertices.rotate(vertices, angle, point);
    
        // Assert
        expect(result).toEqual(undefined);
    
      });

    it('should not be able to rotate the vertices in place with an undefined angle', () => {
        // Arrange
        const vertices = getTestSquare();
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
        const vertices = getTestSquare();
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
        const vertices = getTestVerticesSqaureWithoutBody();
    
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
        const vertices = getTestVerticesSqaureWithoutBody();
    
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
        const vertices = getTestVerticesSqaureWithoutBody();
        const mass = 37.3;
    
        // Act
        const result = Vertices.inertia(vertices, mass);
    
        // Assert
        assertFloat(result, 211.36666666666665);
  
    });

    it('should be able to get the inertia of the valid vertices with negative mass', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const mass = -37.3;
    
        // Act
        const result = Vertices.inertia(vertices, mass);
    
        // Assert
        assertFloat(result, -211.36666666666665);
  
    });

    it('should not be able to get the inertia of the valid vertices with undefined mass', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
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

describe('Vertices.translate', () => { 
    it('should be able to translate valid vertices', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = { x: 42.2, y: 37.3 };
        const scalar = 97.8;
    
        // Act
        const result = Vertices.translate(vertices, vector, scalar);
    
        // Assert
        assertXY(result[0], 4128.16, 3648.9399999999996);
        assertXY(result[1], 4130.16, 3648.9399999999996);
        assertXY(result[2], 4130.16, 3650.9399999999996);
        assertXY(result[3], 4128.16, 3650.9399999999996);
  
    });

    it('should be able to translate valid vertices with undefined scalar', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = { x: 42.2, y: 37.3 };
        const scalar = undefined;
    
        // Act
        const result = Vertices.translate(vertices, vector, scalar);
    
        // Assert
        assertXY(result[0], 43.2, 38.3);
        assertXY(result[1], 45.2, 38.3);
        assertXY(result[2], 45.2, 40.3);
        assertXY(result[3], 43.2, 40.3);
  
    });

    it('should not be able to translate valid vertices with undefined vector', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = undefined;
        const scalar = undefined;
    
        // Act
        const result = () => Vertices.translate(vertices, vector, scalar);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  
    });

    it('should not be able to translate undefined vertices', () => {
        // Arrange
        const vertices = undefined;
        const vector = { x: 42.2, y: 37.3 };
        const scalar = 97.8;
    
        // Act
        const result = () => Vertices.translate(vertices, vector, scalar);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.contains', () => { 
    it('should be able to get if a vector is contained within the valid vertices', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = { x: 2., y: 2. };
    
        // Act
        const result = Vertices.contains(vertices, vector);
    
        // Assert
        expect(result).toEqual(true);
  
    });

    it('should be able to get if a vector is not contained within the valid vertices', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = { x: 200., y: 200. };
    
        // Act
        const result = Vertices.contains(vertices, vector);
    
        // Assert
        expect(result).toEqual(false);
  
    });

    it('should not be able to get if an undefined vector is provided', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const vector = undefined;
    
        // Act
        const result = () => Vertices.contains(vertices, vector);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  
    });

    it('should not be able to get if undefined vertices are provided', () => {
        // Arrange
        const vertices = undefined;
        const vector = { x: 2., y: 2. };;
    
        // Act
        const result = () => Vertices.contains(vertices, vector);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.scale', () => { 
    it('should be able to scale valid vertices', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const scaleX = 42.2;
        const scaleY = 37.3;
        const point = { x: 93.5, y: 97.8 };
    
        // Act
        const result = Vertices.scale(vertices, scaleX, scaleY, point);
    
        // Assert
        assertXY(result[0], -3810.0000000000005, -3512.8399999999992);
        assertXY(result[1], -3725.6000000000004, -3512.8399999999992);
        assertXY(result[2], -3725.6000000000004, -3438.2399999999993);
        assertXY(result[3], -3810.0000000000005, -3438.2399999999993);
    });

    it('should be able to scale valid vertices if point is undefined', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const scaleX = 42.2;
        const scaleY = 37.3;
        const point = undefined;
    
        // Act
        const result = Vertices.scale(vertices, scaleX, scaleY, point);
    
        // Assert
        assertXY(result[0], -40.2, -35.3);
        assertXY(result[1], 44.2, -35.3);
        assertXY(result[2], 44.2, 39.3);
        assertXY(result[3], -40.2, 39.3);
    });

    it('should not be able to scale valid vertices if scaleY is undefined', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const scaleX = 42.2;
        const scaleY = undefined;
        const point = { x: 93.5, y: 97.8 };
    
        // Act
        const result = Vertices.scale(vertices, scaleX, scaleY, point);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        assertXY(result[0], -3810.0000000000005, NaN);
        assertXY(result[1], -3725.6000000000004, NaN);
        assertXY(result[2], -3725.6000000000004, NaN);
        assertXY(result[3], -3810.0000000000005, NaN);
    });

    it('should not be able to scale valid vertices if scaleX is undefined', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const scaleX = undefined;
        const scaleY = 37.3;
        const point = { x: 93.5, y: 97.8 };
    
        // Act
        const result = Vertices.scale(vertices, scaleX, scaleY, point);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        assertXY(result[0], NaN, -3512.8399999999992);
        assertXY(result[1], NaN, -3512.8399999999992);
        assertXY(result[2], NaN, -3438.2399999999993);
        assertXY(result[3], NaN, -3438.2399999999993);
    });

    it('should not be able to scale undefined vertices', () => {
        // Arrange
        const vertices = undefined;
        const scaleX = 42.2;
        const scaleY = 37.3;
        const point = { x: 93.5, y: 97.8 };
    
        // Act
        const result = () => Vertices.scale(vertices, scaleX, scaleY, point);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});

describe('Vertices.chamfer', () => { 
    it('should be able to chamfer valid vertices', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = [2, 3, 4, 5, ];
        const quality = -3.4;
        const qualityMin = 6.;
        const qualityMax = 12.;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
        assertXY(result[0], 1., 3.);
        assertXY(result[1], 1.0681483474218634, 2.4823619097949585);
        assertXY(result[2], 1.2679491924311226, 2.);
        assertXY(result[3], 1.5857864376269049, 1.585786437626905);
        assertXY(result[4], 1.9999999999999998, 1.2679491924311228);
        assertXY(result[5], 2.482361909794958, 1.0681483474218636);
        assertXY(result[6], 4.440892098500626e-16, 0.9999999999999996);
        assertXY(result[7], 0.7764571353075627, 1.1022225211327945);
        assertXY(result[8], 1.5000000000000002, 1.4019237886466835);
        assertXY(result[9], 2.121320343559643, 1.8786796564403567);
        assertXY(result[10], 2.5980762113533165, 2.499999999999999);
        assertXY(result[11], 2.897777478867205, 3.223542864692437);
        assertXY(result[12], 3, -1);
        assertXY(result[13], 2.8637033051562732, 0.03527618041008296);
        assertXY(result[14], 2.464101615137755, 0.9999999999999998);
        assertXY(result[15], 1.8284271247461903, 1.8284271247461898);
        assertXY(result[16], 1.0000000000000004, 2.4641016151377544);
        assertXY(result[17], 0.035276180410083846, 2.863703305156273);
        assertXY(result[18], 6., 3.);
        assertXY(result[19], 4.705904774487396, 2.8296291314453415);
        assertXY(result[20], 3.5000000000000004, 2.3301270189221936);
        assertXY(result[21], 2.4644660940672627, 1.5355339059327378);
        assertXY(result[22], 1.6698729810778072, 0.5000000000000004);
        assertXY(result[23], 1.1703708685546594, -0.7059047744873952);
    });

     it('should be able to chamfer valid vertices with qualityMax smaller then qualityMin', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = [2, 3, 4, 5, ];
        const quality = -3.4;
        const qualityMin = 2.;
        const qualityMax = 1.;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
         assertXY(result[0], 1., 3.);
         assertXY(result[1], 1.5857864376269049, 1.585786437626905);
         assertXY(result[2], 4.440892098500626e-16, 0.9999999999999996);
         assertXY(result[3], 2.121320343559643, 1.8786796564403567);
         assertXY(result[4], 3., -1.);
         assertXY(result[5], 1.8284271247461903, 1.8284271247461898);
         assertXY(result[6], 6., 3. );
         assertXY(result[7], 2.4644660940672627, 1.5355339059327378);
        
     });
    
    it('should be able to chamfer valid vertices with undefined qualityMax', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = [2, 3, 4, 5, ];
        const quality = -3.4;
        const qualityMin = 2.;
        const qualityMax = undefined;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
         assertXY(result[0], 1., 3.);
         assertXY(result[1], 1.5857864376269049, 1.585786437626905);
         assertXY(result[2], 4.440892098500626e-16, 0.9999999999999996);
         assertXY(result[3], 2.121320343559643, 1.8786796564403567);
         assertXY(result[4], 3., -1.);
         assertXY(result[5], 1.8284271247461903, 1.8284271247461898);
         assertXY(result[6], 6., 3. );
         assertXY(result[7], 2.4644660940672627, 1.5355339059327378);
        
    });

    it('should be able to chamfer valid vertices with undefined qualityMin and undefined qualityMax', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = [2, 3, 4, 5, ];
        const quality = -3.4;
        const qualityMin = undefined;
        const qualityMax = undefined;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
         assertXY(result[0], 1., 3.);
         assertXY(result[1], 1.5857864376269049, 1.585786437626905);
         assertXY(result[2], 4.440892098500626e-16, 0.9999999999999996);
         assertXY(result[3], 2.121320343559643, 1.8786796564403567);
         assertXY(result[4], 3., -1.);
         assertXY(result[5], 1.8284271247461903, 1.8284271247461898);
         assertXY(result[6], 6., 3. );
         assertXY(result[7], 2.4644660940672627, 1.5355339059327378);
        
    });

    it('should be able to chamfer valid vertices with undefined quality and undefined qualityMin and undefined qualityMax', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = [2, 3, 4, 5, ];
        const quality = undefined;
        const qualityMin = undefined;
        const qualityMax = undefined;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
        assertXY(result[0], 1., 3.);
        assertXY(result[1], 1.4951214255668521, 1.6826767761054022);
        assertXY(result[2], 2.7353404762120563, 1.0175885047578193);
        assertXY(result[3], 4.440892098500626e-16, 0.9999999999999996);
        assertXY(result[4], 1.7711728834401939, 1.5786477709828843);
        assertXY(result[5], 2.8590889395283896, 3.091368922022566);
        assertXY(result[6], 3., -1.);
        assertXY(result[7], 2.3545917657194435, 1.1786955008369815);
        assertXY(result[8], 0.626642957316347, 2.6543169935588686);
        assertXY(result[9], 6., 3.);
        assertXY(result[10], 3.445185946065424, 2.2980140937203055);
        assertXY(result[11], 1.607749275741794, 0.3891700599273511);
    });

    it('should be able to chamfer valid vertices with undefined radius and undefined quality and undefined qualityMin and undefined qualityMax', () => {
        // Arrange
        const vertices = getTestVerticesSqaureWithoutBody();
        const radius = undefined;
        const quality = undefined;
        const qualityMin = undefined;
        const qualityMax = undefined;
    
        // Act
        const result = Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
        assertXY(result[0], 1., 9.);    
        assertXY(result[1], 1.8366176963389194, 5.438265314261145);
        assertXY(result[2], 4.171488492898817, 2.6214831954606046);
        assertXY(result[3], 7.516263832912953, 1.1387960854282735);
        assertXY(result[4], -5., 1.);
        assertXY(result[5], -1.4382653142611441, 1.8366176963389194);
        assertXY(result[6], 1.3785168045393954, 4.171488492898817);
        assertXY(result[7], 2.8612039145717265, 7.516263832912953);
        assertXY(result[8], 3., -5.);
        assertXY(result[9], 2.1633823036610806, -1.4382653142611441);
        assertXY(result[10], -0.17148849289881696, 1.3785168045393954);
        assertXY(result[11], -3.516263832912953, 2.8612039145717265);
        assertXY(result[12], 9., 3.);
        assertXY(result[13], 5.438265314261145, 2.1633823036610806);
        assertXY(result[14], 2.6214831954606046, -0.17148849289881696);
        assertXY(result[15], 1.1387960854282735, -3.516263832912953);
    });


    it('should not be able to chamfer undefined vertices', () => {
        // Arrange
        // Arrange
        const vertices = undefined;
        const radius = [2, 3, 4, 5, ];
        const quality = -3.4;
        const qualityMin = 6.;
        const qualityMax = 12.;
    
        // Act
        const result = () => Vertices.chamfer(vertices, radius, quality, qualityMin, qualityMax);
    
        // Assert
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow("Cannot read properties of undefined (reading 'length')");
  
    });
});