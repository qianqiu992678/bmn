var log4js = require('log4js');
log4js.configure({

    appenders: {

        ruleConsole: {type: 'console'},

        ruleFile: {

            type: 'dateFile',

            filename: 'logs/server-',

            pattern: 'yyyy-MM-dd.log',

            maxLogSize: 1000000,

            numBackups: 5,

            alwaysIncludePattern: true

        }

    },

    categories: {

        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}

    }

});
module.exports = log4js.getLogger('日志输出');