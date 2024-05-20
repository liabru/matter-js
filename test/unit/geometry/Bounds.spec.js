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
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
	
	it('should not be able to update undefined bounds with valid vertices', () => {
		// Arrange
		const bounds = undefined;
		const vertices = getTestVerticesSqaureWithoutBody();
		const velocity = Vector.create(5., 6.);
			    
        // Act
        const result = () => Bounds.update(bounds, vertices, velocity);
    
        // TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe('Bounds.contains', () => { 
    it('should be able to determine that bounds contains valid vector', () => {
        // Arrange
		const bounds = getTestBounds();
		const vector = Vector.create(100., 150.);
			    
        // Act
        const result = Bounds.contains(bounds, vector);
    
        // Assert
		expect(result).toEqual(true);
	});
	
	it('should be able to determine that bounds does noet contains valid vector', () => {
        // Arrange
		const bounds = getTestBounds();
		const vector = Vector.create(0., 0.);
			    
        // Act
        const result = Bounds.contains(bounds, vector);
    
        // Assert
		expect(result).toEqual(false);
    });

    it('should not be able to determine that bounds contains undefined vector', () => {
        // Arrange
		const bounds = getTestBounds();
		const vector = undefined;
			    
        // Act
        const result = () => Bounds.contains(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});

	it('should not be able to determine that undefined bounds contains valid vector', () => {
        // Arrange
		const bounds = undefined;
		const vector = Vector.create(100., 150.);
			    
        // Act
        const result = () => Bounds.contains(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe('Bounds.overlaps', () => { 
    it('should be able to determine that bounds overlap with valid other bounds', () => {
        // Arrange
		const bounds = getTestBounds();
		const otherBounds = getTestBounds();
		otherBounds.max.x += 100.;
		otherBounds.max.y += 100.;
					    
        // Act
        const result = Bounds.overlaps(bounds, otherBounds);
    
        // Assert
		expect(result).toEqual(true);
	});

	it('should be able to determine that bounds do not overlap with valid other bounds', () => {
        // Arrange
		const bounds = getTestBounds();
		const otherBounds = getTestBounds();
		otherBounds.min.x = 1.;
		otherBounds.min.y = 1.;
		otherBounds.max.x = 10.;
		otherBounds.max.y = 10.;
					    
        // Act
        const result = Bounds.overlaps(bounds, otherBounds);
    
        // Assert
		expect(result).toEqual(false);
	});
	
	it('should not be able to determine that bounds overlap with undefined other bounds', () => {
        // Arrange
		const bounds = getTestBounds();
		const otherBounds = undefined;
					    
        // Act
        const result = () => Bounds.overlaps(bounds, otherBounds);

        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
		expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe('Bounds.translate', () => { 
    it('should be able to translate bounds with valid vector', () => {
		// Arrange
		const bounds = getTestBounds();
		const vector = Vector.create(4., 1.);
			    
        // Act
        Bounds.translate(bounds, vector);
    
        // Assert
		assertBounds(bounds, 104., 151., 204., 251.);
	});

	it('should not be able to translate bounds with undefined vector', () => {
		// Arrange
		const bounds = getTestBounds();
		const vector = undefined;
			    
        // Act
        const result = () => Bounds.translate(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});

	it('should not be able to translate undefined bounds with valid vector', () => {
		// Arrange
		const bounds = undefined;
		const vector = Vector.create(4., 1.);;
			    
        // Act
        const result = () => Bounds.translate(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
});

describe('Bounds.shift', () => { 
    it('should be able to shift bounds with valid vector', () => {
		// Arrange
		const bounds = getTestBounds();
		const vector = Vector.create(4., 1.);
			    
        // Act
        Bounds.shift(bounds, vector);
    
        // Assert
		assertBounds(bounds, 4., 1., 104., 101.);
	});

	it('should not be able to shift bounds with undefined vector', () => {
		// Arrange
		const bounds = getTestBounds();
		const vector = undefined;
			    
        // Act
        const result = () => Bounds.shift(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});

	it('should not be able to shift undefined bounds with valid vector', () => {
		// Arrange
		const bounds = undefined;
		const vector = Vector.create(4., 1.);;
			    
        // Act
        const result = () => Bounds.shift(bounds, vector);
    
        // Assert
		// TODO: This causes a read from undefined. This should probably be fixed.
        expect(result).toThrow(/^Cannot read properties of undefined \(reading '.*'\)$/);
	});
}); 