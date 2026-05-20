/** Redis Stream 엔트리 필드: 평면 배열 [k1,v1,k2,v2,...] → 객체 */
export function fieldsToRecord(fields: string[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    const k = fields[i];
    const v = fields[i + 1];
    if (k !== undefined && v !== undefined) {
      o[k] = v;
    }
  }
  return o;
}

export function redisValueToString(v: unknown): string {
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
