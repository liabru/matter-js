/* eslint-env es6 */
"use strict";

const fs = require('fs');
const compactStringify = require('json-stringify-pretty-compact');

const comparePath = './test/__compare__';
const compareCommand = 'open http://localhost:8000/?compare';
const diffSaveCommand = 'npm run test-save';
const diffCommand = 'code -n -d test/__compare__/examples-build.json test/__compare__/examples-dev.json';
const equalityThreshold = 1;
const colors = { Red: 31, Green: 32, Yellow: 33, White: 37, BrightWhite: 90, BrightCyan: 36 };

const comparisonReport = (capturesDev, capturesBuild, devSize, buildSize, buildVersion, save, benchmark) => {
    const {
        durationChange,
        memoryChange,
        overlapChange
    } = captureBenchmark(capturesDev, capturesBuild);

    const filesizeChange = (devSize / buildSize) - 1;

    const firstCapture = Object.entries(capturesDev)[0][1];
    const updates = firstCapture.extrinsic.updates;

    const similaritys = extrinsicSimilarity(capturesDev, capturesBuild);
    const similarityAverage = extrinsicSimilarityAverage(similaritys);
    const similarityAveragePerUpdate = Math.pow(1, -1 / updates) * Math.pow(similarityAverage, 1 / updates);
    const similarityEntries = Object.entries(similaritys);
    similarityEntries.sort((a, b) => a[1] - b[1]);

    const devIntrinsicsChanged = {};
    const buildIntrinsicsChanged = {};
    let intrinsicChangeCount = 0;

    const captureSummary = Object.entries(capturesDev)
        .map(([name]) => {
            const changedIntrinsics = !equals(capturesDev[name].intrinsic, capturesBuild[name].intrinsic);

            if (changedIntrinsics) {
                capturesDev[name].changedIntrinsics = true;
                if (intrinsicChangeCount < 1) {
                    devIntrinsicsChanged[name] = capturesDev[name].state;
                    buildIntrinsicsChanged[name] = capturesBuild[name].state;
                    intrinsicChangeCount += 1;
                }
            }
            
            return { name };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    const report = (breakEvery, format) => [
        [`Output sample comparison estimates of ${similarityEntries.length} examples`,
         `against previous release ${format('matter-js@' + buildVersion, colors.Yellow)}:`
        ].join(' '),

        `\n\n${format(`Similarity`, colors.White)}  `,
        `${format(formatPercent(similarityAveragePerUpdate, false, true), formatColor(similarityAveragePerUpdate === 1))}% `,

        ` ${format('Overlap', colors.White)}`,
        ` ${format(formatPercent(overlapChange), formatColor(overlapChange <= 0))}%`,

        ` ${format('Filesize', colors.White)}`,
        `${format(formatPercent(filesizeChange), formatColor(filesizeChange <= 0))}%`,
        `${format(`${(devSize / 1024).toPrecision(4)} KB`, colors.White)}`,

        ...(benchmark ? [
            `\n${format('Performance', colors.White)}`,
            ` ${format(formatPercent(durationChange), formatColor(durationChange >= 0))}%`,
    
            `  ${format('Memory', colors.White)} `,
            ` ${format(formatPercent(memoryChange), formatColor(memoryChange <= 0))}%`,
        ] : []),

        captureSummary.reduce((output, p, i) => {
            output += `${p.name} `;
            output += `${similarityRatings(similaritys[p.name])} `;
            output += `${changeRatings(capturesDev[p.name].changedIntrinsics)} `;
            if (i > 0 && i < captureSummary.length && breakEvery > 0 && i % breakEvery === 0) {
                output += '\n';
            }
            return output;
        }, '\n\n'),

        `\n\nwhere for the sample  · no change detected  ● extrinsics changed  ◆ intrinsics changed\n`,

        similarityAverage < 1 ? `\n${format('▶', colors.White)} ${format(compareCommand + '=' + 150 + '#' + similarityEntries[0][0], colors.BrightCyan)}` : '',
        intrinsicChangeCount > 0 ? `\n${format('▶', colors.White)} ${format((save ? diffCommand : diffSaveCommand), colors.BrightCyan)}` : ''
    ].join('  ');

    if (save) {
        writeResult('examples-dev', devIntrinsicsChanged);
        writeResult('examples-build', buildIntrinsicsChanged);
        writeResult('examples-report', report(5, s => s));
    }

    return report(5, color);
};

const similarityRatings = similarity => similarity < equalityThreshold ? color('●', colors.Yellow) : '·';

const changeRatings = isChanged => isChanged ? color('◆', colors.White) : '·';

const color = (text, number) => number ? `\x1b[${number}m${text}\x1b[0m` : text;

const formatColor = isGreen => isGreen ? colors.Green : colors.Yellow;

const formatPercent = (val, showSign=true, showFractional=false, padStart=6) => {
    let fractionalSign = '';

    if (showFractional && val > 0.9999 && val < 1) {
        val = 0.9999;
        fractionalSign = '>';
    } else if (showFractional && val > 0 && val < 0.0001) {
        val = 0.0001;
        fractionalSign = '<';
    }

    const percentFixed = Math.abs(100 * val).toFixed(2);
    const sign = parseFloat((100 * val).toFixed(2)) >= 0 ? '+' : '-';
    return ((showFractional ? fractionalSign : '') + (showSign ? sign : '') + percentFixed).padStart(padStart, ' ');
};

const noiseThreshold = (val, threshold) => {
    const sign = val < 0 ? -1 : 1;
    const magnitude = Math.abs(val);
    return sign * Math.max(0, magnitude - threshold) / (1 - threshold);
};

const median = (values, lower, upper) => {
    const valuesSorted = values.slice(0).sort();

    return mean(valuesSorted.slice(
        Math.floor(valuesSorted.length * lower), 
        Math.floor(valuesSorted.length * upper)
    ));
};

const mean = (values) => {
    const valuesLength = values.length;
    let result = 0;

    for (let i = 0; i < valuesLength; i += 1) {
        result += values[i];
    }

    return (result / valuesLength) || 0;
};

const smoothExp = (last, current) => {
    const delta = current - last;
    const sign = delta < 0 ? -1 : 1;
    const magnitude = Math.abs(delta);

    if (magnitude < 1) {
        return last + 0.01 * delta;
    }

    return last + Math.sqrt(magnitude) * sign;
};

const equals = (a, b) => {
    try {
        expect(a).toEqual(b);
    } catch (e) {
        return false;
    }
    return true;
};

const captureBenchmark = (capturesDev, capturesBuild) => {
    const overlapChanges = [];

    let durationDev = 0;
    let durationBuild = 0;
    let memoryDev = 0;
    let memoryBuild = 0;

    for (const name in capturesDev) {
        durationDev += capturesDev[name].duration;
        durationBuild += capturesBuild[name].duration;

        memoryDev += capturesDev[name].memory;
        memoryBuild += capturesBuild[name].memory;

        if (capturesBuild[name].overlap > 0.1 && capturesDev[name].overlap > 0.1){
            overlapChanges.push(capturesDev[name].overlap / capturesBuild[name].overlap);
        }
    };

    const durationChange = 1 - noiseThreshold(durationDev / durationBuild, 0.02);
    const memoryChange = noiseThreshold(memoryDev / memoryBuild, 0.02) - 1;
    const overlapChange = noiseThreshold(median(overlapChanges, 0.45, 0.55), 0.001) - 1;

    return {
        durationChange, 
        memoryChange, 
        overlapChange
    };
};

const extrinsicSimilarity = (currentCaptures, referenceCaptures, key='extrinsic') => {
    const result = {};
    const zeroVector = { x: 0, y: 0 };

    for (const name in currentCaptures) {
        const currentExtrinsic = currentCaptures[name][key];
        const referenceExtrinsic = referenceCaptures[name][key];

        let totalCount = 0;
        let totalSimilarity = 0;

        for (const objectType in currentExtrinsic) {
            for (const objectId in currentExtrinsic[objectType]) {
                const currentObject = currentExtrinsic[objectType][objectId];
                const referenceObject = referenceExtrinsic[objectType][objectId];

                for (let i = 0; i < currentObject.vertices.length; i += 1) {
                    const currentPosition = currentObject.position;
                    const currentVertex = currentObject.vertices[i];
                    const referenceVertex = referenceObject.vertices[i] ? referenceObject.vertices[i] : zeroVector;

                    const radius = Math.sqrt(
                        Math.pow(currentVertex.x - currentPosition.x, 2)
                        + Math.pow(currentVertex.y - currentPosition.y, 2)
                    );

                    const distance = Math.sqrt(
                        Math.pow(currentVertex.x - referenceVertex.x, 2)
                        + Math.pow(currentVertex.y - referenceVertex.y, 2)
                    );

                    totalSimilarity += Math.min(1, distance / (2 * radius)) / currentObject.vertices.length;
                }

                totalCount += 1;
            }
        }

        result[name] = 1 - (totalSimilarity / totalCount);
    }

    return result;
};

const extrinsicSimilarityAverage = (similaritys) => {
    const entries = Object.entries(similaritys);
    let average = 0;

    entries.forEach(([_, similarity]) => average += similarity);

    return average /= entries.length;
};

const serialize = (obj, exclude=()=>false, precision=4, path='$', visited=[], paths=[]) => {
    if (typeof obj === 'number') {
        return parseFloat(obj.toPrecision(precision));
    } else if (typeof obj === 'string' || typeof obj === 'boolean') {
        return obj;
    } else if (obj === null) {
        return 'null';
    } else if (typeof obj === 'undefined') {
        return 'undefined';
    } else if (obj === Infinity) {
        return 'Infinity';
    } else if (obj === -Infinity) {
        return '-Infinity';
    } else if (typeof obj === 'function') {
        return 'function';
    } else if (Array.isArray(obj)) {
        return obj.map(
            (item, index) => serialize(item, exclude, precision, path + '.' + index, visited, paths)
        );
    }
  
    const visitedIndex = visited.indexOf(obj);
  
    if (visitedIndex !== -1) {
      return paths[visitedIndex];
    }
  
    visited.push(obj);
    paths.push(path);
  
    const result = {};
  
    for (const key of Object.keys(obj).sort()) {
      if (!exclude(key, obj[key], path + '.' + key)) {
        result[key] = serialize(obj[key], exclude, precision, path + '.' + key, visited, paths);
      }
    }
  
    return result;
};

const writeResult = (name, obj) => {
    try {
        fs.mkdirSync(comparePath, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    if (typeof obj === 'string') {
        fs.writeFileSync(`${comparePath}/${name}.md`, obj, 'utf8');
    } else {
        fs.writeFileSync(`${comparePath}/${name}.json`, compactStringify(obj, { maxLength: 100 }), 'utf8');
    }
};

const logReport = (captures, version) => {
    let report = '';

    for (const capture of Object.values(captures)) {
        if (!capture.logs.length) {
            continue;
        }

        report += `  ${capture.name}\n`;

        for (const log of capture.logs) {
            report += `    ${log}\n`;
        }
    }

    return `Output logs from ${color(version, colors.Yellow)} build on last run\n\n` 
        + (report ? report : '  None\n');
};

const requireUncached = path => {
    delete require.cache[require.resolve(path)];
    const module = require(path);
    delete require.cache[require.resolve(path)];
    return module;
};

const getArg = (name, defaultValue=null, parser=(v) => v) => {
    const value = process.argv.find(arg => arg.startsWith(`--${name}=`));
    return value ? parser(value.split('=')[1]) : defaultValue;
};

const toMatchExtrinsics = {
    toMatchExtrinsics(received, value) {
        const similaritys = extrinsicSimilarity(received, value, 'extrinsic');
        const pass = Object.values(similaritys).every(similarity => similarity >= equalityThreshold);

        return {
            message: () => 'Expected positions and velocities to match between builds.',
            pass
        };
    }
};

const toMatchIntrinsics = {
    toMatchIntrinsics(currentCaptures, referenceCaptures) {
        const entries = Object.entries(currentCaptures);
        let changed = false;

        entries.forEach(([name, current]) => {
            const reference = referenceCaptures[name];
            if (!this.equals(current.intrinsic, reference.intrinsic)) {
                changed = true;
            }
        });

        return {
            message: () => 'Expected intrinsic properties to match between builds.',
            pass: !changed
        };
    }
};

module.exports = {
    requireUncached, comparisonReport, logReport, getArg, smoothExp,
    serialize, toMatchExtrinsics, toMatchIntrinsics
};