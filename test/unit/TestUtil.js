const assertFloat = (result, expected) => {
    expect(Math.round(result*100000)).toEqual(Math.round(expected*100000))
}

const assertXY = (result, expectedX, expectedY) => {
    assertFloat(result.x, expectedX)
    assertFloat(result.y, expectedY)
}

module.exports = {
    assertFloat, assertXY
};