/* eslint-env es6 */
"use strict";

jest.setTimeout(120 * 1000);

const puppeteer = require('puppeteer-core');
const Example = require('../examples/index');
const fs = require('fs'); 

const examples = Object.keys(Example);
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

    it('all examples run without throwing error', () => {
      if (results.error) {
        console.error(results.error);
        expect(!results.error).toBe(true);
      } else {
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

  // Load local demo page and catch errors
  let pageError;
  const onPageError = error => pageError = error;
  page.addListener('pageerror', onPageError);
  await page.goto(demoPagePath).catch(onPageError);

  // For every example
  for (const example of examples) {
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

  return pageError ? { error: pageError } : results;
};
