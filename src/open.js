// Load either a URL or a <a> element referenced HTML into the body
export default async function (ref) {
  // Accept an <a>, since those will have a property called .href
  const href = ref.href || ref;

  // TODO: make sure that the url is not the current one with a fragment

  try {
    // .preload() already does all the cache and loading checking
    const data = await this.preload(href);

    // Merge the data from the new site with the current one
    await this.merge(data);

    return this.init();
  } catch (error) {
    // Manually load the new page
    console.log('ERROR:', error);
    location.href = href;
  }
};
