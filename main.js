var creepController = require('creepController');
var towerController = require('towerController');
var produceCreeps = require('produceCreeps');
var clearMemory = require('clearMemory');

module.exports.loop = function () {
    clearMemory.run();
    produceCreeps.run();
    creepController.controllCreeps();
    creepController.processCreeps();
    towerController.run();
}