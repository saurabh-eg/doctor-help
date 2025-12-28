/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                allowJs: true,
                strict: true,
            }
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    testMatch: ['**/__tests__/**/*.test.(ts|js)'],
    moduleNameMapper: {
        '^@doctor-help/utils$': '<rootDir>/../../packages/utils/src/index.ts',
        '^@doctor-help/types$': '<rootDir>/../../packages/types/src/index.ts',
        '^@doctor-help/constants$': '<rootDir>/../../packages/constants/src/index.ts',
    },
};
