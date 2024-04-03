import chalk from 'chalk';
import { Spinner } from 'cli-spinner';
import {
  bufferToString,
  executeShell,
  hasApp,
  printError,
  publishManifest,
  whenVerbose,
  type INotifyAvailableApps,
} from '../nut.utils';

const manifest = publishManifest({
  appName: 'agent',
  projectName: 'nfc-agent-client',
  productionContainer: 'profiles-agent-client',
  developContainer: 'ptc-profiles-agent-client',
  serve: {
    port: 4210,
  },
});

export const runAgentClientBuild = async (config: {
  capSync: boolean;
  force?: boolean;
}) => {
  const spinner = new Spinner({
    text: `%s Building ${manifest.appName}...`,
    stream: process.stdout,
  })
    .setSpinnerString(6)
    .start();

  if (
    !hasApp(manifest.appName as INotifyAvailableApps) &&
    !hasApp('native') &&
    !hasApp('all') &&
    !config.force
  ) {
    spinner.stop(true);
    return;
  }

  whenVerbose(chalk.blue(`Building ${manifest.appName}...`));
  const { stderr, exitCode } = executeShell(
    `nx build ${manifest.projectName} --prod`
  );

  if (exitCode) {
    printError(stderr, manifest.appName);
    spinner.stop(true);
    return;
  }

  spinner.stop(true);
  console.log(chalk.green.bold(`${manifest.appName} build successful`));

  if (!config.capSync) {
    return manifest;
  }

  spinner.setSpinnerTitle(`%s Syncing Capacitor...`).start();

  _capSync();

  spinner.stop(true);
  console.log(chalk.green.bold('Capacitor sync successful'));

  return manifest;
};

const _capSync = () => {
  const { stderr, exitCode, stdout } = executeShell(
    `nx run ${manifest.projectName}:cap:sync`
  );

  whenVerbose(bufferToString(stdout));

  if (!exitCode) {
    return;
  }
  console.log(chalk.red('Capacitor sync failed'));
  console.log(stderr);
};
