import { IsIn, IsNumber } from 'class-validator';

const logicalOperatorOptions = ['and', 'or'] as const;
type LogicalOperator = typeof logicalOperatorOptions[number];

export class CanCaterFor {
    @IsNumber()
    public red: number;

    @IsNumber()
    public yellow: number;

    @IsNumber()
    public green: number;

    @IsIn(logicalOperatorOptions)
    public logicalOperator: LogicalOperator;

    public constructor(
        red: number,
        yellow: number,
        green: number,
        logicalOperator: LogicalOperator
    ) {
        this.red = red;
        this.yellow = yellow;
        this.green = green;
        this.logicalOperator = logicalOperator;
    }
}
