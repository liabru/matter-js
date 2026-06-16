/* eslint-env es6, jest */
"use strict";

// Unit tests for the resting-body fast path in Matter.Engine: static and
// sleeping bodies are skipped by the per-step velocity and force passes, and
// their cached velocity is zeroed at the moment they come to rest so the skip
// is not observable. Requires the source modules directly (no build step).
const Engine = require('../src/core/Engine');
const Body = require('../src/body/Body');
const Bodies = require('../src/factory/Bodies');
const Composite = require('../src/body/Composite');
const Sleeping = require('../src/core/Sleeping');

const DELTA = 1000 / 60;

describe('Engine resting-body passes', () => {
    test('a static body keeps zero velocity and does not move during a step', () => {
        const engine = Engine.create();
        engine.gravity.y = 1;
        const body = Bodies.rectangle(0, 0, 50, 50, { isStatic: true });
        Composite.add(engine.world, body);

        Engine.update(engine, DELTA);

        expect(body.velocity).toEqual({ x: 0, y: 0 });
        expect(body.speed).toBe(0);
        expect(body.position).toEqual({ x: 0, y: 0 });
    });

    test('setStatic zeroes the cached velocity of a moving body immediately', () => {
        const engine = Engine.create();
        const body = Bodies.rectangle(0, 0, 50, 50);
        Composite.add(engine.world, body);
        Body.setVelocity(body, { x: 5, y: -3 });

        Body.setStatic(body, true);

        expect(body.velocity).toEqual({ x: 0, y: 0 });
        expect(body.speed).toBe(0);

        Engine.update(engine, DELTA);
        expect(body.velocity).toEqual({ x: 0, y: 0 });
    });

    test('a sleeping body keeps zero velocity across a step', () => {
        const engine = Engine.create({ enableSleeping: true });
        const body = Bodies.rectangle(0, 0, 50, 50);
        Composite.add(engine.world, body);
        Body.setVelocity(body, { x: 4, y: 2 });

        Sleeping.set(body, true);
        expect(body.velocity).toEqual({ x: 0, y: 0 });

        Engine.update(engine, DELTA);
        expect(body.isSleeping).toBe(true);
        expect(body.velocity).toEqual({ x: 0, y: 0 });
    });

    test('a dynamic body still integrates and updates its velocity each step', () => {
        const engine = Engine.create();
        engine.gravity.y = 1;
        const body = Bodies.rectangle(0, 0, 50, 50);
        Composite.add(engine.world, body);

        Engine.update(engine, DELTA);

        // gravity is integrated, so the body falls and gains downward velocity
        expect(body.position.y).toBeGreaterThan(0);
        expect(body.velocity.y).toBeGreaterThan(0);
    });

    test('a force applied to a dynamic body is still cleared after the step', () => {
        const engine = Engine.create();
        const body = Bodies.rectangle(0, 0, 50, 50);
        Composite.add(engine.world, body);

        Body.applyForce(body, body.position, { x: 0.05, y: 0 });
        expect(body.force.x).toBeCloseTo(0.05);

        Engine.update(engine, DELTA);
        expect(body.force).toEqual({ x: 0, y: 0 });
    });

    test('a static body still has its force buffer cleared each step', () => {
        // the velocity pass is skipped for resting bodies, but the force pass is
        // not: a static body must still be cleared so a stale force cannot wake a
        // neighbour through Sleeping.update or detonate if it is later un-static'd
        const engine = Engine.create();
        const body = Bodies.rectangle(0, 0, 50, 50, { isStatic: true });
        Composite.add(engine.world, body);

        Body.applyForce(body, body.position, { x: 10, y: 10 });
        Engine.update(engine, DELTA);

        expect(body.force).toEqual({ x: 0, y: 0 });
    });
});
