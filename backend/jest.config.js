module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@PrismaClient/(.*)$': '<rootDir>/prisma/client/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
}
