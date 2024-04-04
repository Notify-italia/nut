import { runAgentClientBuild } from './manifests/manifest.agent';
import { runApiBuild } from './manifests/manifest.api';
import { runCompanyClientBuild } from './manifests/manifest.company';
import { runPlayerBuild } from './manifests/manifest.player';
import { runPublicClientBuild } from './manifests/manifest.public';
import { runRootClientBuild } from './manifests/manifest.root-client';
import { hasApp } from './nut.utils';

export const buildApps = async () => {
  await runCompanyClientBuild();

  await runAgentClientBuild({ capSync: hasApp('native') || hasApp('all') });

  await runRootClientBuild();

  await runPlayerBuild();

  await runApiBuild();

  await runPublicClientBuild();

  await runCompanyClientBuild();
};
