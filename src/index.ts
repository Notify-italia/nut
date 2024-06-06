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
  openAfterSync,
  parseCommand,
} from './commands/nut.utils';

const cap = program
  .command('cap')
  .description('Agent client capacitor commands');

program.command('force-login').action(async () => {
  caproverLogin();
});

program
  .command('deploy <apps>')
  .description("Build and deploy apps to offcenter's CapRover container")
  .option('-prod --production', 'Deploy to production')
  .option('-v --verbose', 'Verbose output')
  .action(async () => {
    const { productionOptTrue } = parseCommand(program);

    await buildApps();

    await deployApps(productionOptTrue);
  });

program
  .command('build <apps...>')
  .description('Build apps for deployment')
  .option('-prod --production', 'Build production')
  .option('-v --verbose', 'Verbose output')
  .action(async () => {
    parseCommand(program);

    await buildApps();
  });

program.command('serve <app>').action(async (app) => {
  parseCommand(program);

  const manifest = availableManifests.find(
    (manifest) => manifest.appName === app
  );

  if (!manifest) {
    console.error(chalk.red(`Could not find ${chalk.bold(app)} manifest`));
    return;
  }

  const port = manifest.serve?.port;

  console.log(chalk.blue(`Serving ${app} ${port ? `on port ${port}` : ''}...`));

  program.on('SIGINT', () => {
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
    parseCommand(program, { appsOptional: true });

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
    parseCommand(program, { appsOptional: true });

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
    parseCommand(program, { appsOptional: true });

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

program.parse();
