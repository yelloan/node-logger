'use strict'
/* eslint-disable no-shadow */

const { test } = require('ava')
const sinon = require('sinon')

const writer = require('../writer')
const logger = require('../index')

const stdoutWrite = process.stdout.write

test.beforeEach(t => {
    process.stdout.write = () => {}
    logger.setOutput([])
})

test.afterEach(t => {
    process.stdout.write = stdoutWrite
})

test('Json writer should write a Json Object with expected data and an \\n to stdout if enabled', t => {
    const now = new Date()

    const spy = sinon.spy(process.stdout, 'write')
    const timersStub = sinon.useFakeTimers(now.getTime())

    const meta = {level: 'warn', namespace: 'test1', time: now, contextId: 'ctxId', field1: 'value1'}
    const message = 'test'
    const data = { someData: 'someValue' }

    writer.json({meta, message, data})

    t.true(spy.calledTwice)

    const firstCall = spy.firstCall.args[0]
    const secondCall = spy.secondCall.args[0]
    const parsedObject = JSON.parse(firstCall)

    t.is(parsedObject.namespace, 'test1')
    t.is(parsedObject.level, 'warn')
    t.is(parsedObject.time, now.toISOString())
    t.is(parsedObject.contextId, 'ctxId')
    t.is(parsedObject.field1, 'value1')
    t.is(parsedObject.message, message)
    t.deepEqual(parsedObject.data, data)
    t.is(secondCall, '\n')

    process.stdout.write.restore()
    timersStub.restore()
})

test('Json writer should work if used by logger', t => {
    const now = new Date()

    logger.setNamespaces('test:*')
    logger.setLevel('info')
    logger.setOutput(writer.json)

    const spy = sinon.spy(process.stdout, 'write')
    const timersStub = sinon.useFakeTimers(now.getTime())

    const log = logger('test:subTest')
    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(spy.calledTwice)

    const firstCall = spy.firstCall.args[0]
    const secondCall = spy.secondCall.args[0]
    const parsedObject = JSON.parse(firstCall)

    t.is(parsedObject.namespace, 'test:subTest')
    t.is(parsedObject.level, 'warn')
    t.is(parsedObject.time, now.toISOString())
    t.is(parsedObject.contextId, 'ctxId')
    t.is(parsedObject.message, 'test')
    t.deepEqual(parsedObject.data, { someData: 'someValue' })
    t.is(secondCall, '\n')

    process.stdout.write.restore()
    timersStub.restore()
})

test('pretty writer should write expected data and an \\n to stdout if enabled', t => {
    const now = new Date()

    const spy = sinon.spy(process.stdout, 'write')
    const timersStub = sinon.useFakeTimers(now.getTime())

    const meta = {level: 'warn', namespace: 'test1', time: now, contextId: 'ctxId', field1: 'value1'}
    const message = 'test'
    const data = { someData: 'someValue' }

    writer.pretty({meta, message, data})

    t.true(spy.calledTwice)

    const firstCall = spy.firstCall.args[0]
    const secondCall = spy.secondCall.args[0]

    let expected = 'test\n'
    expected += '\u001b[32m  level: \u001b[39m    warn\n'
    expected += '\u001b[32m  namespace: \u001b[39mtest1\n'
    expected += `\u001b[32m  time: \u001b[39m     ${now.toString()}\n`
    expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
    expected += '\u001b[32m  field1: \u001b[39m   value1\n'
    expected += '\u001b[32m  data: \u001b[39m\n'
    expected += '\u001b[32m    someData: \u001b[39msomeValue\n'

    t.is(firstCall, expected)
    t.is(secondCall, '\n')

    process.stdout.write.restore()
    timersStub.restore()
})

test('pretty writer should work if used by logger', t => {
    const now = new Date()

    logger.setNamespaces('test:*')
    logger.setLevel('info')
    logger.setOutput(writer.pretty)

    const spy = sinon.spy(process.stdout, 'write')
    const timersStub = sinon.useFakeTimers(now.getTime())

    const log = logger('test:subTest')
    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(spy.calledTwice)

    const firstCall = spy.firstCall.args[0]
    const secondCall = spy.secondCall.args[0]

    let expected = 'test\n'
    expected += '\u001b[32m  level: \u001b[39m    warn\n'
    expected += `\u001b[32m  time: \u001b[39m     ${now.toString()}\n`
    expected += '\u001b[32m  namespace: \u001b[39mtest:subTest\n'
    expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
    expected += '\u001b[32m  data: \u001b[39m\n'
    expected += '\u001b[32m    someData: \u001b[39msomeValue\n'

    t.is(firstCall, expected)
    t.is(secondCall, '\n')

    process.stdout.write.restore()
    timersStub.restore()
})