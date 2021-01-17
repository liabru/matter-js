## ▲.● matter.js `0.16.0`

Release notes for `0.16.0`. See the release [readme](https://github.com/liabru/matter-js/blob/0.16.0/README.md) for further information.

### Highlights ✺

- Changed external require method for `poly-decomp` ([882e07c](https://github.com/liabru/matter-js/commit/882e07c))
- Improved `Bodies.fromVertices` decomposition quality using `removeDuplicatePoints` ([#639](https://github.com/liabru/matter-js/pull/639))
- Added support for `>x.x.x` and `>=x.x.x` semver ranges in plugins ([0792716](https://github.com/liabru/matter-js/commit/0792716))
- Changed demo example select background colour for Windows ([matter-tools #5](https://github.com/liabru/matter-tools/pull/5))
- Updated demo to use latest [matter-tools](https://github.com/liabru/matter-tools) ([#33e8fe8](https://github.com/liabru/matter-js/commit/33e8fe8))
- Updated SVG and terrain examples to use `fetch` ([5551cd5](https://github.com/liabru/matter-js/commit/5551cd5))

### Changes ✲

See the release [compare page](https://github.com/liabru/matter-js/compare/0.15.0...0.16.0) and the [changelog](https://github.com/liabru/matter-js/blob/0.16.0/CHANGELOG.md) for a detailed list of changes.

### Comparison ⎄

Differences in behaviour, quality and performance against the previous release `0.15.0`. For more information see [comparison method](https://github.com/liabru/matter-js/pull/794).

```ocaml
Output comparison of 41 examples against matter-js@0.15.0 build on last run  

Similarity  100%  Performance  +0.00%  Overlap  +0.00%  

airFriction · · avalanche · · ballPool · · bridge · · broadphase · · car · · 
catapult · · chains · · circleStack · · cloth · · collisionFiltering · · 
compositeManipulation · · compound · · compoundStack · · concave · · constraints · · 
doublePendulum · · events · · friction · · gravity · · gyro · · 
manipulation · · mixed · · newtonsCradle · · pyramid · · ragdoll · · 
raycasting · · restitution · · rounded · · sensors · · sleeping · · 
slingshot · · softBody · · sprites · · stack · · staticFriction · · 
stress · · stress2 · · timescale · · views · · wreckingBall · · 
  
where  · no change  ● extrinsics changed  ◆ intrinsics changed
    
```

### Contributors ♥︎

Many thanks to the [contributors](https://github.com/liabru/matter-js/compare/0.15.0...0.16.0) of this release, [past contributors](https://github.com/liabru/matter-js/graphs/contributors) as well those involved in the [community](https://github.com/liabru/matter-js/issues) for your input and support.

---

## ▲.● matter.js `0.15.0`

Release notes for `0.15.0`. See the release [readme](https://github.com/liabru/matter-js/blob/0.15.0/README.md) for further information.

### Highlights ✺

- __Optimised performance up to ~30% boost vs. `0.14.2`__ ([#528](https://github.com/liabru/matter-js/pull/528)) ([#522](https://github.com/liabru/matter-js/pull/522)) ([#553](https://github.com/liabru/matter-js/pull/553))
- Added `Body.setCentre` ([2ec247b](https://github.com/liabru/matter-js/commit/2ec247b))
- Added `Constraint.pointAWorld` and `Constraint.pointBWorld` ([3c32969](https://github.com/liabru/matter-js/commit/3c32969))
- Changed default colour scheme ([d258411](https://github.com/liabru/matter-js/commit/d258411)) ([6dd5ec5](https://github.com/liabru/matter-js/commit/6dd5ec5))
- Fixed issues with decomp require ([0af1645](https://github.com/liabru/matter-js/commit/0af1645))
- Fixed issues with render pixel ratio ([d577477](https://github.com/liabru/matter-js/commit/d577477))

### Changes ✲

See the release [compare page](https://github.com/liabru/matter-js/compare/0.14.2...0.15.0) and the [changelog](https://github.com/liabru/matter-js/blob/0.15.0/CHANGELOG.md) for a detailed list of all changes.

### Comparison ⎄

Differences in behaviour, quality and performance against the previous release `0.14.2`. For more information see [comparison method](https://github.com/liabru/matter-js/pull/794).

```ocaml
Output comparison of 41 examples against matter-js@0.14.2 build on last run  

Similarity  100%  Performance  +33.6%  Overlap  +0.00%  

airFriction · · avalanche · · ballPool · · bridge · · broadphase · · car · · 
catapult · · chains · · circleStack · · cloth · · collisionFiltering · · 
compositeManipulation · · compound · · compoundStack · · concave · · constraints · · 
doublePendulum · · events · · friction · · gravity · · gyro · · 
manipulation · · mixed · · newtonsCradle · · pyramid · · ragdoll · · 
raycasting · · restitution · · rounded · · sensors · · sleeping · · 
slingshot · · softBody · · sprites · · stack · · staticFriction · · 
stress · · stress2 · · timescale · · views · · wreckingBall · · 
  
where  · no change  ● extrinsics changed  ◆ intrinsics changed
    
```

### Contributors ♥︎

Many thanks to the [contributors](https://github.com/liabru/matter-js/compare/0.14.2...0.15.0) of this release, [past contributors](https://github.com/liabru/matter-js/graphs/contributors) as well those involved in the [community](https://github.com/liabru/matter-js/issues) for your input and support.
