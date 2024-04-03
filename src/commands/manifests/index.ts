import { hasApp } from '../nut.utils';
import { runAgentClientBuild } from './manifest.agent';
import { runApiBuild } from './manifest.api';
import { runCompanyClientBuild } from './manifest.company';
import { runPlayerBuild } from './manifest.player';
import { runPublicClientBuild } from './manifest.public';
import { runRootClientBuild } from './manifest.root';

export const buildApps = async () => {
  await runCompanyClientBuild();

  await runAgentClientBuild({ capSync: hasApp('native') || hasApp('all') });

  await runRootClientBuild();

  await runPlayerBuild();

  await runApiBuild();

  await runPublicClientBuild();

  await runCompanyClientBuild();
};
