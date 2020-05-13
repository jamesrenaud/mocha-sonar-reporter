// mocha-sonar-reporter.js
'use strict';

import { Runner, Suite, Test } from 'mocha';
const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_TEST_PENDING,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
} = Runner.constants;

// this reporter outputs test results, indenting two spaces per suite
class SonarReporter {
    private _indents: number = 0;
    constructor(runner: Runner) {

        runner
            .once(EVENT_RUN_BEGIN, () => {
                console.log(`<testExecutions version="1">`);
                this.increaseIndent();
            })
            .on(EVENT_SUITE_BEGIN, (suite: Suite) => {
                console.log(`${this.indent()}<file path="${suite.fullTitle()}">`);
                this.increaseIndent();
            })
            .on(EVENT_SUITE_END, () => {
                this.decreaseIndent();
                console.log(`${this.indent()}</file>`);
            })
            .on(EVENT_TEST_PASS, (test: Test) => {
                if (test.speed === 'fast') {
                    console.log(`${this.indent()}<testCase name="${test.title}" duration="0"/>`);
                } else {
                    console.log(`${this.indent()}<testCase name="${test.title}" duration="${test.duration}"/>`);
                }
            })
            .on(EVENT_TEST_PENDING, (test: Test) => {
                console.log(`${this.indent()}<testCase name="${test.title}" duration="0">`);
                this.increaseIndent();
                console.log(`${this.indent()}<skipped message="pending">Test is Pending</skipped>`);
                this.decreaseIndent();
            })
            .on(EVENT_TEST_FAIL, (test: Test, err: Error) => {
                console.log(`${this.indent()}<testCase name="${test.title}" duration="0">`);
                this.increaseIndent();
                console.log(`${this.indent()}<failure message="${err.message}">${err.stack}</failure>`);
                this.decreaseIndent();
            })
            .once(EVENT_RUN_END, () => {
                this.decreaseIndent();
                console.log(`</testExecutions>`);
            });
    }

    private indent() {
        return Array(this._indents).join('  ');
    }

    private increaseIndent() {
        this._indents++;
    }

    private decreaseIndent() {
        this._indents--;
    }
}

module.exports = SonarReporter;
