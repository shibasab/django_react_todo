import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const workspaceToolingPolicies = {
  backend: {
    expectedName: '@todoapp/backend',
    required: [
      'typescript',
      '@typescript/native-preview',
      'oxlint',
      'oxfmt',
      'oxlint-tsgolint',
      'vitest',
      '@vitest/coverage-v8',
    ],
    forbidden: [],
  },
  frontend: {
    expectedName: 'todoapp-frontend',
    required: ['typescript', 'oxlint', 'oxfmt', 'vitest', '@vitest/coverage-v8'],
    forbidden: ['@typescript/native-preview', 'oxlint-tsgolint'],
  },
  shared: {
    expectedName: '@todoapp/shared',
    required: ['typescript', '@typescript/native-preview', 'oxlint', 'oxfmt', 'oxlint-tsgolint', 'vitest'],
    forbidden: [],
  },
}

export function validateToolingVersions({ rootPackage, workspacePackages }) {
  const overrides = rootPackage.overrides ?? {}
  const errors = []
  const requiredOverrideNames = new Set(
    Object.values(workspaceToolingPolicies).flatMap(({ required }) => required),
  )

  for (const depName of requiredOverrideNames) {
    if (overrides[depName] == null) {
      errors.push(`root overrides に ${depName} が定義されていません`)
    }
  }

  for (const { workspaceId, packageJson } of workspacePackages) {
    const policy = workspaceToolingPolicies[workspaceId]
    if (policy == null) {
      errors.push(`未知の workspace ID です: ${workspaceId}`)
      continue
    }

    const workspaceName = packageJson.name ?? workspaceId
    if (workspaceName !== policy.expectedName) {
      errors.push(
        `${workspaceId}: package.json の name が不正です (actual: ${workspaceName}, expected: ${policy.expectedName})`,
      )
    }

    const devDependencies = packageJson.devDependencies ?? {}
    const dependencies = packageJson.dependencies ?? {}
    const declaredDependencies = { ...dependencies, ...devDependencies }

    for (const depName of policy.required) {
      if (!(depName in devDependencies)) {
        errors.push(`${workspaceName}: ${depName} を devDependencies に追加してください`)
        continue
      }

      const expected = overrides[depName]
      const actual = devDependencies[depName]
      if (expected !== actual) {
        errors.push(
          `${workspaceName}: ${depName} の宣言が不一致です (actual: ${actual}, expected: ${expected})`,
        )
      }
    }

    for (const depName of policy.forbidden) {
      if (depName in declaredDependencies) {
        errors.push(
          `${workspaceName}: ${depName} は利用方針上 devDependencies に含めないでください`,
        )
      }
    }
  }

  return errors
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function main() {
  const rootDir = process.cwd()
  const rootPackagePath = resolve(rootDir, 'package.json')
  const workspacePackagePaths = {
    backend: resolve(rootDir, 'backend/package.json'),
    frontend: resolve(rootDir, 'frontend/package.json'),
    shared: resolve(rootDir, 'shared/package.json'),
  }
  const rootPackage = readJson(rootPackagePath)
  const workspacePackages = Object.entries(workspacePackagePaths).map(([workspaceId, path]) => ({
    workspaceId,
    packageJson: readJson(path),
  }))
  const errors = validateToolingVersions({ rootPackage, workspacePackages })

  if (errors.length > 0) {
    console.error('ツールバージョンの共通化チェックに失敗しました。')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log('ツールバージョンの共通化チェックに成功しました。')
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
