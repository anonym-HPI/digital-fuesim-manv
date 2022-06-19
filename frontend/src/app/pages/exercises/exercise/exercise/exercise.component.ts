import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    applyAction,
    reduceExerciseState,
    StateExport,
    StateHistoryCompound,
} from 'digital-fuesim-manv-shared';
import produce, { setAutoFreeze } from 'immer';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { saveBlob } from 'src/app/shared/functions/save-blob';
import type { AppState } from 'src/app/state/app.state';
import { selectParticipantId } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import { environment } from 'src/environments/environment';
import { SimulatedParticipant } from './simulated-participant';

@Component({
    selector: 'app-exercise',
    templateUrl: './exercise.component.html',
    styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnDestroy {
    private readonly destroy = new Subject<void>();

    public readonly participantId$ = this.store.select(selectParticipantId);

    private readonly simulatedParticipant = new SimulatedParticipant(
        this.store,
        this.apiService
    );

    constructor(
        private readonly store: Store<AppState>,
        public readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

    public shareExercise(exerciseId: string) {
        const url = `${location.origin}/exercises/${exerciseId}`;
        if (navigator.share) {
            navigator.share({ url }).catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }
                this.messageService.postError({
                    title: 'Fehler beim Teilen der Übung',
                    error: { error, url },
                });
            });
            return;
        }
        navigator.clipboard.writeText(url);

        this.messageService.postMessage({
            title: 'Link wurde in die Zwischenablage kopiert',
            body: 'Sie können ihn nun teilen.',
            color: 'info',
        });
    }

    public leaveTimeTravel() {
        this.apiService.stopTimeTravel();
        this.messageService.postMessage({
            title: 'Zurück in die Zukunft!',
            color: 'info',
        });
    }

    public async exportExerciseWithHistory() {
        const history = await this.apiService.exerciseHistory();
        const currentState = getStateSnapshot(this.store).exercise;
        const blob = new Blob([
            JSON.stringify(
                new StateExport(
                    currentState,
                    new StateHistoryCompound(
                        history.actionsWrappers.map(
                            (actionWrapper) => actionWrapper.action
                        ),
                        history.initialState
                    )
                )
            ),
        ]);
        saveBlob(blob, `exercise-state-${currentState.participantId}.json`);
    }

    public async exportPerformanceLogs() {
        const blob = new Blob([
            JSON.stringify(await this.apiService.performanceLog()),
        ]);
        saveBlob(
            blob,
            `exercise-log-${
                getStateSnapshot(this.store).exercise.participantId
            }.json`
        );
    }

    public async timelineBenchmark() {
        setAutoFreeze(false);
        const { initialState, actionsWrappers } =
            await this.apiService.exerciseHistory();
        performance.mark('timeline-normal-start');
        let normalState = initialState;
        for (const { action } of actionsWrappers) {
            normalState = reduceExerciseState(normalState, action);
        }
        const normalTime = performance.measure(
            'timeline-normal-end',
            'timeline-normal-start'
        ).duration;
        performance.mark('timeline-improved-start');
        const improvedState = produce(initialState, (draft) => {
            for (const { action } of actionsWrappers) {
                applyAction(draft, action);
            }
        });
        const improvedTime = performance.measure(
            'timeline-improved-end',
            'timeline-improved-start'
        ).duration;
        console.log(`production: ${environment.production}\n
check: ${isEqual(normalState, improvedState)}\n
numberOfActions: ${actionsWrappers.length}\n
normal: ${normalTime}ms\n
improved: ${improvedTime}ms`);
    }

    public exportExerciseState() {
        const currentState = getStateSnapshot(this.store).exercise;
        const blob = new Blob([JSON.stringify(new StateExport(currentState))]);
        saveBlob(blob, `exercise-state-${currentState.participantId}.json`);
    }

    ngOnDestroy(): void {
        this.destroy.next();
    }
}
