import type { Plugin } from "@elizaos/core";
import { MBDFarcasterService } from "./services/mbd.service";
import {
    getFarcasterFeed,
    searchFarcasterCasts,
    analyzeFarcasterContent,
    discoverFarcasterUsers
} from "./actions/mbdFarcaster";

export const mbdFarcasterPlugin: Plugin = {
    name: "MBD Farcaster",
    description: "Interact with Farcaster content and users through the MBD (Mind Blockchain Data) API.",
    actions: [
        getFarcasterFeed,
        searchFarcasterCasts,
        analyzeFarcasterContent,
        discoverFarcasterUsers
    ],
    evaluators: [],
    providers: [],
    services: [new MBDFarcasterService()],
};

export default mbdFarcasterPlugin;


export * from "./types/mbd-types";