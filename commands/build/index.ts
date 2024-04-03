import { hasApp } from '../nut.utils';
import { runAgentClientBuild } from './build.agent';
import { runApiBuild } from './build.api';
import { runCompanyClientBuild } from './build.company';
import { runPlayerBuild } from './build.player';
import { runPublicClientBuild } from './build.public';
import { runRootClientBuild } from './build.root';

export const buildApps = async () => {
  await runCompanyClientBuild();

  await runAgentClientBuild({ capSync: hasApp('native') || hasApp('all') });

  await runRootClientBuild();

  await runPlayerBuild();

  await runApiBuild();

  await runPublicClientBuild();

  await runCompanyClientBuild();
};
