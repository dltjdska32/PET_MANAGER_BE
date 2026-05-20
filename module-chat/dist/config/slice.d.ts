export declare class Slice<T> {
    readonly content: T[];
    readonly hasNext: boolean;
    readonly nextCursor?: (NextCursor | null) | undefined;
    constructor(content: T[], hasNext: boolean, nextCursor?: (NextCursor | null) | undefined);
}
export declare class NextCursor {
    readonly lastId: string;
    readonly lastCreatedAt: Date;
    constructor(lastId: string, lastCreatedAt: Date);
}
