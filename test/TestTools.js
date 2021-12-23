/* eslint-env es6 */
"use strict";

const fs = require('fs');
const compactStringify = require('json-stringify-pretty-compact');

const comparePath = './test/__compare__';
const compareCommand = 'open http://localhost:8000/?compare';
const diffSaveCommand = 'npm run test-save';
const diffCommand = 'code -n -d test/__compare__/examples-build.json test/__compare__/examples-dev.json';
const equalityThreshold = 0.99999;
const colors = { Red: 31, Green: 32, Yellow: 33, White: 37, BrightWhite: 90, BrightCyan: 36 };

const comparisonReport = (capturesDev, capturesBuild, devSize, buildSize, buildVersion, save) => {
    const performanceDev = capturePerformanceTotals(capturesDev);
    const performanceBuild = capturePerformanceTotals(capturesBuild);

    const perfChange = noiseThreshold(1 - (performanceDev.duration / performanceBuild.duration), 0.01);
    const memoryChange = noiseThreshold((performanceDev.memory / performanceBuild.memory) - 1, 0.01);
    const overlapChange = (performanceDev.overlap / (performanceBuild.overlap || 1)) - 1;
    const filesizeChange = (devSize / buildSize) - 1;

    const behaviourSimilaritys = extrinsicSimilarity(capturesDev, capturesBuild, 'behaviourExtrinsic');
    const behaviourSimilarityAverage = extrinsicSimilarityAverage(behaviourSimilaritys);
    const behaviourSimilarityEntries = Object.entries(behaviourSimilaritys);
    behaviourSimilarityEntries.sort((a, b) => a[1] - b[1]);

    const similaritys = extrinsicSimilarity(capturesDev, capturesBuild, 'similarityExtrinsic');
    const similarityAverage = extrinsicSimilarityAverage(similaritys);

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
        [`Output comparison of ${behaviourSimilarityEntries.length}`,
         `examples against previous release ${format('matter-js@' + buildVersion, colors.Yellow)}`
        ].join(' '),

        `\n\n${format('Behaviour  ', colors.White)}`,
        `${format(formatPercent(behaviourSimilarityAverage), behaviourSimilarityAverage === 1 ? colors.Green : colors.Yellow)}%`,

        ` ${format('Similarity', colors.White)}`,
        `${format(formatPercent(similarityAverage), similarityAverage === 1 ? colors.Green : colors.Yellow)}%`,

        ` ${format('Overlap', colors.White)}`,
        ` ${format((overlapChange >= 0 ? '+' : '-') + formatPercent(overlapChange, true), overlapChange <= 0 ? colors.Green : colors.Yellow)}%`,

        `\n${format('Performance', colors.White)}`,
        `${format((perfChange >= 0 ? '+' : '-') + formatPercent(perfChange, true), perfChange >= 0 ? colors.Green : colors.Yellow)}%`,

        ` ${format('Memory', colors.White)}`,
        `    ${format((memoryChange >= 0 ? '+' : '-') + formatPercent(memoryChange, true), memoryChange <= 0 ? colors.Green : colors.Yellow)}%`,

        ` ${format('Filesize', colors.White)}`,
        `${format((filesizeChange >= 0 ? '+' : '-') + formatPercent(filesizeChange, true), filesizeChange <= 0 ? colors.Green : colors.Yellow)}%`,
        `${format(`${(devSize / 1024).toPrecision(4)} KB`, colors.White)}`,

        captureSummary.reduce((output, p, i) => {
            output += `${p.name} `;
            output += `${similarityRatings(behaviourSimilaritys[p.name])} `;
            output += `${changeRatings(capturesDev[p.name].changedIntrinsics)} `;
            if (i > 0 && i < captureSummary.length && breakEvery > 0 && i % breakEvery === 0) {
                output += '\n';
            }
            return output;
        }, '\n\n'),

        `\n\nwhere  · no change  ● extrinsics changed  ◆ intrinsics changed\n`,

        behaviourSimilarityAverage < 1 ? `\n${format('▶', colors.White)} ${format(compareCommand + '=' + 150 + '#' + behaviourSimilarityEntries[0][0], colors.BrightCyan)}` : '',
        intrinsicChangeCount > 0 ? `\n${format('▶', colors.White)} ${format((save ? diffCommand : diffSaveCommand), colors.BrightCyan)}` : ''
    ].join('  ');

    if (save) {
        writeResult('examples-dev', devIntrinsicsChanged);
        writeResult('examples-build', buildIntrinsicsChanged);
        writeResult('examples-report', report(5, s => s));
    }

    return report(5, color);
};

const similarity = (a, b) => {
    const distance = Math.sqrt(a.reduce(
        (sum, _val, i) => sum + Math.pow((a[i] || 0) - (b[i] || 0), 2), 0)
    );
    return 1 / (1 + (distance / a.length));
};

const similarityRatings = similarity => similarity < equalityThreshold ? color('●', colors.Yellow) : '·';
const changeRatings = isChanged => isChanged ? color('◆', colors.White) : '·';
const color = (text, number) => number ? `\x1b[${number}m${text}\x1b[0m` : text;
const formatPercent = (val, abs) => (100 * (abs ? Math.abs(val) : val)).toFixed(2);

const noiseThreshold = (val, threshold) => {
    const sign = val < 0 ? -1 : 1;
    const magnitude = Math.abs(val);
    return sign * Math.max(0, magnitude - threshold) / (1 - threshold);
};

const equals = (a, b) => {
    try {
        expect(a).toEqual(b);
    } catch (e) {
        return false;
    }
    return true;
};

const capturePerformanceTotals = (captures) => {
    const totals = {
        duration: 0,
        overlap: 0,
        memory: 0
    };

    for (const [ name ] of Object.entries(captures)) {
        totals.duration += captures[name].duration;
        totals.overlap += captures[name].overlap;
        totals.memory += captures[name].memory;
    };

    return totals;
};

const extrinsicSimilarity = (currentCaptures, referenceCaptures, key) => {
    const result = {};

    Object.entries(currentCaptures).forEach(([name, current]) => {
        const reference = referenceCaptures[name];
        const worldVector = [];
        const worldVectorRef = [];
        const currentExtrinsic = current[key];
        const referenceExtrinsic = reference[key];

        Object.keys(currentExtrinsic).forEach(objectType => {
            Object.keys(currentExtrinsic[objectType]).forEach(objectId => {
                worldVector.push(...currentExtrinsic[objectType][objectId]);
                worldVectorRef.push(...referenceExtrinsic[objectType][objectId]);
            });
        });

        result[name] = similarity(worldVector, worldVectorRef);
    });

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
    requireUncached, comparisonReport, logReport,
    serialize, toMatchExtrinsics, toMatchIntrinsics
};