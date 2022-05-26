import { IsIn, IsInt, IsString, Min, validateSync } from 'class-validator';
import { ExerciseState } from '../../state';
import { defaultValidateOptions } from '../../store/validation-options';

export abstract class ExportImportFile {
    public static readonly currentFileVersion = 1;

    @IsInt()
    @Min(0)
    public readonly fileVersion: number = ExportImportFile.currentFileVersion;

    @IsInt()
    @Min(0)
    public readonly dataVersion: number = ExerciseState.currentStateVersion;

    @IsIn(['complete', 'partial'])
    @IsString()
    public abstract readonly type: 'complete' | 'partial';

    public validate() {
        return validateSync(this, defaultValidateOptions);
    }
}
