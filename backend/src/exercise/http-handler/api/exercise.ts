import { plainToInstance } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';
import type { ExerciseIds } from 'digital-fuesim-manv-shared';
import { ExerciseState, StateExport } from 'digital-fuesim-manv-shared';
import type { ServiceProvider } from '../../../database/services/service-provider';
import { UserReadableIdGenerator } from '../../../utils/user-readable-id-generator';
import { exerciseMap } from '../../exercise-map';
import { ExerciseWrapper } from '../../exercise-wrapper';
import type { HttpResponse } from '../utils';

export async function postExercise(
    services: ServiceProvider,
    importObject?: string
): Promise<HttpResponse<ExerciseIds>> {
    let newParticipantId: string | undefined;
    let newTrainerId: string | undefined;
    try {
        newParticipantId = UserReadableIdGenerator.generateId();
        newTrainerId = UserReadableIdGenerator.generateId(8);
        let newExercise: ExerciseWrapper;
        if (importObject === undefined) {
            newExercise = await ExerciseWrapper.create(
                newParticipantId,
                newTrainerId,
                services,
                ExerciseState.create()
            );
        } else {
            let importInstance: StateExport;
            try {
                importInstance = plainToInstance(
                    StateExport,
                    // JSON.parse(importString) as StateExport
                    importObject
                );
            } catch (e: unknown) {
                if (e instanceof SyntaxError) {
                    console.error(e, importObject);
                    return {
                        statusCode: 400,
                        body: {
                            message: 'Provided JSON has invalid format',
                        },
                    };
                }
                throw e;
            }
            const validationErrors: (ValidationError | string)[] =
                validateSync(importInstance);
            if (importInstance.history) {
                validationErrors.push(
                    ...importInstance.history
                        .validateActions()
                        .flatMap((value) => [...value])
                );
            }
            if (validationErrors.length > 0) {
                return {
                    statusCode: 400,
                    body: {
                        message: `The validation of the import failed: ${validationErrors}`,
                    },
                };
            }
            newExercise = await ExerciseWrapper.importFromFile(
                services,
                importInstance,
                {
                    participantId: newParticipantId,
                    trainerId: newTrainerId,
                }
            );
        }
        exerciseMap.set(newParticipantId, newExercise);
        exerciseMap.set(newTrainerId, newExercise);
        return {
            statusCode: 201,
            body: {
                participantId: newParticipantId,
                trainerId: newTrainerId,
            },
        };
    } catch (error: unknown) {
        if (error instanceof RangeError) {
            return {
                statusCode: 503,
                body: {
                    message: 'No ids available.',
                },
            };
        }
        throw error;
    }
}

export function getExercise(exerciseId: string): HttpResponse {
    const exerciseExists = exerciseMap.has(exerciseId);
    return {
        statusCode: exerciseExists ? 200 : 404,
        body: undefined,
    };
}

export async function deleteExercise(
    exerciseId: string
): Promise<HttpResponse> {
    const exerciseWrapper = exerciseMap.get(exerciseId);
    if (exerciseWrapper === undefined) {
        return {
            statusCode: 404,
            body: {
                message: `Exercise with id '${exerciseId}' was not found`,
            },
        };
    }
    if (exerciseWrapper.getRoleFromUsedId(exerciseId) !== 'trainer') {
        return {
            statusCode: 403,
            body: {
                message:
                    'Exercises can only be deleted by using their trainer id',
            },
        };
    }
    await exerciseWrapper.deleteExercise();
    return {
        statusCode: 204,
        body: undefined,
    };
}
