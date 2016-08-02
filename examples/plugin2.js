(function() {

    var Common = Matter.Common;

    var MatterPlugin2 = {
        name: 'matter-plugin-2',

        version: '0.1.0',

        for: 'matter-js@^0.10.0',

        uses: ['matter-plugin-fake'],

        options: {
            thing: 1
        },

        install: function(matter) {
            matter.Engine.create = Common.chain(
                matter.Engine.create,
                MatterPlugin2._engineCreate
            );
        },

        _engineCreate: function(element, options) {
            var engine = this;

            console.log('patched engine create!', engine);
        }
    };

    Matter.Plugin.exports(MatterPlugin2);

    window.MatterPlugin2 = MatterPlugin2;

})();
