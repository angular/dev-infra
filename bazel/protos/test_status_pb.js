/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.blaze = (function() {

    /**
     * Namespace blaze.
     * @exports blaze
     * @namespace
     */
    var blaze = {};

    /**
     * FailedTestCasesStatus enum.
     * @name blaze.FailedTestCasesStatus
     * @enum {number}
     * @property {number} FULL=1 Information about every test case is available.
     * @property {number} PARTIAL=2 Information about some test cases may be missing.
     * @property {number} NOT_AVAILABLE=3 No information about individual test cases.
     * @property {number} EMPTY=4 This is an empty object still without data.
     */
    blaze.FailedTestCasesStatus = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[1] = "FULL"] = 1;
        values[valuesById[2] = "PARTIAL"] = 2;
        values[valuesById[3] = "NOT_AVAILABLE"] = 3;
        values[valuesById[4] = "EMPTY"] = 4;
        return values;
    })();

    /**
     * BlazeTestStatus enum.
     * @name blaze.BlazeTestStatus
     * @enum {number}
     * @property {number} NO_STATUS=0 NO_STATUS value
     * @property {number} PASSED=1 PASSED value
     * @property {number} FLAKY=2 FLAKY value
     * @property {number} TIMEOUT=3 TIMEOUT value
     * @property {number} FAILED=4 FAILED value
     * @property {number} INCOMPLETE=5 INCOMPLETE value
     * @property {number} REMOTE_FAILURE=6 REMOTE_FAILURE value
     * @property {number} FAILED_TO_BUILD=7 FAILED_TO_BUILD value
     * @property {number} BLAZE_HALTED_BEFORE_TESTING=8 BLAZE_HALTED_BEFORE_TESTING value
     */
    blaze.BlazeTestStatus = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "NO_STATUS"] = 0;
        values[valuesById[1] = "PASSED"] = 1;
        values[valuesById[2] = "FLAKY"] = 2;
        values[valuesById[3] = "TIMEOUT"] = 3;
        values[valuesById[4] = "FAILED"] = 4;
        values[valuesById[5] = "INCOMPLETE"] = 5;
        values[valuesById[6] = "REMOTE_FAILURE"] = 6;
        values[valuesById[7] = "FAILED_TO_BUILD"] = 7;
        values[valuesById[8] = "BLAZE_HALTED_BEFORE_TESTING"] = 8;
        return values;
    })();

    blaze.TestCase = (function() {

        /**
         * Properties of a TestCase.
         * @memberof blaze
         * @interface ITestCase
         * @property {Array.<blaze.ITestCase>|null} [child] TestCase child
         * @property {string|null} [name] TestCase name
         * @property {string|null} [className] TestCase className
         * @property {number|Long|null} [runDurationMillis] TestCase runDurationMillis
         * @property {string|null} [result] TestCase result
         * @property {blaze.TestCase.Type|null} [type] TestCase type
         * @property {blaze.TestCase.Status|null} [status] TestCase status
         * @property {boolean|null} [run] TestCase run
         */

        /**
         * Constructs a new TestCase.
         * @memberof blaze
         * @classdesc Represents a TestCase.
         * @implements ITestCase
         * @constructor
         * @param {blaze.ITestCase=} [properties] Properties to set
         */
        function TestCase(properties) {
            this.child = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TestCase child.
         * @member {Array.<blaze.ITestCase>} child
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.child = $util.emptyArray;

        /**
         * TestCase name.
         * @member {string} name
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.name = "";

        /**
         * TestCase className.
         * @member {string} className
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.className = "";

        /**
         * TestCase runDurationMillis.
         * @member {number|Long} runDurationMillis
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.runDurationMillis = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * TestCase result.
         * @member {string} result
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.result = "";

        /**
         * TestCase type.
         * @member {blaze.TestCase.Type} type
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.type = 0;

        /**
         * TestCase status.
         * @member {blaze.TestCase.Status} status
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.status = 0;

        /**
         * TestCase run.
         * @member {boolean} run
         * @memberof blaze.TestCase
         * @instance
         */
        TestCase.prototype.run = true;

        /**
         * Creates a new TestCase instance using the specified properties.
         * @function create
         * @memberof blaze.TestCase
         * @static
         * @param {blaze.ITestCase=} [properties] Properties to set
         * @returns {blaze.TestCase} TestCase instance
         */
        TestCase.create = function create(properties) {
            return new TestCase(properties);
        };

        /**
         * Encodes the specified TestCase message. Does not implicitly {@link blaze.TestCase.verify|verify} messages.
         * @function encode
         * @memberof blaze.TestCase
         * @static
         * @param {blaze.ITestCase} message TestCase message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TestCase.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.child != null && message.child.length)
                for (var i = 0; i < message.child.length; ++i)
                    $root.blaze.TestCase.encode(message.child[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.className != null && Object.hasOwnProperty.call(message, "className"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.className);
            if (message.runDurationMillis != null && Object.hasOwnProperty.call(message, "runDurationMillis"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.runDurationMillis);
            if (message.result != null && Object.hasOwnProperty.call(message, "result"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.result);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 6, wireType 0 =*/48).int32(message.type);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.status);
            if (message.run != null && Object.hasOwnProperty.call(message, "run"))
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.run);
            return writer;
        };

        /**
         * Encodes the specified TestCase message, length delimited. Does not implicitly {@link blaze.TestCase.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blaze.TestCase
         * @static
         * @param {blaze.ITestCase} message TestCase message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TestCase.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TestCase message from the specified reader or buffer.
         * @function decode
         * @memberof blaze.TestCase
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blaze.TestCase} TestCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TestCase.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blaze.TestCase();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.child && message.child.length))
                        message.child = [];
                    message.child.push($root.blaze.TestCase.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.name = reader.string();
                    break;
                case 3:
                    message.className = reader.string();
                    break;
                case 4:
                    message.runDurationMillis = reader.int64();
                    break;
                case 5:
                    message.result = reader.string();
                    break;
                case 6:
                    message.type = reader.int32();
                    break;
                case 7:
                    message.status = reader.int32();
                    break;
                case 8:
                    message.run = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TestCase message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blaze.TestCase
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blaze.TestCase} TestCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TestCase.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TestCase message.
         * @function verify
         * @memberof blaze.TestCase
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TestCase.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.child != null && message.hasOwnProperty("child")) {
                if (!Array.isArray(message.child))
                    return "child: array expected";
                for (var i = 0; i < message.child.length; ++i) {
                    var error = $root.blaze.TestCase.verify(message.child[i]);
                    if (error)
                        return "child." + error;
                }
            }
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.className != null && message.hasOwnProperty("className"))
                if (!$util.isString(message.className))
                    return "className: string expected";
            if (message.runDurationMillis != null && message.hasOwnProperty("runDurationMillis"))
                if (!$util.isInteger(message.runDurationMillis) && !(message.runDurationMillis && $util.isInteger(message.runDurationMillis.low) && $util.isInteger(message.runDurationMillis.high)))
                    return "runDurationMillis: integer|Long expected";
            if (message.result != null && message.hasOwnProperty("result"))
                if (!$util.isString(message.result))
                    return "result: string expected";
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.run != null && message.hasOwnProperty("run"))
                if (typeof message.run !== "boolean")
                    return "run: boolean expected";
            return null;
        };

        /**
         * Creates a TestCase message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blaze.TestCase
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blaze.TestCase} TestCase
         */
        TestCase.fromObject = function fromObject(object) {
            if (object instanceof $root.blaze.TestCase)
                return object;
            var message = new $root.blaze.TestCase();
            if (object.child) {
                if (!Array.isArray(object.child))
                    throw TypeError(".blaze.TestCase.child: array expected");
                message.child = [];
                for (var i = 0; i < object.child.length; ++i) {
                    if (typeof object.child[i] !== "object")
                        throw TypeError(".blaze.TestCase.child: object expected");
                    message.child[i] = $root.blaze.TestCase.fromObject(object.child[i]);
                }
            }
            if (object.name != null)
                message.name = String(object.name);
            if (object.className != null)
                message.className = String(object.className);
            if (object.runDurationMillis != null)
                if ($util.Long)
                    (message.runDurationMillis = $util.Long.fromValue(object.runDurationMillis)).unsigned = false;
                else if (typeof object.runDurationMillis === "string")
                    message.runDurationMillis = parseInt(object.runDurationMillis, 10);
                else if (typeof object.runDurationMillis === "number")
                    message.runDurationMillis = object.runDurationMillis;
                else if (typeof object.runDurationMillis === "object")
                    message.runDurationMillis = new $util.LongBits(object.runDurationMillis.low >>> 0, object.runDurationMillis.high >>> 0).toNumber();
            if (object.result != null)
                message.result = String(object.result);
            switch (object.type) {
            case "TEST_CASE":
            case 0:
                message.type = 0;
                break;
            case "TEST_SUITE":
            case 1:
                message.type = 1;
                break;
            case "TEST_DECORATOR":
            case 2:
                message.type = 2;
                break;
            case "UNKNOWN":
            case 3:
                message.type = 3;
                break;
            }
            switch (object.status) {
            case "PASSED":
            case 0:
                message.status = 0;
                break;
            case "FAILED":
            case 1:
                message.status = 1;
                break;
            case "ERROR":
            case 2:
                message.status = 2;
                break;
            }
            if (object.run != null)
                message.run = Boolean(object.run);
            return message;
        };

        /**
         * Creates a plain object from a TestCase message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blaze.TestCase
         * @static
         * @param {blaze.TestCase} message TestCase
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TestCase.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.child = [];
            if (options.defaults) {
                object.name = "";
                object.className = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.runDurationMillis = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.runDurationMillis = options.longs === String ? "0" : 0;
                object.result = "";
                object.type = options.enums === String ? "TEST_CASE" : 0;
                object.status = options.enums === String ? "PASSED" : 0;
                object.run = true;
            }
            if (message.child && message.child.length) {
                object.child = [];
                for (var j = 0; j < message.child.length; ++j)
                    object.child[j] = $root.blaze.TestCase.toObject(message.child[j], options);
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.className != null && message.hasOwnProperty("className"))
                object.className = message.className;
            if (message.runDurationMillis != null && message.hasOwnProperty("runDurationMillis"))
                if (typeof message.runDurationMillis === "number")
                    object.runDurationMillis = options.longs === String ? String(message.runDurationMillis) : message.runDurationMillis;
                else
                    object.runDurationMillis = options.longs === String ? $util.Long.prototype.toString.call(message.runDurationMillis) : options.longs === Number ? new $util.LongBits(message.runDurationMillis.low >>> 0, message.runDurationMillis.high >>> 0).toNumber() : message.runDurationMillis;
            if (message.result != null && message.hasOwnProperty("result"))
                object.result = message.result;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.blaze.TestCase.Type[message.type] : message.type;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.blaze.TestCase.Status[message.status] : message.status;
            if (message.run != null && message.hasOwnProperty("run"))
                object.run = message.run;
            return object;
        };

        /**
         * Converts this TestCase to JSON.
         * @function toJSON
         * @memberof blaze.TestCase
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TestCase.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Type enum.
         * @name blaze.TestCase.Type
         * @enum {number}
         * @property {number} TEST_CASE=0 TEST_CASE value
         * @property {number} TEST_SUITE=1 TEST_SUITE value
         * @property {number} TEST_DECORATOR=2 TEST_DECORATOR value
         * @property {number} UNKNOWN=3 UNKNOWN value
         */
        TestCase.Type = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "TEST_CASE"] = 0;
            values[valuesById[1] = "TEST_SUITE"] = 1;
            values[valuesById[2] = "TEST_DECORATOR"] = 2;
            values[valuesById[3] = "UNKNOWN"] = 3;
            return values;
        })();

        /**
         * Status enum.
         * @name blaze.TestCase.Status
         * @enum {number}
         * @property {number} PASSED=0 PASSED value
         * @property {number} FAILED=1 FAILED value
         * @property {number} ERROR=2 ERROR value
         */
        TestCase.Status = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "PASSED"] = 0;
            values[valuesById[1] = "FAILED"] = 1;
            values[valuesById[2] = "ERROR"] = 2;
            return values;
        })();

        return TestCase;
    })();

    blaze.TestResultData = (function() {

        /**
         * Properties of a TestResultData.
         * @memberof blaze
         * @interface ITestResultData
         * @property {boolean|null} [cachable] TestResultData cachable
         * @property {boolean|null} [testPassed] TestResultData testPassed
         * @property {blaze.BlazeTestStatus|null} [status] TestResultData status
         * @property {string|null} [statusDetails] TestResultData statusDetails
         * @property {Array.<string>|null} [failedLogs] TestResultData failedLogs
         * @property {Array.<string>|null} [warning] TestResultData warning
         * @property {boolean|null} [hasCoverage] TestResultData hasCoverage
         * @property {boolean|null} [remotelyCached] TestResultData remotelyCached
         * @property {boolean|null} [isRemoteStrategy] TestResultData isRemoteStrategy
         * @property {Array.<number|Long>|null} [testTimes] TestResultData testTimes
         * @property {string|null} [passedLog] TestResultData passedLog
         * @property {Array.<number|Long>|null} [testProcessTimes] TestResultData testProcessTimes
         * @property {number|Long|null} [runDurationMillis] TestResultData runDurationMillis
         * @property {number|Long|null} [startTimeMillisEpoch] TestResultData startTimeMillisEpoch
         * @property {blaze.ITestCase|null} [testCase] TestResultData testCase
         * @property {blaze.FailedTestCasesStatus|null} [failedStatus] TestResultData failedStatus
         */

        /**
         * Constructs a new TestResultData.
         * @memberof blaze
         * @classdesc Represents a TestResultData.
         * @implements ITestResultData
         * @constructor
         * @param {blaze.ITestResultData=} [properties] Properties to set
         */
        function TestResultData(properties) {
            this.failedLogs = [];
            this.warning = [];
            this.testTimes = [];
            this.testProcessTimes = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TestResultData cachable.
         * @member {boolean} cachable
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.cachable = false;

        /**
         * TestResultData testPassed.
         * @member {boolean} testPassed
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.testPassed = false;

        /**
         * TestResultData status.
         * @member {blaze.BlazeTestStatus} status
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.status = 0;

        /**
         * TestResultData statusDetails.
         * @member {string} statusDetails
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.statusDetails = "";

        /**
         * TestResultData failedLogs.
         * @member {Array.<string>} failedLogs
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.failedLogs = $util.emptyArray;

        /**
         * TestResultData warning.
         * @member {Array.<string>} warning
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.warning = $util.emptyArray;

        /**
         * TestResultData hasCoverage.
         * @member {boolean} hasCoverage
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.hasCoverage = false;

        /**
         * TestResultData remotelyCached.
         * @member {boolean} remotelyCached
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.remotelyCached = false;

        /**
         * TestResultData isRemoteStrategy.
         * @member {boolean} isRemoteStrategy
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.isRemoteStrategy = false;

        /**
         * TestResultData testTimes.
         * @member {Array.<number|Long>} testTimes
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.testTimes = $util.emptyArray;

        /**
         * TestResultData passedLog.
         * @member {string} passedLog
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.passedLog = "";

        /**
         * TestResultData testProcessTimes.
         * @member {Array.<number|Long>} testProcessTimes
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.testProcessTimes = $util.emptyArray;

        /**
         * TestResultData runDurationMillis.
         * @member {number|Long} runDurationMillis
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.runDurationMillis = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * TestResultData startTimeMillisEpoch.
         * @member {number|Long} startTimeMillisEpoch
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.startTimeMillisEpoch = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * TestResultData testCase.
         * @member {blaze.ITestCase|null|undefined} testCase
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.testCase = null;

        /**
         * TestResultData failedStatus.
         * @member {blaze.FailedTestCasesStatus} failedStatus
         * @memberof blaze.TestResultData
         * @instance
         */
        TestResultData.prototype.failedStatus = 1;

        /**
         * Creates a new TestResultData instance using the specified properties.
         * @function create
         * @memberof blaze.TestResultData
         * @static
         * @param {blaze.ITestResultData=} [properties] Properties to set
         * @returns {blaze.TestResultData} TestResultData instance
         */
        TestResultData.create = function create(properties) {
            return new TestResultData(properties);
        };

        /**
         * Encodes the specified TestResultData message. Does not implicitly {@link blaze.TestResultData.verify|verify} messages.
         * @function encode
         * @memberof blaze.TestResultData
         * @static
         * @param {blaze.ITestResultData} message TestResultData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TestResultData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.cachable != null && Object.hasOwnProperty.call(message, "cachable"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.cachable);
            if (message.testPassed != null && Object.hasOwnProperty.call(message, "testPassed"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.testPassed);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.status);
            if (message.failedLogs != null && message.failedLogs.length)
                for (var i = 0; i < message.failedLogs.length; ++i)
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.failedLogs[i]);
            if (message.warning != null && message.warning.length)
                for (var i = 0; i < message.warning.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.warning[i]);
            if (message.hasCoverage != null && Object.hasOwnProperty.call(message, "hasCoverage"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.hasCoverage);
            if (message.remotelyCached != null && Object.hasOwnProperty.call(message, "remotelyCached"))
                writer.uint32(/* id 7, wireType 0 =*/56).bool(message.remotelyCached);
            if (message.isRemoteStrategy != null && Object.hasOwnProperty.call(message, "isRemoteStrategy"))
                writer.uint32(/* id 8, wireType 0 =*/64).bool(message.isRemoteStrategy);
            if (message.testTimes != null && message.testTimes.length)
                for (var i = 0; i < message.testTimes.length; ++i)
                    writer.uint32(/* id 9, wireType 0 =*/72).int64(message.testTimes[i]);
            if (message.passedLog != null && Object.hasOwnProperty.call(message, "passedLog"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.passedLog);
            if (message.testProcessTimes != null && message.testProcessTimes.length)
                for (var i = 0; i < message.testProcessTimes.length; ++i)
                    writer.uint32(/* id 11, wireType 0 =*/88).int64(message.testProcessTimes[i]);
            if (message.runDurationMillis != null && Object.hasOwnProperty.call(message, "runDurationMillis"))
                writer.uint32(/* id 12, wireType 0 =*/96).int64(message.runDurationMillis);
            if (message.testCase != null && Object.hasOwnProperty.call(message, "testCase"))
                $root.blaze.TestCase.encode(message.testCase, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.failedStatus != null && Object.hasOwnProperty.call(message, "failedStatus"))
                writer.uint32(/* id 14, wireType 0 =*/112).int32(message.failedStatus);
            if (message.startTimeMillisEpoch != null && Object.hasOwnProperty.call(message, "startTimeMillisEpoch"))
                writer.uint32(/* id 15, wireType 0 =*/120).int64(message.startTimeMillisEpoch);
            if (message.statusDetails != null && Object.hasOwnProperty.call(message, "statusDetails"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.statusDetails);
            return writer;
        };

        /**
         * Encodes the specified TestResultData message, length delimited. Does not implicitly {@link blaze.TestResultData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof blaze.TestResultData
         * @static
         * @param {blaze.ITestResultData} message TestResultData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TestResultData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TestResultData message from the specified reader or buffer.
         * @function decode
         * @memberof blaze.TestResultData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {blaze.TestResultData} TestResultData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TestResultData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.blaze.TestResultData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.cachable = reader.bool();
                    break;
                case 2:
                    message.testPassed = reader.bool();
                    break;
                case 3:
                    message.status = reader.int32();
                    break;
                case 16:
                    message.statusDetails = reader.string();
                    break;
                case 4:
                    if (!(message.failedLogs && message.failedLogs.length))
                        message.failedLogs = [];
                    message.failedLogs.push(reader.string());
                    break;
                case 5:
                    if (!(message.warning && message.warning.length))
                        message.warning = [];
                    message.warning.push(reader.string());
                    break;
                case 6:
                    message.hasCoverage = reader.bool();
                    break;
                case 7:
                    message.remotelyCached = reader.bool();
                    break;
                case 8:
                    message.isRemoteStrategy = reader.bool();
                    break;
                case 9:
                    if (!(message.testTimes && message.testTimes.length))
                        message.testTimes = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.testTimes.push(reader.int64());
                    } else
                        message.testTimes.push(reader.int64());
                    break;
                case 10:
                    message.passedLog = reader.string();
                    break;
                case 11:
                    if (!(message.testProcessTimes && message.testProcessTimes.length))
                        message.testProcessTimes = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.testProcessTimes.push(reader.int64());
                    } else
                        message.testProcessTimes.push(reader.int64());
                    break;
                case 12:
                    message.runDurationMillis = reader.int64();
                    break;
                case 15:
                    message.startTimeMillisEpoch = reader.int64();
                    break;
                case 13:
                    message.testCase = $root.blaze.TestCase.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.failedStatus = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TestResultData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof blaze.TestResultData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {blaze.TestResultData} TestResultData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TestResultData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TestResultData message.
         * @function verify
         * @memberof blaze.TestResultData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TestResultData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.cachable != null && message.hasOwnProperty("cachable"))
                if (typeof message.cachable !== "boolean")
                    return "cachable: boolean expected";
            if (message.testPassed != null && message.hasOwnProperty("testPassed"))
                if (typeof message.testPassed !== "boolean")
                    return "testPassed: boolean expected";
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    break;
                }
            if (message.statusDetails != null && message.hasOwnProperty("statusDetails"))
                if (!$util.isString(message.statusDetails))
                    return "statusDetails: string expected";
            if (message.failedLogs != null && message.hasOwnProperty("failedLogs")) {
                if (!Array.isArray(message.failedLogs))
                    return "failedLogs: array expected";
                for (var i = 0; i < message.failedLogs.length; ++i)
                    if (!$util.isString(message.failedLogs[i]))
                        return "failedLogs: string[] expected";
            }
            if (message.warning != null && message.hasOwnProperty("warning")) {
                if (!Array.isArray(message.warning))
                    return "warning: array expected";
                for (var i = 0; i < message.warning.length; ++i)
                    if (!$util.isString(message.warning[i]))
                        return "warning: string[] expected";
            }
            if (message.hasCoverage != null && message.hasOwnProperty("hasCoverage"))
                if (typeof message.hasCoverage !== "boolean")
                    return "hasCoverage: boolean expected";
            if (message.remotelyCached != null && message.hasOwnProperty("remotelyCached"))
                if (typeof message.remotelyCached !== "boolean")
                    return "remotelyCached: boolean expected";
            if (message.isRemoteStrategy != null && message.hasOwnProperty("isRemoteStrategy"))
                if (typeof message.isRemoteStrategy !== "boolean")
                    return "isRemoteStrategy: boolean expected";
            if (message.testTimes != null && message.hasOwnProperty("testTimes")) {
                if (!Array.isArray(message.testTimes))
                    return "testTimes: array expected";
                for (var i = 0; i < message.testTimes.length; ++i)
                    if (!$util.isInteger(message.testTimes[i]) && !(message.testTimes[i] && $util.isInteger(message.testTimes[i].low) && $util.isInteger(message.testTimes[i].high)))
                        return "testTimes: integer|Long[] expected";
            }
            if (message.passedLog != null && message.hasOwnProperty("passedLog"))
                if (!$util.isString(message.passedLog))
                    return "passedLog: string expected";
            if (message.testProcessTimes != null && message.hasOwnProperty("testProcessTimes")) {
                if (!Array.isArray(message.testProcessTimes))
                    return "testProcessTimes: array expected";
                for (var i = 0; i < message.testProcessTimes.length; ++i)
                    if (!$util.isInteger(message.testProcessTimes[i]) && !(message.testProcessTimes[i] && $util.isInteger(message.testProcessTimes[i].low) && $util.isInteger(message.testProcessTimes[i].high)))
                        return "testProcessTimes: integer|Long[] expected";
            }
            if (message.runDurationMillis != null && message.hasOwnProperty("runDurationMillis"))
                if (!$util.isInteger(message.runDurationMillis) && !(message.runDurationMillis && $util.isInteger(message.runDurationMillis.low) && $util.isInteger(message.runDurationMillis.high)))
                    return "runDurationMillis: integer|Long expected";
            if (message.startTimeMillisEpoch != null && message.hasOwnProperty("startTimeMillisEpoch"))
                if (!$util.isInteger(message.startTimeMillisEpoch) && !(message.startTimeMillisEpoch && $util.isInteger(message.startTimeMillisEpoch.low) && $util.isInteger(message.startTimeMillisEpoch.high)))
                    return "startTimeMillisEpoch: integer|Long expected";
            if (message.testCase != null && message.hasOwnProperty("testCase")) {
                var error = $root.blaze.TestCase.verify(message.testCase);
                if (error)
                    return "testCase." + error;
            }
            if (message.failedStatus != null && message.hasOwnProperty("failedStatus"))
                switch (message.failedStatus) {
                default:
                    return "failedStatus: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            return null;
        };

        /**
         * Creates a TestResultData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof blaze.TestResultData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {blaze.TestResultData} TestResultData
         */
        TestResultData.fromObject = function fromObject(object) {
            if (object instanceof $root.blaze.TestResultData)
                return object;
            var message = new $root.blaze.TestResultData();
            if (object.cachable != null)
                message.cachable = Boolean(object.cachable);
            if (object.testPassed != null)
                message.testPassed = Boolean(object.testPassed);
            switch (object.status) {
            case "NO_STATUS":
            case 0:
                message.status = 0;
                break;
            case "PASSED":
            case 1:
                message.status = 1;
                break;
            case "FLAKY":
            case 2:
                message.status = 2;
                break;
            case "TIMEOUT":
            case 3:
                message.status = 3;
                break;
            case "FAILED":
            case 4:
                message.status = 4;
                break;
            case "INCOMPLETE":
            case 5:
                message.status = 5;
                break;
            case "REMOTE_FAILURE":
            case 6:
                message.status = 6;
                break;
            case "FAILED_TO_BUILD":
            case 7:
                message.status = 7;
                break;
            case "BLAZE_HALTED_BEFORE_TESTING":
            case 8:
                message.status = 8;
                break;
            }
            if (object.statusDetails != null)
                message.statusDetails = String(object.statusDetails);
            if (object.failedLogs) {
                if (!Array.isArray(object.failedLogs))
                    throw TypeError(".blaze.TestResultData.failedLogs: array expected");
                message.failedLogs = [];
                for (var i = 0; i < object.failedLogs.length; ++i)
                    message.failedLogs[i] = String(object.failedLogs[i]);
            }
            if (object.warning) {
                if (!Array.isArray(object.warning))
                    throw TypeError(".blaze.TestResultData.warning: array expected");
                message.warning = [];
                for (var i = 0; i < object.warning.length; ++i)
                    message.warning[i] = String(object.warning[i]);
            }
            if (object.hasCoverage != null)
                message.hasCoverage = Boolean(object.hasCoverage);
            if (object.remotelyCached != null)
                message.remotelyCached = Boolean(object.remotelyCached);
            if (object.isRemoteStrategy != null)
                message.isRemoteStrategy = Boolean(object.isRemoteStrategy);
            if (object.testTimes) {
                if (!Array.isArray(object.testTimes))
                    throw TypeError(".blaze.TestResultData.testTimes: array expected");
                message.testTimes = [];
                for (var i = 0; i < object.testTimes.length; ++i)
                    if ($util.Long)
                        (message.testTimes[i] = $util.Long.fromValue(object.testTimes[i])).unsigned = false;
                    else if (typeof object.testTimes[i] === "string")
                        message.testTimes[i] = parseInt(object.testTimes[i], 10);
                    else if (typeof object.testTimes[i] === "number")
                        message.testTimes[i] = object.testTimes[i];
                    else if (typeof object.testTimes[i] === "object")
                        message.testTimes[i] = new $util.LongBits(object.testTimes[i].low >>> 0, object.testTimes[i].high >>> 0).toNumber();
            }
            if (object.passedLog != null)
                message.passedLog = String(object.passedLog);
            if (object.testProcessTimes) {
                if (!Array.isArray(object.testProcessTimes))
                    throw TypeError(".blaze.TestResultData.testProcessTimes: array expected");
                message.testProcessTimes = [];
                for (var i = 0; i < object.testProcessTimes.length; ++i)
                    if ($util.Long)
                        (message.testProcessTimes[i] = $util.Long.fromValue(object.testProcessTimes[i])).unsigned = false;
                    else if (typeof object.testProcessTimes[i] === "string")
                        message.testProcessTimes[i] = parseInt(object.testProcessTimes[i], 10);
                    else if (typeof object.testProcessTimes[i] === "number")
                        message.testProcessTimes[i] = object.testProcessTimes[i];
                    else if (typeof object.testProcessTimes[i] === "object")
                        message.testProcessTimes[i] = new $util.LongBits(object.testProcessTimes[i].low >>> 0, object.testProcessTimes[i].high >>> 0).toNumber();
            }
            if (object.runDurationMillis != null)
                if ($util.Long)
                    (message.runDurationMillis = $util.Long.fromValue(object.runDurationMillis)).unsigned = false;
                else if (typeof object.runDurationMillis === "string")
                    message.runDurationMillis = parseInt(object.runDurationMillis, 10);
                else if (typeof object.runDurationMillis === "number")
                    message.runDurationMillis = object.runDurationMillis;
                else if (typeof object.runDurationMillis === "object")
                    message.runDurationMillis = new $util.LongBits(object.runDurationMillis.low >>> 0, object.runDurationMillis.high >>> 0).toNumber();
            if (object.startTimeMillisEpoch != null)
                if ($util.Long)
                    (message.startTimeMillisEpoch = $util.Long.fromValue(object.startTimeMillisEpoch)).unsigned = false;
                else if (typeof object.startTimeMillisEpoch === "string")
                    message.startTimeMillisEpoch = parseInt(object.startTimeMillisEpoch, 10);
                else if (typeof object.startTimeMillisEpoch === "number")
                    message.startTimeMillisEpoch = object.startTimeMillisEpoch;
                else if (typeof object.startTimeMillisEpoch === "object")
                    message.startTimeMillisEpoch = new $util.LongBits(object.startTimeMillisEpoch.low >>> 0, object.startTimeMillisEpoch.high >>> 0).toNumber();
            if (object.testCase != null) {
                if (typeof object.testCase !== "object")
                    throw TypeError(".blaze.TestResultData.testCase: object expected");
                message.testCase = $root.blaze.TestCase.fromObject(object.testCase);
            }
            switch (object.failedStatus) {
            case "FULL":
            case 1:
                message.failedStatus = 1;
                break;
            case "PARTIAL":
            case 2:
                message.failedStatus = 2;
                break;
            case "NOT_AVAILABLE":
            case 3:
                message.failedStatus = 3;
                break;
            case "EMPTY":
            case 4:
                message.failedStatus = 4;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a TestResultData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof blaze.TestResultData
         * @static
         * @param {blaze.TestResultData} message TestResultData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TestResultData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.failedLogs = [];
                object.warning = [];
                object.testTimes = [];
                object.testProcessTimes = [];
            }
            if (options.defaults) {
                object.cachable = false;
                object.testPassed = false;
                object.status = options.enums === String ? "NO_STATUS" : 0;
                object.hasCoverage = false;
                object.remotelyCached = false;
                object.isRemoteStrategy = false;
                object.passedLog = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.runDurationMillis = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.runDurationMillis = options.longs === String ? "0" : 0;
                object.testCase = null;
                object.failedStatus = options.enums === String ? "FULL" : 1;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.startTimeMillisEpoch = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.startTimeMillisEpoch = options.longs === String ? "0" : 0;
                object.statusDetails = "";
            }
            if (message.cachable != null && message.hasOwnProperty("cachable"))
                object.cachable = message.cachable;
            if (message.testPassed != null && message.hasOwnProperty("testPassed"))
                object.testPassed = message.testPassed;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.blaze.BlazeTestStatus[message.status] : message.status;
            if (message.failedLogs && message.failedLogs.length) {
                object.failedLogs = [];
                for (var j = 0; j < message.failedLogs.length; ++j)
                    object.failedLogs[j] = message.failedLogs[j];
            }
            if (message.warning && message.warning.length) {
                object.warning = [];
                for (var j = 0; j < message.warning.length; ++j)
                    object.warning[j] = message.warning[j];
            }
            if (message.hasCoverage != null && message.hasOwnProperty("hasCoverage"))
                object.hasCoverage = message.hasCoverage;
            if (message.remotelyCached != null && message.hasOwnProperty("remotelyCached"))
                object.remotelyCached = message.remotelyCached;
            if (message.isRemoteStrategy != null && message.hasOwnProperty("isRemoteStrategy"))
                object.isRemoteStrategy = message.isRemoteStrategy;
            if (message.testTimes && message.testTimes.length) {
                object.testTimes = [];
                for (var j = 0; j < message.testTimes.length; ++j)
                    if (typeof message.testTimes[j] === "number")
                        object.testTimes[j] = options.longs === String ? String(message.testTimes[j]) : message.testTimes[j];
                    else
                        object.testTimes[j] = options.longs === String ? $util.Long.prototype.toString.call(message.testTimes[j]) : options.longs === Number ? new $util.LongBits(message.testTimes[j].low >>> 0, message.testTimes[j].high >>> 0).toNumber() : message.testTimes[j];
            }
            if (message.passedLog != null && message.hasOwnProperty("passedLog"))
                object.passedLog = message.passedLog;
            if (message.testProcessTimes && message.testProcessTimes.length) {
                object.testProcessTimes = [];
                for (var j = 0; j < message.testProcessTimes.length; ++j)
                    if (typeof message.testProcessTimes[j] === "number")
                        object.testProcessTimes[j] = options.longs === String ? String(message.testProcessTimes[j]) : message.testProcessTimes[j];
                    else
                        object.testProcessTimes[j] = options.longs === String ? $util.Long.prototype.toString.call(message.testProcessTimes[j]) : options.longs === Number ? new $util.LongBits(message.testProcessTimes[j].low >>> 0, message.testProcessTimes[j].high >>> 0).toNumber() : message.testProcessTimes[j];
            }
            if (message.runDurationMillis != null && message.hasOwnProperty("runDurationMillis"))
                if (typeof message.runDurationMillis === "number")
                    object.runDurationMillis = options.longs === String ? String(message.runDurationMillis) : message.runDurationMillis;
                else
                    object.runDurationMillis = options.longs === String ? $util.Long.prototype.toString.call(message.runDurationMillis) : options.longs === Number ? new $util.LongBits(message.runDurationMillis.low >>> 0, message.runDurationMillis.high >>> 0).toNumber() : message.runDurationMillis;
            if (message.testCase != null && message.hasOwnProperty("testCase"))
                object.testCase = $root.blaze.TestCase.toObject(message.testCase, options);
            if (message.failedStatus != null && message.hasOwnProperty("failedStatus"))
                object.failedStatus = options.enums === String ? $root.blaze.FailedTestCasesStatus[message.failedStatus] : message.failedStatus;
            if (message.startTimeMillisEpoch != null && message.hasOwnProperty("startTimeMillisEpoch"))
                if (typeof message.startTimeMillisEpoch === "number")
                    object.startTimeMillisEpoch = options.longs === String ? String(message.startTimeMillisEpoch) : message.startTimeMillisEpoch;
                else
                    object.startTimeMillisEpoch = options.longs === String ? $util.Long.prototype.toString.call(message.startTimeMillisEpoch) : options.longs === Number ? new $util.LongBits(message.startTimeMillisEpoch.low >>> 0, message.startTimeMillisEpoch.high >>> 0).toNumber() : message.startTimeMillisEpoch;
            if (message.statusDetails != null && message.hasOwnProperty("statusDetails"))
                object.statusDetails = message.statusDetails;
            return object;
        };

        /**
         * Converts this TestResultData to JSON.
         * @function toJSON
         * @memberof blaze.TestResultData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TestResultData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return TestResultData;
    })();

    return blaze;
})();

module.exports = $root;
