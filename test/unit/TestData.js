const Vector = require("../../src/geometry/Vector")

const testSquare = [
    { x: 1.,  y: 1., },
    { x: 3.,  y: 1., },
    { x: 3.,  y: 3., },
    { x: 1.,  y: 3., },
];

const testBodyPartsWithoutParent  = [
    {
        isSensor: true,
        isSleeping: true,
        isStatic: true,
        angle: 201.,
        anglePrev: 202.,
        angularSpeed: 203.,
        angularVelocity: 204.,
        area: 205.,
        axes: [{ x: 206., y: 207. }, { x: 208., y: 209. }],
        bounds: {min: { x: 210., y: 211., },max: { x: 212., y: 213., },},
        chamfer: [{x: 214., y: 215.},{x: 116., y: 217.}, ],
        circleRadius: 218.,
        collisionFilter: {category: 0x00DB, mask: 0x000000DC, group: 221},
        constraintImpulse: { x: 222., y: 223., angle: 224. },
        deltaTime: 225.,
        density: 226.,
        events: null,
        force: {x: 227., y: 228.},
        friction: 229.,
        frictionAir: 230.,
        frictionStatic: 231.,
        id: 232,
        inertia: 233.,
        inverseInertia: 234.,
        inverseMass: 235.,
        label: 'Body',
        mass: 236.,
        motion: 237.,
        parts: [],
        plugin: {},
        position: { x: 239., y: 240., },
        positionImpulse: { x: 241., y: 242. },
        positionPrev: { x: 243., y: 244., },
        render: {visible: false, opacity: 245, strokeStyle: '#def', fillStyle: 'rgba(2,4,6,0.2)', lineWidth: 247, sprite: { xScale: 248, yScale: 249, xOffset: 250, yOffset: 251 }},
        restitution: 252.,
        sleepThreshold: 253,
        slop: 254.,
        speed: 255.,
        timeScale: 256.,
        torque: 257.,
        totalContacts: 258.,
        type: 'body',
        velocity: { x: 259., y: 260., },
        vertices: [{ x: 261., y: 262., },{ x: 263., y: 264., },],
    },
        {
        isSensor: true,
        isSleeping: true,
        isStatic: true,
        angle: 301.,
        anglePrev: 302.,
        angularSpeed: 303.,
        angularVelocity: 304.,
        area: 305.,
        axes: [{ x: 306., y: 307. }, { x: 308., y: 309. }],
        bounds: {min: { x: 310., y: 311., },max: { x: 312., y: 313., },},
        chamfer: [{x: 314., y: 315.},{x: 316., y: 317.}, ],
        circleRadius: 318.,
        collisionFilter: {category: 0x013F, mask: 0x00000140, group: 321},
        constraintImpulse: { x: 322., y: 323., angle: 324. },
        deltaTime: 325.,
        density: 326.,
        events: null,
        force: {x: 327., y: 328.},
        friction: 329.,
        frictionAir: 330.,
        frictionStatic: 331.,
        id: 332,
        inertia: 333.,
        inverseInertia: 334.,
        inverseMass: 335.,
        label: 'Body',
        mass: 336.,
        motion: 337.,
        parts: [],
        plugin: {},
        position: { x: 339., y: 340., },
        positionImpulse: { x: 341., y: 342. },
        positionPrev: { x: 343., y: 344., },
        render: {visible: false, opacity: 345, strokeStyle: '#def', fillStyle: 'rgba(3,4,6,0.2)', lineWidth: 347, sprite: { xScale: 348, yScale: 349, xOffset: 350, yOffset: 351 }},
        restitution: 352.,
        sleepThreshold: 353,
        slop: 354.,
        speed: 355.,
        timeScale: 356.,
        torque: 357.,
        totalContacts: 358.,
        type: 'body',
        velocity: { x: 359., y: 360., },
        vertices: [{ x: 361., y: 362., },{ x: 363., y: 364., },],
    },
];

const testBodyWithoutParts = {
    isSensor: false,
    isSleeping: false,
    isStatic: false,
    angle: 101.,
    anglePrev: 102.,
    angularSpeed: 103.,
    angularVelocity: 104.,
    area: 105.,
    axes: [{ x: 106., y: 107. }, { x: 108., y: 109. }],
    bounds: { min: { x: 110., y: 111., }, max: { x: 112., y: 113, }, },
    chamfer: [{ x: 114., y: 115. }, { x: 116., y: 117. },],
    circleRadius: 118.,
    collisionFilter: { category: 0x0077, mask: 0x00000078, group: 121 },
    constraintImpulse: { x: 122., y: 123., angle: 124. },
    deltaTime: 125.,
    density: 126.,
    events: null,
    force: { x: 127., y: 128. },
    friction: 129.,
    frictionAir: 130.,
    frictionStatic: 131.,
    id: 132,
    inertia: 133.,
    inverseInertia: 134.,
    inverseMass: 135.,
    label: 'Body',
    mass: 136.,
    motion: 137.,
    parts: [],
    plugin: {},
    position: { x: 139., y: 140., },
    positionImpulse: { x: 141., y: 142. },
    positionPrev: { x: 143., y: 144., },
    render: { visible: false, opacity: 145, strokeStyle: '#abc', fillStyle: 'rgba(1,4,6,0.1)', lineWidth: 147, sprite: { xScale: 148, yScale: 149, xOffset: 150, yOffset: 151 } },
    restitution: 152.,
    sleepThreshold: 153,
    slop: 154.,
    speed: 155.,
    timeScale: 156.,
    torque: 157.,
    totalContacts: 158.,
    type: 'body',
    velocity: { x: 159., y: 160., },
    vertices: [{ x: 161., y: 162., }, { x: 163., y: 164., },],
    parts: [],
};

const GetTestBodyPartsWithParent = () => {
    let parts = [];
    parts.push(testBodyWithoutParts);
    parts.push(...testBodyPartsWithoutParent);
    return parts;
};

const testBodyPartsWithParent = GetTestBodyPartsWithParent();

const GetTestBodyWithParts = () => {
    const body = testBodyWithoutParts;
    body.parts.push(...testBodyPartsWithParent);
    return body;
};

const testBodyWithParts = GetTestBodyWithParts();

const testVerticesSqaureWithoutBody = [
    { x: 1., y: 1., index: 0, body: undefined, isInternal: false, },
    { x: 3., y: 1., index: 1, body: undefined, isInternal: false, },
    { x: 3., y: 3., index: 2, body: undefined, isInternal: false, },
    { x: 1., y: 3., index: 3, body: undefined, isInternal: false, },
];

const testVerticesNegAreaWithoutBody = [
    { x: 1., y: 1., index: 0, body: undefined, isInternal: false, },
    { x: 3., y: 1., index: 1, body: undefined, isInternal: false, },
    { x: -3., y: -3., index: 2, body: undefined, isInternal: false, },

];

const testVerticesAreaZeroWithoutBody = [
    { x: -1., y: -1., index: 0, body: undefined, isInternal: false, },
    { x: -3., y: -1., index: 1, body: undefined, isInternal: false, },
    { x: 3., y: 3., index: 2, body: undefined, isInternal: false, },
    { x: 1., y: 3., index: 3, body: undefined, isInternal: false, },
];

module.exports = {
    testSquare,
    testVerticesSqaureWithoutBody,
    testVerticesAreaZeroWithoutBody,
    testVerticesNegAreaWithoutBody,
    testBodyPartsWithParent,
    testBodyPartsWithoutParent,
    testBodyWithParts,
    testBodyWithoutParts,
};