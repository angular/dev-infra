import * as $protobuf from "protobufjs";
/** Namespace blaze. */
export namespace blaze {

    /** FailedTestCasesStatus enum. */
    enum FailedTestCasesStatus {
        FULL = 1,
        PARTIAL = 2,
        NOT_AVAILABLE = 3,
        EMPTY = 4
    }

    /** BlazeTestStatus enum. */
    enum BlazeTestStatus {
        NO_STATUS = 0,
        PASSED = 1,
        FLAKY = 2,
        TIMEOUT = 3,
        FAILED = 4,
        INCOMPLETE = 5,
        REMOTE_FAILURE = 6,
        FAILED_TO_BUILD = 7,
        BLAZE_HALTED_BEFORE_TESTING = 8
    }

    /** Properties of a TestCase. */
    interface ITestCase {

        /** TestCase child */
        child?: (blaze.ITestCase[]|null);

        /** TestCase name */
        name?: (string|null);

        /** TestCase className */
        className?: (string|null);

        /** TestCase runDurationMillis */
        runDurationMillis?: (number|Long|null);

        /** TestCase result */
        result?: (string|null);

        /** TestCase type */
        type?: (blaze.TestCase.Type|null);

        /** TestCase status */
        status?: (blaze.TestCase.Status|null);

        /** TestCase run */
        run?: (boolean|null);
    }

    /** Represents a TestCase. */
    class TestCase implements ITestCase {

        /**
         * Constructs a new TestCase.
         * @param [properties] Properties to set
         */
        constructor(properties?: blaze.ITestCase);

        /** TestCase child. */
        public child: blaze.ITestCase[];

        /** TestCase name. */
        public name: string;

        /** TestCase className. */
        public className: string;

        /** TestCase runDurationMillis. */
        public runDurationMillis: (number|Long);

        /** TestCase result. */
        public result: string;

        /** TestCase type. */
        public type: blaze.TestCase.Type;

        /** TestCase status. */
        public status: blaze.TestCase.Status;

        /** TestCase run. */
        public run: boolean;

        /**
         * Creates a new TestCase instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TestCase instance
         */
        public static create(properties?: blaze.ITestCase): blaze.TestCase;

        /**
         * Encodes the specified TestCase message. Does not implicitly {@link blaze.TestCase.verify|verify} messages.
         * @param message TestCase message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: blaze.ITestCase, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TestCase message, length delimited. Does not implicitly {@link blaze.TestCase.verify|verify} messages.
         * @param message TestCase message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: blaze.ITestCase, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TestCase message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TestCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): blaze.TestCase;

        /**
         * Decodes a TestCase message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TestCase
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): blaze.TestCase;

        /**
         * Verifies a TestCase message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TestCase message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TestCase
         */
        public static fromObject(object: { [k: string]: any }): blaze.TestCase;

        /**
         * Creates a plain object from a TestCase message. Also converts values to other types if specified.
         * @param message TestCase
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: blaze.TestCase, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TestCase to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TestCase
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace TestCase {

        /** Type enum. */
        enum Type {
            TEST_CASE = 0,
            TEST_SUITE = 1,
            TEST_DECORATOR = 2,
            UNKNOWN = 3
        }

        /** Status enum. */
        enum Status {
            PASSED = 0,
            FAILED = 1,
            ERROR = 2
        }
    }

    /** Properties of a TestResultData. */
    interface ITestResultData {

        /** TestResultData cachable */
        cachable?: (boolean|null);

        /** TestResultData testPassed */
        testPassed?: (boolean|null);

        /** TestResultData status */
        status?: (blaze.BlazeTestStatus|null);

        /** TestResultData statusDetails */
        statusDetails?: (string|null);

        /** TestResultData failedLogs */
        failedLogs?: (string[]|null);

        /** TestResultData warning */
        warning?: (string[]|null);

        /** TestResultData hasCoverage */
        hasCoverage?: (boolean|null);

        /** TestResultData remotelyCached */
        remotelyCached?: (boolean|null);

        /** TestResultData isRemoteStrategy */
        isRemoteStrategy?: (boolean|null);

        /** TestResultData testTimes */
        testTimes?: ((number|Long)[]|null);

        /** TestResultData passedLog */
        passedLog?: (string|null);

        /** TestResultData testProcessTimes */
        testProcessTimes?: ((number|Long)[]|null);

        /** TestResultData runDurationMillis */
        runDurationMillis?: (number|Long|null);

        /** TestResultData startTimeMillisEpoch */
        startTimeMillisEpoch?: (number|Long|null);

        /** TestResultData testCase */
        testCase?: (blaze.ITestCase|null);

        /** TestResultData failedStatus */
        failedStatus?: (blaze.FailedTestCasesStatus|null);
    }

    /** Represents a TestResultData. */
    class TestResultData implements ITestResultData {

        /**
         * Constructs a new TestResultData.
         * @param [properties] Properties to set
         */
        constructor(properties?: blaze.ITestResultData);

        /** TestResultData cachable. */
        public cachable: boolean;

        /** TestResultData testPassed. */
        public testPassed: boolean;

        /** TestResultData status. */
        public status: blaze.BlazeTestStatus;

        /** TestResultData statusDetails. */
        public statusDetails: string;

        /** TestResultData failedLogs. */
        public failedLogs: string[];

        /** TestResultData warning. */
        public warning: string[];

        /** TestResultData hasCoverage. */
        public hasCoverage: boolean;

        /** TestResultData remotelyCached. */
        public remotelyCached: boolean;

        /** TestResultData isRemoteStrategy. */
        public isRemoteStrategy: boolean;

        /** TestResultData testTimes. */
        public testTimes: (number|Long)[];

        /** TestResultData passedLog. */
        public passedLog: string;

        /** TestResultData testProcessTimes. */
        public testProcessTimes: (number|Long)[];

        /** TestResultData runDurationMillis. */
        public runDurationMillis: (number|Long);

        /** TestResultData startTimeMillisEpoch. */
        public startTimeMillisEpoch: (number|Long);

        /** TestResultData testCase. */
        public testCase?: (blaze.ITestCase|null);

        /** TestResultData failedStatus. */
        public failedStatus: blaze.FailedTestCasesStatus;

        /**
         * Creates a new TestResultData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TestResultData instance
         */
        public static create(properties?: blaze.ITestResultData): blaze.TestResultData;

        /**
         * Encodes the specified TestResultData message. Does not implicitly {@link blaze.TestResultData.verify|verify} messages.
         * @param message TestResultData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: blaze.ITestResultData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TestResultData message, length delimited. Does not implicitly {@link blaze.TestResultData.verify|verify} messages.
         * @param message TestResultData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: blaze.ITestResultData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TestResultData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TestResultData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): blaze.TestResultData;

        /**
         * Decodes a TestResultData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TestResultData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): blaze.TestResultData;

        /**
         * Verifies a TestResultData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TestResultData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TestResultData
         */
        public static fromObject(object: { [k: string]: any }): blaze.TestResultData;

        /**
         * Creates a plain object from a TestResultData message. Also converts values to other types if specified.
         * @param message TestResultData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: blaze.TestResultData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TestResultData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TestResultData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
