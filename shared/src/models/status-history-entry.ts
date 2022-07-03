import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { getCreate, ImmutableDate } from './utils';

export class StatusHistoryEntry {
    // TODO
    @IsString()
    public readonly status: 'paused' | 'running';

    /**
     * The time from which on this status was set.
     */
    @IsDate()
    @Type(() => Date)
    public readonly startTimestamp: ImmutableDate;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(status: 'paused' | 'running', startTimestamp: Date) {
        this.status = status;
        this.startTimestamp = startTimestamp;
    }

    static readonly create = getCreate(this);
}
