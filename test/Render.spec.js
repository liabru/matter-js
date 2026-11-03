"use strict";

const Render = require('../src/render/Render');
const Constraint = require('../src/constraint/Constraint');
const Bodies = require('../src/factory/Bodies');

function createContext() {
    return {
        beginPath: jest.fn(),
        closePath: jest.fn(),
        arc: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn()
    };
}

describe('Render.constraints', () => {
    test('draws both anchors of a pin constraint', () => {
        const context = createContext();
        const constraint = Constraint.create({
            pointA: { x: 10, y: 20 },
            pointB: { x: 30, y: 40 },
            render: { type: 'pin', anchors: true }
        });

        Render.constraints([constraint], context);

        expect(context.arc.mock.calls.map(call => call.slice(0, 2))).toEqual([
            [10, 20], [10, 20], [30, 40]
        ]);
    });

    test('translates pin anchors attached to bodies', () => {
        const context = createContext();
        const constraint = Constraint.create({
            bodyA: Bodies.rectangle(10, 20, 5, 5),
            bodyB: Bodies.rectangle(30, 40, 5, 5),
            pointA: { x: 1, y: 2 },
            pointB: { x: 3, y: 4 },
            render: { type: 'pin', anchors: true }
        });

        Render.constraints([constraint], context);

        expect(context.arc.mock.calls.map(call => call.slice(0, 2))).toEqual([
            [11, 22], [11, 22], [33, 44]
        ]);
    });

    test('does not reuse the previous constraint endpoint for a pin anchor', () => {
        const context = createContext();
        const line = Constraint.create({
            pointA: { x: 0, y: 0 },
            pointB: { x: 100, y: 200 },
            render: { type: 'line', anchors: false }
        });
        const pin = Constraint.create({
            pointA: { x: 10, y: 20 },
            pointB: { x: 30, y: 40 },
            render: { type: 'pin', anchors: true }
        });

        Render.constraints([line, pin], context);

        expect(context.arc).toHaveBeenLastCalledWith(30, 40, 3, 0, 2 * Math.PI);
    });
});
