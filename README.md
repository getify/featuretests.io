# FeatureTests.io

Feature Tests for JavaScript... as a service!

# Templates

HTML, CSS, and JS templates are organized in `/dev/templates/`, and use [grips](http://github.com/getify/grips) syntax.

`/dev/templates/site.css.json` holds the data (CSS variable values) for the `/dev/web/css/site.css` file that's automatically rendered from the `/dev/templates/css/grips.site.css` template.

`/dev/templates/load.js.json` holds the data for what JS files should be loaded by the `/dev/web/js/load.js` bootstrapper that's automatically rendered from the `/dev/templates/js/grips.load.js` template.

# Running Locally

1. In `/dev/`, run `npm install`
2. Tweak any settings as needed in `/dev.js`, including the localhost port
3. Execute `/start`
4. To start a watcher for rebuilding templates/assets, execute `/dev/build-resources --watch`

## License

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
