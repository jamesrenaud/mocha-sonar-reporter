// mocha-sonar-reporter.js
'use strict';

import { Runner, Suite, Test, reporters } from 'mocha';

/*
    TO DO:
        On start, open testExecutions
        On end, close testExecutions

        On suite end, just iterate everything in the suite and spit it out
        Doing it test by test doesn't seem to be playing nice with how Mocha reports the test done
        we're better off just iterating the suite when its done
*/

export class SonarReporter {
    private indents: number = 0;
    constructor(runner: Runner) {
        reporters.Base.call(this, runner);

        runner
            .once('start', () => {
                this.write(`<testExecutions version="1">`);
                ++this.indents;
            })
            .on('suite', (suite: Suite) => {
                if (suite.tests.length > 0) {
                    this.write(`<file path="${suite.file}">`);
                    ++this.indents;
                }
            })
            .on('suite end', (suite: Suite) => {
                if (suite.tests.length > 0) {
                    --this.indents;
                    this.write(`</file>`);
                }
            })
            .on('pass', (test: Test) => {
                this.write(`<testCase name="${test.title}" duration="${test.duration}"/>`);
            })
            .on('pending', (test: Test) => {
                this.write(`<testCase name="${test.title}" duration="0">`);
                ++this.indents;
                this.write(`<skipped message="pending">Test is Pending</skipped>`);
                --this.indents;
            })
            .on('fail', (test: Test, err: Error) => {
                this.write(`<testCase name="${test.title}" duration="0">`);
                ++this.indents;
                this.write(`<failure message="${err.message}">${err.stack}</failure>`);
                --this.indents;
            })
            .once('end', () => {
                --this.indents;
                this.write(`</testExecutions>`);
            });
    }

    private write(message: string) {
        console.log(`${this.indent()}${message}`);
    }

    private indent() {
        return Array(this.indents).join('  ');
    }
}

module.exports = SonarReporter;