import type { ExerciseAction } from 'digital-fuesim-manv-shared';

export type ExercisePerformanceLogs = {
    exerciseTime: number;
    actionType: ExerciseAction['type'];
    emitterId: string | null;
    validateActionTime?: number;
    reduceActionTime?: number;
    broadcastActionTime?: number;
}[];
