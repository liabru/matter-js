const assertFloat = (result, expected) => {
    expect(Math.round(result * 100000)).toEqual(Math.round(expected * 100000));
}

const assertXY = (result, expectedX, expectedY) => {
    assertFloat(result.x, expectedX);
    assertFloat(result.y, expectedY);
}

const assertBounds = (result, expectedMinX, expectedMinY, expectedMaxX, expectedMaxY) => {
    assertFloat(result.min.x, expectedMinX);
    assertFloat(result.min.y, expectedMinY);
    assertFloat(result.max.x, expectedMaxX);
    assertFloat(result.max.y, expectedMaxY);
}

module.exports = {
    assertFloat, assertXY, assertBounds
};