import * as util from 'node:util';
import { ReducerError } from 'digital-fuesim-manv-shared';
import { ValidationErrorWrapper } from './utils/validation-error-wrapper';
import { RestoreError } from './utils/restore-error';
import { ExerciseWrapper } from './exercise/exercise-wrapper';
import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { ServiceProvider } from './database/services/service-provider';
import { FuesimServer } from './fuesim-server';

async function main() {
    Config.initialize();

    const dataSource = await createNewDataSource().initialize();
    const services = new ServiceProvider(dataSource);
    try {
        console.log('Loading exercises from database…');
        const startTime = performance.now();
        const exercises = await ExerciseWrapper.restoreAllExercises(services);
        const endTime = performance.now();
        console.log(
            `✅ Successfully loaded ${exercises.length} exercise(s) in ${(
                endTime - startTime
            ).toFixed(3)} ms.`
        );
    } catch (e: unknown) {
        console.error('❌ An error occurred while loading exercises.');
        if (e instanceof ValidationErrorWrapper) {
            console.error(
                'The validation of the exercises and actions in the database failed:',
                util.inspect(e.errors, false, null, true)
            );
            return;
        } else if (e instanceof ReducerError) {
            console.error('Could not apply an action:', e.message, e.stack);
            return;
        } else if (e instanceof RestoreError) {
            console.error(
                `Error while restoring exercise \`${e.exerciseId}\`:`,
                e.message,
                e.stack
            );
            return;
        }
        throw e;
    }
    // eslint-disable-next-line no-new
    new FuesimServer(services);
}

main();
