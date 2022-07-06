import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNumber,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { TileMapProperties } from '../../models/utils';
import { cloneDeepMutable } from '../../utils';
import type { Action, ActionReducer } from '../action-reducer';

export class SetTileMapPropertiesAction implements Action {
    @IsString()
    public readonly type = '[Configuration] Set tileMapProperties';

    @ValidateNested()
    @Type(() => TileMapProperties)
    public readonly tileMapProperties!: TileMapProperties;
}

export class SetPretriageEnabledAction implements Action {
    @IsString()
    public readonly type = '[Configuration] Set pretriageEnabled';

    @IsBoolean()
    public readonly pretriageEnabled!: boolean;
}

export class SetBluePatientsEnabledFlagAction implements Action {
    @IsString()
    public readonly type = '[Configuration] Set bluePatientsEnabled';

    @IsBoolean()
    public readonly bluePatientsEnabled!: boolean;
}

export class SetNumberOfVehiclesAction implements Action {
    @IsString()
    public readonly type = '[Configuration] Set numberOfVehicles';

    @IsNumber()
    @Min(0)
    public readonly numberOfVehicles!: number;
}

export class SetNumberOfPatientsAction implements Action {
    @IsString()
    public readonly type = '[Configuration] Set numberOfPatients';

    @IsNumber()
    @Min(0)
    public readonly numberOfPatients!: number;
}

export namespace ConfigurationActionReducers {
    export const setTileMapProperties: ActionReducer<SetTileMapPropertiesAction> =
        {
            action: SetTileMapPropertiesAction,
            reducer: (draftState, { tileMapProperties }) => {
                draftState.configuration.tileMapProperties =
                    cloneDeepMutable(tileMapProperties);
                return draftState;
            },
            rights: 'trainer',
        };

    export const setPretriageFlag: ActionReducer<SetPretriageEnabledAction> = {
        action: SetPretriageEnabledAction,
        reducer: (draftState, { pretriageEnabled }) => {
            draftState.configuration.pretriageEnabled = pretriageEnabled;
            return draftState;
        },
        rights: 'trainer',
    };

    export const setBluePatientsFlag: ActionReducer<SetBluePatientsEnabledFlagAction> =
        {
            action: SetBluePatientsEnabledFlagAction,
            reducer: (draftState, { bluePatientsEnabled }) => {
                draftState.configuration.bluePatientsEnabled =
                    bluePatientsEnabled;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setNumberOfVehicles: ActionReducer<SetNumberOfVehiclesAction> =
        {
            action: SetNumberOfVehiclesAction,
            reducer: (draftState, { numberOfVehicles }) => {
                draftState.configuration.numberOfVehicles = numberOfVehicles;
                return draftState;
            },
            rights: 'trainer',
        };

    export const setNumberOfPatients: ActionReducer<SetNumberOfPatientsAction> =
        {
            action: SetNumberOfPatientsAction,
            reducer: (draftState, { numberOfPatients }) => {
                draftState.configuration.numberOfPatients = numberOfPatients;
                return draftState;
            },
            rights: 'trainer',
        };
}
