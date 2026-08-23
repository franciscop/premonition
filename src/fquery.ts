export default <T extends Element = Element>(
  sel: string,
  base: ParentNode = document,
): T[] => [...base.querySelectorAll<T>(sel)];
