/* eslint-env es6 */
"use strict";

jest.setTimeout(120 * 1000);

const puppeteer = require('puppeteer-core');
const Example = require('../examples/index');
const MatterBuild = require('../build/matter');
const { versionSatisfies } = require('../src/core/Plugin');
const fs = require('fs'); 

const examples = Object.keys(Example).filter(key => {
  const buildVersion = MatterBuild.version;
  const exampleFor = Example[key].for;
  return versionSatisfies(buildVersion, exampleFor);
});

const browserPath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome';
const demoPagePath = 'http://localhost:8000/';
const totalUpdates = 5;

if (!fs.existsSync(browserPath)) {
  // Skip if browser is missing 
  console.warn('Could not find browser. Browser tests skipped.');
  describe.skip('Browser integration tests');
} else {
  describe('Browser integration tests', () => {
    let results;

    // Set up the environment and run examples
    beforeAll(async () => results = await runExamplesBrowser(totalUpdates));

    it('all examples run without throwing error or warning', () => {
      if (results.error) {
        console.error(results.error);
        expect(Boolean(results.error)).toBe(false);
      }
      if (results.warns) {
        console.error(results.warns);
        expect(results.warns.size).toBe(0);
      }
      if (!results.error && !results.warns) {
        for (const example of examples) {
          expect(results[example].id).toBe(example);
          expect(results[example].timestamp).toBeGreaterThan(0);
        }
      }
    });
  });
}

const runExamplesBrowser = async updates => {
  // Set up browser environment
  const browser = await puppeteer.launch({ executablePath: browserPath });
  const page = await browser.newPage();
  const results = {};
  let example;

  // Load local demo page and catch errors
  let pageError;
  let pageWarns;

  const onPageError = error => pageError = error;
  const onPageConsole = async message => {
    const type = message.type();
    if (example && type === 'error' || type === 'warning') {
      const log = `[${example}] ${message.type()} ${message.text()}`;
      pageWarns = pageWarns || new Set();
      pageWarns.add(log);
    }
  }

  page.addListener('pageerror', onPageError);
  page.addListener('console', onPageConsole);

  await page.goto(demoPagePath).catch(onPageError);

  // For every example
  for (example of examples) {
    // Bail on error
    if (pageError) {
      break;
    }

    // In the demo page context
    results[example] = await page.evaluate(async (example, updates) => {
      // Set the current example
      MatterTools.Demo.setExampleById(MatterDemo, example);
      const instance = MatterDemo.example.instance;
      let ticks = 0;

      // Wait while running
      await new Promise((resolve) => {
        Matter.Events.on(instance.runner, 'tick', () => {
          // Stop after enough updates
          if (ticks >= updates) {
            Matter.Runner.stop(instance.runner);
            resolve();
          }
          ticks += 1;
        });
      });

      // Return results
      return {
        id: MatterDemo.example.id,
        timestamp: instance.engine.timing.timestamp
      };
    }, example, updates);
  }

  // Tear down
  await browser.close();

  results.error = pageError;
  results.warns = pageWarns;
  return results;
};
