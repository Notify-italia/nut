import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'root',
  projectName: 'nfc-root-client',
  productionContainer: 'notify-root-client',
  developContainer: 'ptc-notify-root-client',
  serve: {
    port: 4230,
  },
});

export const runRootClientBuild = async () => {
  await baseBundler(manifest);
};
