import chalk from 'chalk';
import { Spinner } from 'cli-spinner';

import {
  availableManifests,
  bufferToString,
  selectedApps,
  whenVerbose,
  type INotifyAppManifest,
} from './nut.utils';

//dichiaro lo spinner del cli (globetto che gira mentre esegue il deploy)
const spinner = new Spinner({
  text: 'Deploying...',
  stream: process.stderr,
  onTick: function (msg) {
    this.clearLine(this.stream);
    this.stream.write(msg);
  },
}).setSpinnerString(15);

export const deployApps = async (production = false) => {
  const mainfests = selectedApps.includes('all')
    ? availableManifests
    : availableManifests.filter((manifest) => {
        return selectedApps.includes(manifest.appName);
      });

  spinner.start();

  await asyncForEach(mainfests, async (manifest) => {
    spinner.setSpinnerTitle(`Deploying ${manifest.appName}...`);

    await _runPreDeployTasks(manifest);

    await _cpFile(
      `./apps/${manifest.buildName}/Dockerfile`,
      `dist/apps/${manifest.buildName}/Dockerfile`
    );
    await _cpFile(
      `./apps/${manifest.buildName}/captain-definition`,
      `dist/apps/${manifest.buildName}/captain-definition`
    );

    _makeTar(`./dist/apps/${manifest.buildName}`);

    _deployToCaprover(manifest, production);

    _removeTar();
    whenVerbose(chalk.green(`${manifest.appName} done`));
  });

  spinner.stop(true);

  console.log(chalk.bgGreen.white('All apps deployed'));
};

/**
 * a for loop that waits for the callback to finish before moving on to the next iteration.
 * @param {any[]} array - the array you want to loop through
 * @param callback - The function to execute on each element in the array.
 */
export const asyncForEach = async <T>(
  array: T[],
  callback: (curr: T, index: number, array: unknown[]) => unknown
) => {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
};

const _cpFile = async (from: string, to: string) => {
  const file = Bun.file(from);
  await Bun.write(to, file);

  whenVerbose(chalk.blue(`Copied ${from} to ${to}`));
};

const _makeTar = (path: string) => {
  Bun.spawnSync([
    'tar',
    '--strip-components=4',
    '-cvf',
    './deploy.tar',
    '--exclude=*.map',
    path,
  ]);

  whenVerbose(chalk.blue(`Created deploy.tar using path ${path} `));
};

const _deployToCaprover = (
  manifest: INotifyAppManifest,
  production: boolean
) => {
  const { stderr, stdout } = Bun.spawnSync([
    'caprover',
    'deploy',
    '-t',
    './deploy.tar',
    '-n',
    'notify',
    '-a',
    production ? manifest.productionContainer : manifest.developContainer,
  ]);

  const stringStdout = bufferToString(stdout);

  whenVerbose(stringStdout);

  if (!stringStdout.includes('Deployed successfully')) {
    spinner.stop(true);
    console.log(chalk.bgRed.white('Deployment failed for ' + manifest.appName));
    console.log(chalk.red(stringStdout));
    process.exit(1);
  }

  whenVerbose(
    chalk.blue(
      `Deployed ${manifest.appName} to ${
        production ? manifest.productionContainer : manifest.developContainer
      }`
    )
  );
};

const _removeTar = () => {
  Bun.spawnSync(['rm', './deploy.tar']);

  whenVerbose(chalk.yellow('Removed deploy.tar'));
};

const _runPreDeployTasks = async (manifest: INotifyAppManifest) => {
  if (!manifest.preDeployTasks) {
    return;
  }

  await asyncForEach(manifest.preDeployTasks, async (task) => {
    if (task[0] === 'cp') {
      return await _cpFile(task[1], task[2]);
    }

    whenVerbose(
      chalk.blue(
        `Running pre-deploy task "${chalk.bold(task[0])}" for ${
          manifest.appName
        }`
      )
    );
    const { stderr, stdout } = Bun.spawnSync(task);
    const stringStdout = bufferToString(stdout);

    whenVerbose(stringStdout);

    if (stderr.length) {
      spinner.stop(true);
      console.log(
        chalk.bgRed.white('Pre-deploy task failed for ' + manifest.appName)
      );
      whenVerbose(chalk.red(stderr));
      process.exit(1);
    }

    whenVerbose(
      chalk.green(
        `Pre-deploy task ${task[0]} successful for ${manifest.appName}`
      )
    );
  });
};
