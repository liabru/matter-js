(function() {

    var Common = Matter.Common;

    var MatterPlugin = {
        name: 'matter-plugin',

        version: '0.2.0',

        for: 'matter-js@^0.10.0',

        uses: [
            'matter-plugin-2@^0.1.1',
            'matter-plugin-3@^0.10.0'
        ],

        options: {
            thing: 1
        },

        install: function(base) {
            base.Engine.create = Common.chain(
                Matter.Engine.create,
                MatterPlugin._engineCreate
            );

            base.Body.create = Common.chain(
                MatterPlugin._bodyCreate,
                Matter.Body.create
            );
        },

        _engineCreate: function(element, options) {
            var engine = this;

            console.log('2nd patched engine create!', engine);
        },

        _bodyCreate: function(options) {
            console.log('patched body create!', options);
        }
    };

    Matter.Plugin.register(MatterPlugin);

    window.MatterPlugin = MatterPlugin;

})();
