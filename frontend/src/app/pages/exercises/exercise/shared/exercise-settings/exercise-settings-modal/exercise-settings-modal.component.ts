import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {
    cloneDeepMutable,
    Position,
    Size,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectConfiguration,
    selectTileMapProperties,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-exercise-settings-modal',
    templateUrl: './exercise-settings-modal.component.html',
    styleUrls: ['./exercise-settings-modal.component.scss'],
})
export class ExerciseSettingsModalComponent {
    public tileMapProperties = cloneDeepMutable(
        selectTileMapProperties(getStateSnapshot(this.store))
    );

    public readonly tileMapUrlRegex =
        /^(?=.*\{x\})(?=.*\{-?y\})(?=.*\{z\}).*$/u;

    public configuration$ = this.store.select(selectConfiguration);

    constructor(
        private readonly store: Store<AppState>,
        public readonly activeModal: NgbActiveModal,
        private readonly apiService: ApiService
    ) {}

    public updateTileMapProperties() {
        this.apiService.proposeAction({
            type: '[Configuration] Set tileMapProperties',
            tileMapProperties: this.tileMapProperties,
        });
    }

    public setPretriageFlag(pretriageEnabled: boolean) {
        this.apiService.proposeAction({
            type: '[Configuration] Set pretriageEnabled',
            pretriageEnabled,
        });
    }

    public setBluePatientsFlag(bluePatientsEnabled: boolean) {
        this.apiService.proposeAction({
            type: '[Configuration] Set bluePatientsEnabled',
            bluePatientsEnabled,
        });
    }

    public setNumberOfVehicles(numberOfVehicles: number) {
        this.apiService.proposeAction({
            type: '[Configuration] Set numberOfVehicles',
            numberOfVehicles,
        });
    }

    public setNumberOfPatients(numberOfPatients: number) {
        this.apiService.proposeAction({
            type: '[Configuration] Set numberOfPatients',
            numberOfPatients,
        });
    }

    public addViewports() {
        const size: Size = { width: 200, height: 100 };

        const positions: Position[] = [
            { x: 1461000, y: 6871000 },
            // { x: 1462000, y: 6872000 },
            // { x: 1462000, y: 6871000 },
            // { x: 1463000, y: 6873000 },
            // { x: 1463000, y: 6871000 },
            // { x: 1464000, y: 6874000 },
            // { x: 1464000, y: 6871000 },
            { x: 1465000, y: 6875000 },
            { x: 1465000, y: 6871000 },
        ];

        for (const [i, position] of positions.entries()) {
            this.apiService.proposeAction({
                type: '[Viewport] Add viewport',
                viewport: Viewport.create(
                    {
                        x: position.x,
                        y: position.y,
                    },
                    size,
                    String(i)
                ),
            });
        }
    }

    public close() {
        this.activeModal.close();
    }
}
