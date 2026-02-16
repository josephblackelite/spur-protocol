#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getAdapterById, runDoctor } from '@spurprotocol/doctor';
import { explainWhyNotRunnable } from '@spurprotocol/explain';
function formatCheckLine(check) {
    return `${check.ok ? '[OK]' : '[FAIL]'} ${check.id} - ${check.message}`;
}
function parseFlag(args, name) {
    const idx = args.indexOf(name);
    if (idx === -1) {
        return undefined;
    }
    return args[idx + 1];
}
async function loadJsonFile(filePath) {
    const resolved = path.resolve(process.cwd(), filePath);
    const raw = await readFile(resolved, 'utf8');
    return JSON.parse(raw);
}
async function runDoctorCommand() {
    const checks = await runDoctor();
    for (const check of checks) {
        console.log(formatCheckLine(check));
    }
    return checks.every((check) => check.ok) ? 0 : 1;
}
async function runExplainCommand(args) {
    const envelopePath = parseFlag(args, '--envelope');
    const policyPath = parseFlag(args, '--policy');
    const robotPath = parseFlag(args, '--robot');
    const adapterArg = parseFlag(args, '--adapter');
    if (!envelopePath || !policyPath || !robotPath || !adapterArg) {
        console.error('Missing required flags: --envelope --policy --robot --adapter');
        return 1;
    }
    try {
        const envelope = await loadJsonFile(envelopePath);
        const policy = await loadJsonFile(policyPath);
        const robot = await loadJsonFile(robotPath);
        let adapter = getAdapterById(adapterArg);
        if (!adapter) {
            adapter = await loadJsonFile(adapterArg);
        }
        const report = explainWhyNotRunnable({ envelope, policy, robot, adapter });
        console.log(`ok: ${report.ok}`);
        console.log(`decision: ${JSON.stringify(report.decision)}`);
        console.log(`missingCapabilities: ${JSON.stringify(report.missingCapabilities)}`);
        console.log(`policyIssues: ${JSON.stringify(report.policyIssues)}`);
        console.log(`adapterIssues: ${JSON.stringify(report.adapterIssues)}`);
        console.log(`suggestedFixes: ${JSON.stringify(report.suggestedFixes)}`);
        return report.ok ? 0 : 2;
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        return 1;
    }
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (command === 'doctor') {
        process.exitCode = await runDoctorCommand();
        return;
    }
    if (command === 'explain') {
        process.exitCode = await runExplainCommand(args.slice(1));
        return;
    }
    console.error('Usage:\n  spur doctor\n  spur explain --envelope <path> --policy <path> --robot <path> --adapter <adapterId|path>');
    process.exitCode = 1;
}
main();
//# sourceMappingURL=index.js.map