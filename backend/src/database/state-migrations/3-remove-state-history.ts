// TODO: Why is no direct import possible?
import type { Action } from 'digital-fuesim-manv-shared/dist/store/action-reducer';
import type { Migration } from './migrations';

export const removeStateHistory3: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            const actionType = (action as Action | null)?.type;
            if (
                actionType === '[Exercise] Pause' ||
                actionType === '[Exercise] Start'
            ) {
                delete (action as Action).timestamp;
            }
        });
    },
    state: (state) => {
        interface StatusHistoryEntry {
            status: 'paused' | 'running';
        }
        const oldState = state as { statusHistory?: StatusHistoryEntry[] };
        const currentStatus =
            oldState.statusHistory?.[oldState.statusHistory.length - 1]
                ?.status ?? 'notStarted';
        delete oldState.statusHistory;
        (
            state as { currentStatus: 'notStarted' | 'paused' | 'running' }
        ).currentStatus = currentStatus;
        return state;
    },
};
