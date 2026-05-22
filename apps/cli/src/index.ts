import { appConfig } from "@lume/data";
import { LUME_SPECIMEN_IDENTITIES } from "@lume/data/specimen-identities";
import { runSyncContentCommand } from "./sync-content";

const [command] = process.argv.slice(2);

if (command === "sync-content") {
  runSyncContentCommand(LUME_SPECIMEN_IDENTITIES).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
} else {
  console.log(`${appConfig.name}: CLI ready`);
}
