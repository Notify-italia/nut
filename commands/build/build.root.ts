import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'root',
  buildName: 'nfc-root-client',
  productionContainer: 'notify-root-client',
  developContainer: 'ptc-notify-root-client',
});

export const runRootClientBuild = async () => {
  await baseBundler(manifest);
};
