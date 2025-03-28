import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'root-client',
  projectName: 'nfc-root-client',
  productionContainer: 'notify-root-client',
  developContainer: 'notify-root-client',
  serve: {
    port: 4230,
  },
});

export const runRootClientBuild = async () => {
  await baseBundler(manifest);
};
