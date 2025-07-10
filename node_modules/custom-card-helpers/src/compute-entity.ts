export function computeEntity(entityId: string): string {
  return entityId.substr(entityId.indexOf(".") + 1);
}
