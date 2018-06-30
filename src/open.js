import validate from './validate';

// Load either a URL or a <a> element referenced HTML into the body
export default async function (ref, { history } = {}) {
  try {
    // Accept an <a>, since those will have a property called .href
    const href = validate(ref.href || ref);

    // Retrieve the hash section of it
    const hash = href.split('#').slice(1).join('#');

    // TODO: make sure that the url is not the current one with a fragment

    // .load() already does all the cache and loading checking
    const data = await this.load(href);

    // Merge the data from the new site with the current one
    await this.replace(data.href, data.html, { history });

    return this.init();
  } catch (error) {
    // Manually load the new page
    this.report(error);
    location.href = href;
  }
};
