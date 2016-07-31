/**
* The `Matter` module is the top level namespace and includes functions for extending other modules.
*
* @class Matter
*/

var Matter = {};

module.exports = Matter;

var Plugin = require('./Plugin');

(function() {

    /**
     * The library name.
     * @property Matter.name
     * @type {String}
     */
    Matter.name = 'matter-js';

    /**
     * The library version.
     * @property Matter.version
     * @type {String}
     */
    Matter.version = 'master';

    /**
     * The plugins that have been _installed_ through `Matter.Plugin.install`. Read only.
     * @property Matter.used
     * @readOnly
     * @type {Array}
     */
    Matter.used = [];

    /**
     * A list of plugin dependencies to be installed. These are normally set and installed through `Matter.use`.
     * Alternatively set them and install manually through `Plugin.installDependencies`.
     * @property Matter.used
     * @readOnly
     * @type {Array}
     */
    Matter.uses = [];

    /**
     * Installs plugins on the `Matter` namespace.
     * Populates `Matter.used` with an array of the plugins in the order they were applied after dependencies were resolved.
     * See `Common.use` in `Matter.Common` for more information.
     * TODO: add link to wiki
     * @method use
     * @param ...plugins {Function} The plugins to install on `base`.
     */
    Matter.use = function() {
        Matter.uses = Array.prototype.slice.call(arguments);

        Plugin.installDependencies(Matter);
    };

})();
