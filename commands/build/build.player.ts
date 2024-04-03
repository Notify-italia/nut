import { baseBundler, publishManifest } from '../nut.utils';

const manifest = publishManifest({
  appName: 'player',
  buildName: 'nfc-player',
  productionContainer: 'profiles-player',
  developContainer: 'ptc-profiles-player',
});

export const runPlayerBuild = async () => {
  await baseBundler(manifest);
};
