const Vector = require("../../../src/geometry/Vector")
const {assertFloat, assertXY} = require("../TestUtil")

describe("Vector.create", () => {

  it('should be to create a new vector when x an y are provided', () => {
    // Arrange
    let x = 10.1;
    let y = 12.1;

    // Act
    const result = Vector.create(x, y);

    // Assert
    assertXY(result, 10.1, 12.1);
  }); 

  it('should be able to create when x and y are undefined', () => {
    // Arrange
    let x = undefined
    let y = undefined; 

    // Act
    const result = Vector.create(x, y);

    // Assert
    assertXY(result, 0., 0.);
  });
});

describe("Vector.clone", () => {

  it('should be able to clone when valid vector is provided', () => {
    // Arrange
    const vector = Vector.create(10.1, 12.1);

    // Act
    const result = Vector.clone(vector);

    // Assert
    assertXY(result, 10.1, 12.1);
  });

  it('should not be able to clone when provided vector is undefined', () => {
    // Arrange
    const vector = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result =  () => {
      Vector.clone(vector);
    }

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });
});

describe("Vector.magnitude", () => {
  it('should be able to calculate the result from a valid vector', () => {
    // Arrange
    const vector = Vector.create(5,3);

    // Act
    const result = Vector.magnitude(vector);

    // Assert
    assertFloat(result, 5.830951894845301);   
  })

  it('should not be able to calculate the result from a valid vector', () => {
    // Arrange
    const vector = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result =  () => {
      Vector.magnitude(vector);
    }
    
    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  })
});

describe("Vector.magnitudeSquared", () => {

  it('should be able to calculate the result from a valid vector', () => {
    // Arrange
    const vector = Vector.create(10.,2.);

    // Act
    const result = Vector.magnitudeSquared(vector);

    // Assert
    assertFloat(result, 104.);
  });

  it('should not be able to calculate the result from a undefined vector', () => {
    // Arrange
    const vector = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.magnitudeSquared(vector);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });
});

describe("Vector.rotate", () => {

  it('should be able to rotate a valid vector', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const angle = 73.;
    const output = {};

    // Act
    const result = Vector.rotate(vector, angle, output);

    // Assert
    assertXY(result, -5.8237387172961625, -56.01976497052327);
    expect(output).toEqual(result)
  });

  it('should be able to rotate a valid vector, but not set output if output is undefined', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const angle = 73.;
    const output = undefined;

    // Act
    const result = Vector.rotate(vector, angle, output);

    // Assert
    assertXY(result, -5.8237387172961625, -56.01976497052327);
    expect(output).toEqual(undefined)
  });

  it('should not be able to rotate a valid vector when the angle is undefined', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const angle = undefined;
    const output = {};

    // Act
    // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
    const result =  Vector.rotate(vector, angle, output);

    // Assert
    assertXY(result, NaN, NaN);
    expect(output).toEqual(result)
  });

  it('should not be able to rotate an undefined vector', () => {
    // Arrange
    const vector = undefined;
    const angle = 73.;
    const output = {};

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.rotate(vector, angle, output);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });

});

describe("Vector.rotateAbout", () => {
  it('should be able to rotate a valid vector about a point', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const point = Vector.create(93.3, 97.7);
    const angle = 73.;
    const output = {};

    // Act
    const result = Vector.rotateAbout(vector, angle, point, output);

    // Assert
    assertXY(result, 90.04242170542244, 176.7490871778713);
    expect(output).toEqual(result)
  });

  it('should be able to rotate a valid vector about a point, but not set output if output is undefined', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const point = Vector.create(93.3, 97.7);
    const angle = 73.;
    const output = undefined;

    // Act
    const result = Vector.rotateAbout(vector, angle, point, output);

    // Assert
    assertXY(result, 90.04242170542244, 176.7490871778713);
    expect(output).toEqual(undefined)
  });

  it('should not be able to rotate a valid vector about a point when the angle is undefined', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const point = Vector.create(93.3, 97.7);
    const angle = undefined;
    const output = {};

    // Act
    // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
    const result =  Vector.rotateAbout(vector, angle, point, output);

    // Assert
    assertXY(result, NaN, NaN);
    expect(output).toEqual(result)
  });

  it('should not be able to rotate a valid vector about an undefined point', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const point = undefined;
    const angle = 73.;
    const output = {};

    // Act
    // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
    const result = () => Vector.rotateAbout(vector, angle, point, output);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });

  it('should not be able to rotate about a point with an undefined vector', () => {
    // Arrange
    const vector = undefined;
    const point = Vector.create(93.3, 97.7);
    const angle = 73.;
    const output = {};

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.rotateAbout(vector, angle, output);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });
});

describe("Vector.normalise", () => {

  it('should be able to normalise a valid vector', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);

    // Act
    const result = Vector.normalise(vector);

    // Assert
    assertXY(result, 0.7492676158737221, 0.6622673476798538);
  });

  it('should be able to normalise a vector set to 0,0', () => {
    // Arrange
    const vector = Vector.create(0.,0.);

    // Act
    const result = Vector.normalise(vector);

    // Assert
    assertXY(result, 0., 0.);
  });

  it('should not be able to normalise an undefined vector', () => {
    // Arrange
    const vector = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.normalise(vector);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });
});

describe("Vector.dot", () => {
  it('should be able to dot two valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);

     // Act
     const result = Vector.dot(vectorA, vectorB);

     // Assert
     assertFloat(result, 7551.4400000000005);
  }); 

  it('should not be able to dot two undefined vectors', () => {
    // Arrange
    const vectorA = undefined;
    const vectorB = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.dot(vectorA, vectorB);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");

  }); 
});

describe("Vector.cross", () => {
  it('should be able to cross two valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);

     // Act
     const result = Vector.cross(vectorA, vectorB);

     // Assert
     assertFloat(result, 676.9100000000003);
  }); 

  it('should not be able to cross wit one undefined vector', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.cross(vectorA, vectorB);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'y')");

  }); 
});

describe("Vector.cross3", () => {
  it('should be able to cross3 three valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);
    const vectorC = Vector.create(16.1,14.9);

     // Act
     const result = Vector.cross3(vectorA, vectorB, vectorC);

     // Assert
     assertFloat(result, 452.3300000000004);
  }); 

  it('should not be able to cross3 where one vector is undefined', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = undefined;
    const vectorC = Vector.create(16.1,14.9);

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.cross3(vectorA, vectorB, vectorC);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");

  }); 
});

describe("Vector.add", () => {
  it('should be able to add valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);

    // Act
    const result = Vector.add(vectorA, vectorB);

    // Assert
    assertXY(result, 134.7, 135.1);
  }); 

  it('should not be able to add an undefined vector', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.add(vectorA, vectorB);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  }); 
});

describe("Vector.sub", () => {
  it('should be able to sub valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);

    // Act
    const result = Vector.sub(vectorA, vectorB);

    // Assert
    assertXY(result, -50.3, -60.5);
  }); 

  it('should not be able to sub with an undefined vector', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = undefined;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.sub(vectorA, vectorB);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  }); 
});

describe("Vector.mult", () => {
  it('should be able to mult valid vectors', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const scalar = 93.5;

    // Act
    const result = Vector.mult(vector, scalar);

    // Assert
    assertXY(result, 3945.7000000000003, 3487.5499999999997);
  }); 

  it('should not be able to mult with an undefined vector', () => {
    // Arrange
    const vector = undefined;
    const scalar = 93.5;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.mult(vector, scalar);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });

  it('should not be able to mult with an undefined scalar', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const scalar = undefined;

    // Act
    // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
    const result = Vector.mult(vector, scalar);
     
     // Assert
     assertXY(result, NaN, NaN);
  });
});

describe("Vector.div", () => {
  it('should be able to div valid vector', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const scalar = 93.5;

    // Act
    const result = Vector.div(vector, scalar);

    // Assert
    assertXY(result, 0.45133689839572194, 0.39893048128342246);
  }); 

  it('should not be able to div with an undefined vector', () => {
    // Arrange
    const vector = undefined;
    const scalar = 93.5;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.div(vector, scalar);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });

  it('should not be able to div with an undefined scalar', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const scalar = undefined;

    // Act
    // TODO: This causes the result to have NaN for x and y. This probaby should be fixed.
    const result = () => Vector.rotateAbout(vector, angle, point, output);
     
     // Assert
     assertXY(result, NaN, NaN);
  });

  it('should not be able to div with an zero scalar', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const scalar = 0.;

    // Act
    // TODO: This causes the result to have Infinity for x and y. This probaby should be fixed.
    const result = Vector.div(vector, scalar);
     
     // Assert
     assertXY(result, Infinity, Infinity);
  });
});

describe("Vector.perp", () => {
  it('should be able to perp valid vector with negate true', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const negate = true;

    // Act
    const result = Vector.perp(vector, negate);

    // Assert
    assertXY(result, 37.3, -42.2);
  });

  it('should be able to perp valid vector with negate false', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
    const negate = false;

    // Act
    const result = Vector.perp(vector, negate);

    // Assert
    assertXY(result, -37.3, 42.2);
  });

  it('should be able to perp undefined vector with negate true', () => {
    // Arrange
    const vector = undefined;
    const negate = true;

    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.perp(vector, negate);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'y')");
  });
});

describe("Vector.neg", () => {
  it('should be able to neg valid vector', () => {
    // Arrange
    const vector = Vector.create(42.2,37.3);
  
    // Act
    const result = Vector.neg(vector);

    // Assert
    assertXY(result, -42.2, -37.3);
  });

  it('should not be able to neg an undefined vector', () => {
    // Arrange
    const vector = undefined;
  
    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.neg(vector);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'x')");
  });
});

describe("Vector.angle", () => {
  it('should be able to get the angle between two valid vectors', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = Vector.create(92.5,97.8);
  
    // Act
    const result = Vector.angle(vectorA, vectorB);

    // Assert
    assertFloat(result, 0.8771971876156368);
  });

  it('should not be able to get the angle between one valid and one undefined vector', () => {
    // Arrange
    const vectorA = Vector.create(42.2,37.3);
    const vectorB = undefined;
  
    // Act
    // TODO: This causes a read from undefined. This should probably be fixed.
    const result = () => Vector.angle(vectorA, vectorB);

    // Assert
    expect(result).toThrow("Cannot read properties of undefined (reading 'y')");
  });
});