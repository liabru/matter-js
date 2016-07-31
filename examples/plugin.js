(function() {

    var chain = Matter.Common.chain,
        last = Matter.Common.last;

    var MatterPlugin = {
        name: 'matter-plugin',

        version: '0.2.0',

        for: 'matter-js@^0.10.0',

        uses: [
            {
                plugin: 'matter-plugin-2@^0.0.1',
                options: {
                    message: 'hello'
                }
            },
            'matter-plugin-3@^0.10.0'
        ],

        options: {
            thing: 1
        },

        install: function(base) {
            base.Engine.create = chain(
                Matter.Engine.create,
                MatterPlugin.engineCreate
            );

            base.Body.create = chain(
                MatterPlugin.bodyCreate,
                Matter.Body.create
            );
        },

        engineCreate: function(element, options, engine) {
            engine = last(arguments);

            console.log('2nd patched engine create!', engine);
        },

        bodyCreate: function(options) {
            console.log('patched body create!', arguments);
        }
    };

    Matter.Plugin.exports(MatterPlugin);

    window.MatterPlugin = MatterPlugin;

})();
