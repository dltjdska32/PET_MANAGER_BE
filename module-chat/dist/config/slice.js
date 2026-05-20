"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextCursor = exports.Slice = void 0;
class Slice {
    content;
    hasNext;
    nextCursor;
    constructor(content, hasNext, nextCursor) {
        this.content = content;
        this.hasNext = hasNext;
        this.nextCursor = nextCursor;
    }
}
exports.Slice = Slice;
class NextCursor {
    lastId;
    lastCreatedAt;
    constructor(lastId, lastCreatedAt) {
        this.lastId = lastId;
        this.lastCreatedAt = lastCreatedAt;
    }
}
exports.NextCursor = NextCursor;
//# sourceMappingURL=slice.js.map