const assertFloat = (result, expected) => {
    expect(Math.round(result * 100000), 'Assert float\n\tExpected: ' + expected + '\n\tReceived: ' + result + '\n\nIn order to test float values, the values have been multiplied by 100000 in official result below.').toEqual(Math.round(expected * 100000));
};

const assertXY = (result, expectedX, expectedY) => {
    assertFloat(result.x, expectedX);
    assertFloat(result.y, expectedY);
};

const assertBounds = (result, expectedMinX, expectedMinY, expectedMaxX, expectedMaxY) => {
    assertFloat(result.min.x, expectedMinX);
    assertFloat(result.min.y, expectedMinY);
    assertFloat(result.max.x, expectedMaxX);
    assertFloat(result.max.y, expectedMaxY);
};

const assertVertex = (result, expextedId, expectedX, expectedY, expectedIndex, expectedIsInternal) => {
    expect(result.body.id).toEqual(expextedId);
    assertFloat(result.x, expectedX);
    assertFloat(result.y, expectedY);
    expect(result.index).toEqual(expectedIndex);
    expect(result.isInternal).toEqual(expectedIsInternal);
};

module.exports = {
    assertFloat,
    assertXY,
    assertBounds,
    assertVertex,
};