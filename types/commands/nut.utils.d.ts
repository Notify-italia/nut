/// <reference types="node" />
/// <reference types="bun-types" />
/// <reference types="bun-types" />
import type { Command } from 'commander';
export declare const NotifyAvailableApps: readonly ["company", "api", "agent", "public", "player", "native", "root", "all"];
export type INotifyAvailableApps = (typeof NotifyAvailableApps)[number];
export interface INotifyAppManifest {
    appName: INotifyAvailableApps;
    buildName: string;
    productionContainer: string;
    developContainer: string;
    preDeployTasks?: string[][];
}
export declare const availableManifests: INotifyAppManifest[];
export declare let selectedApps: string[];
export declare let verboseEnabled: boolean;
export declare let productionOptTrue: boolean;
export declare let openAfterSync: '-ios' | '-android' | '-both' | undefined;
export declare const bufferToString: (buffer: Buffer) => string;
export declare const printError: (stderr: Buffer, appName: string) => never;
export declare const hasApp: (app: INotifyAvailableApps) => boolean;
export declare const baseBundler: (manifest: INotifyAppManifest, command?: string) => Promise<Buffer | undefined>;
export declare const publishManifest: (config: INotifyAppManifest) => INotifyAppManifest;
export declare const whenVerbose: (chalk: string) => void;
export declare const parseCommand: (program: Command, config?: {
    appsOptional?: boolean;
}) => {
    selectedApps: string[];
    verboseEnabled: boolean;
    productionOptTrue: boolean;
};
export declare const executeShell: (command: string) => import("bun").SyncSubprocess<"pipe", "pipe">;
