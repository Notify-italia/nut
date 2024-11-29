import chalk from 'chalk';
import { Spinner } from 'cli-spinner';
import type { Command } from 'commander';
import fs from 'fs';
import { join } from 'path';

export const NotifyAvailableApps = [
  'company',
  'api',
  'agent',
  'public',
  'player',
  'native',
  'root-client',
  'root-api',
  'all',
] as const;

export type INotifyAvailableApps = (typeof NotifyAvailableApps)[number];

export interface INotifyAppManifest {
  appName: INotifyAvailableApps;
  projectName: string;
  productionContainer: string;
  developContainer: string;
  /**
   * EXPERIMENTAL: Minify CSS after build
   */
  minifycss?: boolean;
  preDeployTasks?: string[][];
  serve?: {
    port: number;
  };
}

//dichiaro lo spinner del cli (globetto che gira mentre esegue il deploy)
export const spinner = new Spinner({
  text: 'Deploying...',
  stream: process.stderr,
  onTick: function (msg) {
    this.clearLine(this.stream);
    this.stream.write(msg);
  },
}).setSpinnerString(15);

export const availableManifests: INotifyAppManifest[] = [];

const NUT_VERSION = '1.1.0';

export let selectedApps: string[] = [];
export let verboseEnabled: boolean = false;
export let productionOptTrue: boolean = false;
export let openAfterSync: '-ios' | '-android' | '-both' | undefined;

export const bufferToString = (buffer: Buffer) => buffer.toString('utf-8');

export const printError = (stderr: Buffer, appName: string) => {
  console.log(chalk.bgRed.white(`${appName} task failed`));
  console.log(chalk.red(bufferToString(stderr)));
  process.exit(1);
};

export const hasApp = (app: INotifyAvailableApps) => {
  return selectedApps.includes(app);
};

export const baseBundler = async (
  manifest: INotifyAppManifest,
  command = `nx run ${manifest.projectName}:build:${
    productionOptTrue ? 'production' : 'ptc'
  } `
) => {
  if (!hasApp(manifest.appName as INotifyAvailableApps) && !hasApp('all')) {
    return;
  }

  logWhenVerbose(`running ${command}`);

  const spinner = new Spinner({
    text: `%s Building ${manifest.appName}...`,
    stream: process.stdout,
  })
    .setSpinnerString(6)
    .start();

  // This code snippet is using a ternary operator to conditionally execute a command based on the presence of the `command` parameter
  const { stdout, stderr, exitCode } = executeShell(command);

  logWhenVerbose(bufferToString(stdout));

  if (exitCode) {
    spinner.stop(true);
    printError(stderr, manifest.appName);
  }

  if (manifest.minifycss) {
    logWhenVerbose(chalk.blue('Minifying CSS...'));
    const cssFiles = _searchFiles(`dist/apps/${manifest.projectName}`)?.filter(
      (file) => file.endsWith('.css')
    );

    cssFiles?.forEach((file) => {
      const { stdout, stderr, exitCode } = executeShell(
        `npx tailwindcss -o ${file} --minify`
      );

      if (exitCode) {
        spinner.stop(true);
        printError(stderr, manifest.appName);
      }

      logWhenVerbose(bufferToString(stdout));
    });
  }

  spinner.stop(true);

  console.log(chalk.green.bold(`${manifest.appName} build successful`));

  return stdout;
};

export const publishManifest = (
  config: INotifyAppManifest
): INotifyAppManifest => {
  availableManifests.push(config);
  return config;
};

export const logWhenVerbose = (chalk: string) => {
  if (!verboseEnabled) {
    return;
  }

  console.log(chalk);
};

export const parseCommand = (
  program: Command,
  config?: {
    appsNotRequired?: boolean;
  }
) => {
  console.log(
    chalk.hex('#E8AF48').bold(`N.U.T. - Notify Utility Tool 🥜 v${NUT_VERSION}`)
  );

  selectedApps = program.args
    .filter((v) => NotifyAvailableApps.includes(v as INotifyAvailableApps))
    .map((v) => v as INotifyAvailableApps);

  verboseEnabled = _hasOption(program, ['-v', '--verbose']) as boolean;
  productionOptTrue = _hasOption(program, ['-prod', '--production']) as boolean;
  openAfterSync = _hasOption(program, ['-ios', '-android', '-both'], true) as
    | '-ios'
    | '-android'
    | '-both'
    | undefined;

  if (productionOptTrue) {
    console.log(
      chalk.yellowBright.bold('YOU ARE DOING PRODUCTION STUFF. BE CAREFUL!')
    );
  }

  if (!selectedApps?.length && !config?.appsNotRequired) {
    console.log(
      chalk.bgRed.white.bold('No apps specified, specify an app with -a flag')
    );
    console.log(chalk.red('Available apps: company, agent, admin, app, all'));

    process.exit(1);
  }

  if (verboseEnabled) {
    console.log(chalk.blue('Verbose output enabled'));
  }

  return {
    selectedApps,
    verboseEnabled,
    productionOptTrue,
  };
};

const _hasOption = (
  program: Command,
  option: string[],
  returnOption = false
) => {
  if (returnOption) {
    return option.find((v) => program.args.includes(v));
  }
  return option.some((v) => program.args.includes(v));
};

export const executeShell = (command: string) => {
  return Bun.spawnSync(command.split(' '));
};

export const executeAsyncShell = async (command: string) => {
  const sh = Bun.spawn(command.split(' '));

  for await (let item of sh.stdout) {
    console.log(String.fromCharCode.apply(null, item as any));
  }

  return sh;
};

const _searchFiles = (dir: string): string[] => {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((file) =>
      file.isDirectory()
        ? _searchFiles(join(dir, file.name))
        : join(dir, file.name)
    );
};
