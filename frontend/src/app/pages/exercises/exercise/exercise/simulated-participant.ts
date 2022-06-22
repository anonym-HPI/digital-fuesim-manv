import type { Store } from '@ngrx/store';
import type { Position, Vehicle, Viewport } from 'digital-fuesim-manv-shared';
import {
    createVehicleParameters,
    defaultVehicleTemplates,
    Material,
    PatientTemplate,
    Personnel,
} from 'digital-fuesim-manv-shared';
import { Subject, takeUntil } from 'rxjs';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectMaterial,
    getSelectPersonnel,
    getSelectRestrictedViewport,
    getSelectVisibleElements,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

/**
 * Simulates a participant in the viewport the client is currently restricted to
 */
export class SimulatedParticipant {
    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {
        this.store
            .select(getSelectRestrictedViewport(this.apiService.ownClientId))
            .pipe(takeUntil(this.destroy$))
            .subscribe((restrictedViewportId) => {
                this.stopSimulation();
                if (restrictedViewportId) {
                    this.prepareSimulation();
                }
            });
    }

    private tickInterval?: any;
    private readonly amountInViewport = {
        vehicles: 30,
        unloadedVehicles: 25,
        patients: 20,
    };

    private async prepareSimulation() {
        // make sure there are at least x vehicles in the viewport
        for (
            let i = Object.keys(this.getVisibleVehicles()).length;
            i < this.amountInViewport.vehicles;
            i++
        ) {
            // eslint-disable-next-line no-await-in-loop
            await this.createVehicle();
        }
        // Unload x vehicles in the viewport
        const vehiclesInViewport = Object.values(this.getVisibleVehicles());
        const numberOfUnloadedVehicles = vehiclesInViewport.filter((_vehicle) =>
            this.vehicleIsUnloaded(_vehicle)
        ).length;
        const unloadableVehicles = vehiclesInViewport
            .filter((_vehicle) => !this.vehicleIsUnloaded(_vehicle))
            .slice(
                0,
                this.amountInViewport.unloadedVehicles -
                    numberOfUnloadedVehicles
            );
        for (const vehicle of unloadableVehicles) {
            // eslint-disable-next-line no-await-in-loop
            await this.apiService.proposeAction({
                type: '[Vehicle] Unload vehicle',
                vehicleId: vehicle.id,
            });
        }
        // make sure there are at least x patients in the viewport
        const state = getStateSnapshot(this.store);
        for (
            let i = Object.keys(this.getVisiblePatients()).length;
            i < this.amountInViewport.patients;
            i++
        ) {
            const category = state.exercise.patientCategories[0];
            const patient = PatientTemplate.generatePatient(
                category.patientTemplates[
                    Math.floor(Math.random() * category.patientTemplates.length)
                ],
                category.name
            );
            // eslint-disable-next-line no-await-in-loop
            await this.apiService.proposeAction({
                type: '[Patient] Add patient',
                patient: {
                    ...patient,
                    position: this.getRandomPosition(),
                },
            });
        }
        // every second: check whether you should move a random vehicle, personnel, patient or material
        this.tickInterval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    private stopSimulation() {
        clearInterval(this.tickInterval);
    }

    private async createVehicle() {
        return this.apiService.proposeAction(
            {
                type: '[Vehicle] Add vehicle',
                ...createVehicleParameters(
                    defaultVehicleTemplates[0],
                    this.getRandomPosition()
                ),
            },
            false
        );
    }

    private getCurrentViewport(): Viewport {
        return getSelectRestrictedViewport(this.apiService.ownClientId)(
            getStateSnapshot(this.store)
        )!;
    }

    private getRandomPosition(): Position {
        const viewport = this.getCurrentViewport();
        return {
            x: viewport.position.x + Math.random() * viewport.size.width,
            y: viewport.position.y - Math.random() * viewport.size.height,
        };
    }

    private async tick() {
        const randomNumber = Math.random();
        let previousActionProbability = 0;
        for (const { probability, sendAction } of this.randomActionMap) {
            previousActionProbability += probability;
            if (randomNumber < previousActionProbability) {
                // eslint-disable-next-line no-await-in-loop
                await sendAction();
                break;
            }
        }
    }

    private readonly randomActionMap = [
        {
            probability: 0.0735,
            sendAction: async () =>
                this.apiService.proposeAction({
                    type: '[Personnel] Move personnel',
                    personnelId: this.getRandomElement(
                        Object.keys(this.getVisiblePersonnel())
                    ),
                    // TODO: maybe near a patient?
                    targetPosition: this.getRandomPosition(),
                }),
        },
        {
            probability: 0.0595,
            sendAction: async () =>
                this.apiService.proposeAction({
                    type: '[Vehicle] Move vehicle',
                    vehicleId: this.getRandomElement(
                        Object.keys(this.getVisibleVehicles())
                    ),
                    targetPosition: this.getRandomPosition(),
                }),
        },
        {
            probability: 0.053,
            sendAction: async () =>
                this.apiService.proposeAction({
                    type: '[Material] Move material',
                    materialId: this.getRandomElement(
                        Object.keys(this.getVisibleMaterials())
                    ),
                    // TODO: maybe near a patient?
                    targetPosition: this.getRandomPosition(),
                }),
        },
        {
            probability: 0.022,
            sendAction: async () =>
                this.apiService.proposeAction({
                    type: '[Patient] Move patient',
                    patientId: this.getRandomElement(
                        Object.keys(this.getVisiblePatients())
                    ),
                    targetPosition: this.getRandomPosition(),
                }),
        },
    ];

    private getRandomElement<T>(elements: T[]): T {
        if (elements.length === 0) {
            throw Error('No elements available');
        }
        return elements[Math.floor(Math.random() * elements.length)];
    }

    private getVisibleVehicles() {
        return getSelectVisibleElements(
            'vehicles',
            this.apiService.ownClientId
        )(getStateSnapshot(this.store));
    }

    private getVisiblePatients() {
        return getSelectVisibleElements(
            'patients',
            this.apiService.ownClientId
        )(getStateSnapshot(this.store));
    }

    private getVisibleMaterials() {
        return getSelectVisibleElements(
            'materials',
            this.apiService.ownClientId
        )(getStateSnapshot(this.store));
    }

    private getVisiblePersonnel() {
        return getSelectVisibleElements(
            'personnel',
            this.apiService.ownClientId
        )(getStateSnapshot(this.store));
    }

    private vehicleIsUnloaded(vehicle: Vehicle) {
        const state = getStateSnapshot(this.store);
        return [
            ...Object.keys(vehicle.materialIds).map((materialId) =>
                Material.isInVehicle(getSelectMaterial(materialId)(state))
            ),
            ...Object.keys(vehicle.personnelIds).map((personnelId) =>
                Personnel.isInVehicle(getSelectPersonnel(personnelId)(state))
            ),
        ].every((isInVehicle) => !isInVehicle);
    }

    public destroy() {
        this.destroy$.next();
        this.stopSimulation();
    }
}
