export default (href, pre = '') => {
  // Already cached
  if (!href) {
    throw new Error(`${pre} the argument has to be an url or a <a> element`);
  }
  if (href.nodeName === 'A') {
    throw new Error(`${pre} argument element is missing the href="" or it is empty`);
  }
  if (href.nodeName) {
    throw new Error(`${pre} expected an anchor <a> element, received "${href.nodeName}"`);
  }
  if (typeof href !== 'string') {
    throw new Error(`${pre} expected a string, received ${typeof href}`);
  }

  return href;
};
