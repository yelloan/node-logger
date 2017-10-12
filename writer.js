'use strict'
const _ = require('lodash')
const prettyOutput = require('prettyoutput')

const internals = {}

/**
 * Log with pretty output formater
 * @param {LogWriter} output
 */
exports.pretty = output => {
    const log = _.assign({}, output.meta)
    output.meta.time = output.meta.time.toISOString()
    log.data = output.data
    const prefix = `${output.message}\n`
    const result = `${prefix}${prettyOutput(log, { maxDepth: 6 }, 2)}`
    process.stdout.write(result)
    process.stdout.write('\n')
}

/**
 * Log in json
 * @param {LogWriter} output
 */
exports.json = output => {
    const log = _.assign({}, output.meta)
    log.time = log.time.toISOString()
    log.data = output.data
    log.message = output.message

    const backup = Error.prototype.toJSON
    Error.prototype.toJSON = internals.errorToJson
    const result = JSON.stringify(log)
    Error.prototype.toJSON = backup

    process.stdout.write(result)
    process.stdout.write('\n')
}

/**
 * Used to override error toJSON function to customize output
 * @return {object}
 */
internals.errorToJson = function() {
    const result = {}

    Object.getOwnPropertyNames(this).forEach(function(key) {
        result[key] = this[key]
    }, this)

    return result
}
