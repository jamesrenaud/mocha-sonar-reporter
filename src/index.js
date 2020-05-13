// nyc-sonar-reporter
'use strict';

const { ReportBase } = require('istanbul-lib-report');

class SonarGenericReport extends ReportBase {

    constructor(opts) {
        super();
        this.contentWriter = null;
        this.xml = null;
        this.projectRoot = opts.projectRoot || process.cwd();
        this.file = opts.file || 'sonar-summary.xml';
        this._indents = 0;
    }

    onStart(root, context) {
        this.contentWriter = context.writer.writeFile(this.file);
        this.xml = context.getXMLWriter(this.cw);
        this.contentWriter.write('<testExecutions version="1">');
    }

    onSummary(node, state) {
        this.contentWriter = context.writer.writeFile(this.file);
        this.contentWriter.write(`${this.increaseIndent()}<file path="${node.getQualifiedName()}">`);
    }

    onDetail(node, state) {
        const fc = node.getFileCoverage();
        const writer = this.contentWriter;
        const functions = fc.f;
        const functionMap = fc.fnMap;
        const lines = fc.getLineCoverage();
        const branches = fc.b;
        const branchMap = fc.branchMap;
        const summary = node.getCoverageSummary();
        const path = require('path');

        writer.println('TN:'); //no test nam
        writer.println('SF:' + path.relative(this.projectRoot, fc.path));

        Object.values(functionMap).forEach(meta => {
            writer.println('FN:' + [meta.decl.start.line, meta.name].join(','));
        });
        writer.println('FNF:' + summary.functions.total);
        writer.println('FNH:' + summary.functions.covered);

        Object.entries(functionMap).forEach(([key, meta]) => {
            const stats = functions[key];
            writer.println('FNDA:' + [stats, meta.name].join(','));
        });

        Object.entries(lines).forEach(entry => {
            writer.println('DA:' + entry.join(','));
        });
        writer.println('LF:' + summary.lines.total);
        writer.println('LH:' + summary.lines.covered);

        Object.entries(branches).forEach(([key, branchArray]) => {
            const meta = branchMap[key];
            const { line } = meta.loc.start;
            branchArray.forEach((b, i) => {
                writer.println('BRDA:' + [line, key, i, b].join(','));
            });
        });
        writer.println('BRF:' + summary.branches.total);
        writer.println('BRH:' + summary.branches.covered);
        writer.println('end_of_record');
    }

    onEnd(root, context) {
        const cw = this.contentWriter;
        cw.println('</testExecutions>');
        cw.close();
    }

    indent() {
        return Array(this._indents).join('  ');
    }

    increaseIndent() {
        this._indents++;
    }

    decreaseIndent() {
        this._indents--;
    }
}