import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'public',
  projectName: 'nfc-public',
  productionContainer: 'public',
  developContainer: 'ptc-public',
  serve: {
    port: 4200,
  },
  preDeployTasks: [
    ['nx', 'gulp', 'nfc-public'],
    ['cp', './apps/nfc-public/main.js', 'dist/apps/nfc-public/server/main.js'],
  ],
});

export const runPublicClientBuild = async () => {
  await baseBundler(manifest);
};
