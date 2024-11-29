#! /usr/bin/env bun
import { program } from 'commander';
import { buildApps } from './commands/nut.build';

import chalk from 'chalk';
import { runAgentClientBuild } from './commands/manifests/manifest.agent';
import { caproverLogin, deployApps } from './commands/nut.deploy';
import {
  availableManifests,
  bufferToString,
  executeAsyncShell,
  executeShell,
  logWhenVerbose,
  openAfterSync,
  parseCommand,
  spinner,
} from './commands/nut.utils';

const _program = program;

const cap = _program
  .command('cap')
  .description('Agent client capacitor commands');

_program.command('force-login').action(async () => {
  caproverLogin();
});

_program
  .command('deploy <apps>')
  .description("Build and deploy apps to offcenter's CapRover container")
  .option('-prod --production', 'Deploy to production')
  .option('-v --verbose', 'Verbose output')
  .action(async () => {
    const { productionOptTrue } = parseCommand(_program);

    await buildApps();

    await deployApps(productionOptTrue);
  });

_program
  .command('build <apps...>')
  .description('Build apps for deployment')
  .option('-prod --production', 'Build production')
  .option('-v --verbose', 'Verbose output')
  .action(async () => {
    parseCommand(_program);

    await buildApps();
  });

_program
  .command('install')
  .option('-v --verbose', 'Verbose output')
  .action(async () => {
    parseCommand(_program, {
      appsNotRequired: true,
    });

    spinner.start();
    spinner.setSpinnerTitle('Installing packages...');
    spinner.setSpinnerString(32);

    const { stderr, stdout, exitCode } = executeShell('npm install --force');
    logWhenVerbose(bufferToString(stdout));

    if (exitCode !== 0) {
      spinner.stop(true);
      console.error(chalk.red('Error installing packages'));
      console.error(chalk.red(bufferToString(stderr)));
      return;
    }

    if (stderr && exitCode === 0) {
      logWhenVerbose(chalk.yellow(bufferToString(stderr)));
    }

    console.log(chalk.green('Packages installed successfully'));
    spinner.stop(true);
  });

_program.command('serve <app>').action(async (app) => {
  parseCommand(_program);

  const manifest = availableManifests.find(
    (manifest) => manifest.appName === app
  );

  if (!manifest) {
    console.error(chalk.red(`Could not find ${chalk.bold(app)} manifest`));
    return;
  }

  const port = manifest.serve?.port;

  console.log(chalk.blue(`Serving ${app} ${port ? `on port ${port}` : ''}...`));

  _program.on('SIGINT', () => {
    console.log('Ctrl-C was pressed');
    process.exit(0);
  });

  executeAsyncShell(
    `nx serve ${manifest.projectName} ${port ? `--port=${port}` : ''}`
  );
});

cap
  .command('sync')
  .description("Sync the agent client's capacitor project")
  .option('-v --verbose', 'Verbose output')
  .option('-ios', 'Open XCode after sync')
  .option('-prod --production', 'Sync production')
  .option('-android', 'Open Android Studio after sync')
  .option('-both', 'Open both IDEs after sync')
  .action(async () => {
    parseCommand(_program, { appsNotRequired: true });

    const manifest = await runAgentClientBuild({ capSync: true, force: true });

    if (!openAfterSync || !manifest) {
      return;
    }

    console.log('Opening IDE(s)...');

    if (openAfterSync === '-both') {
      executeShell(`nx run ${manifest.projectName}:cap:open-ios`);
      executeShell(`nx run ${manifest.projectName}:cap:open-android`);
      return;
    }

    executeShell(`nx run ${manifest.projectName}:cap:open${openAfterSync}`);
  });

cap
  .command('open <platform>')
  .description('Open the agent client in the specified platform IDE')
  .action(async (platform) => {
    parseCommand(_program, { appsNotRequired: true });

    const agentManifest = availableManifests.find(
      (manifest) => manifest.projectName === 'nfc-agent-client'
    );

    if (!agentManifest) {
      console.error(chalk.red('Could not find agent manifest'));
      return;
    }

    console.log(`Opening ${platform} IDE...`);

    executeShell(`nx run ${agentManifest.projectName}:cap:open-${platform}`);
  });

cap
  .command('sh <command>')
  .description('Run a capacitor command on the agent client project')
  .action(async (command) => {
    parseCommand(_program, { appsNotRequired: true });

    const agentManifest = availableManifests.find(
      (manifest) => manifest.projectName === 'nfc-agent-client'
    );

    if (!agentManifest) {
      console.error(chalk.red('Could not find agent manifest'));
      return;
    }

    console.log(`Running command: ${command}`);

    const { stdout } = executeShell(
      `nx run ${agentManifest.projectName}:cap --args="--command='${command}'"`
    );

    console.log(bufferToString(stdout));
  });

_program.parse();
