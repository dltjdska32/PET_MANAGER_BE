export class Slice<T> {
    constructor(
        public readonly content: T[],
        public readonly hasNext: boolean,
        public readonly nextCursor?: NextCursor | null
    ) {



    }
}


export class NextCursor {
    constructor(
        public readonly lastId : string,
        public readonly lastCreatedAt : Date
    ) {
    }
}