"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldsToRecord = fieldsToRecord;
exports.redisValueToString = redisValueToString;
function fieldsToRecord(fields) {
    const o = {};
    for (let i = 0; i < fields.length; i += 2) {
        const k = fields[i];
        const v = fields[i + 1];
        if (k !== undefined && v !== undefined) {
            o[k] = v;
        }
    }
    return o;
}
function redisValueToString(v) {
    if (v == null) {
        return '';
    }
    if (typeof v === 'string') {
        return v;
    }
    if (Buffer.isBuffer(v)) {
        return v.toString('utf8');
    }
    return String(v);
}
//# sourceMappingURL=stream-fields.util.js.map