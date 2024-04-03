import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'player',
  projectName: 'nfc-player',
  productionContainer: 'profiles-player',
  developContainer: 'ptc-profiles-player',
  serve: {
    port: 4200,
  },
});

export const runPlayerBuild = async () => {
  await baseBundler(manifest);
};
