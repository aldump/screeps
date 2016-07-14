/**
 * Created by dump on 26.06.2016.
 */

module.exports = {
    run: function () {
        for(var name in Memory.creeps) {
            if(! Game.creeps[name]) {
                delete Memory.creeps[name];
            }
        }
    }
}

