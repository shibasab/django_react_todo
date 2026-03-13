import assert from 'node:assert/strict'
import test from 'node:test'

import { validateToolingVersions, workspaceToolingPolicies } from './check-tooling-versions.mjs'

function createRootPackage(version = '1.0.0') {
  const requiredNames = new Set(
    Object.values(workspaceToolingPolicies).flatMap(({ required }) => required),
  )

  return {
    overrides: Object.fromEntries([...requiredNames].map((depName) => [depName, version])),
  }
}

function createWorkspacePackage(name, deps) {
  return {
    name,
    devDependencies: Object.fromEntries(deps.map((depName) => [depName, '1.0.0'])),
  }
}

test('frontend は tsgo 系依存なしで共通化チェックを通過できる', () => {
  const errors = validateToolingVersions({
    rootPackage: createRootPackage(),
    workspacePackages: [
      {
        workspaceId: 'backend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.backend.expectedName,
          workspaceToolingPolicies.backend.required,
        ),
      },
      {
        workspaceId: 'frontend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.frontend.expectedName,
          workspaceToolingPolicies.frontend.required,
        ),
      },
      {
        workspaceId: 'shared',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.shared.expectedName,
          workspaceToolingPolicies.shared.required,
        ),
      },
    ],
  })

  assert.deepEqual(errors, [])
})

test('frontend に tsgo 系依存が入ると共通化チェックで検出される', () => {
  const errors = validateToolingVersions({
    rootPackage: createRootPackage(),
    workspacePackages: [
      {
        workspaceId: 'backend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.backend.expectedName,
          workspaceToolingPolicies.backend.required,
        ),
      },
      {
        workspaceId: 'frontend',
        packageJson: createWorkspacePackage(workspaceToolingPolicies.frontend.expectedName, [
          ...workspaceToolingPolicies.frontend.required,
          ...workspaceToolingPolicies.frontend.forbidden,
        ]),
      },
      {
        workspaceId: 'shared',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.shared.expectedName,
          workspaceToolingPolicies.shared.required,
        ),
      },
    ],
  })

  assert.equal(errors.length, 2)
  assert.match(
    errors.join('\n'),
    /todoapp-frontend: @typescript\/native-preview は利用方針上 devDependencies に含めないでください/,
  )
  assert.match(
    errors.join('\n'),
    /todoapp-frontend: oxlint-tsgolint は利用方針上 devDependencies に含めないでください/,
  )
})

test('required な依存が欠けている workspace は共通化チェックで検出される', () => {
  const errors = validateToolingVersions({
    rootPackage: createRootPackage(),
    workspacePackages: [
      {
        workspaceId: 'backend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.backend.expectedName,
          workspaceToolingPolicies.backend.required,
        ),
      },
      {
        workspaceId: 'frontend',
        packageJson: createWorkspacePackage(workspaceToolingPolicies.frontend.expectedName, [
          'oxlint',
          'oxfmt',
          'vitest',
          '@vitest/coverage-v8',
        ]),
      },
      {
        workspaceId: 'shared',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.shared.expectedName,
          workspaceToolingPolicies.shared.required,
        ),
      },
    ],
  })

  assert.match(
    errors.join('\n'),
    /todoapp-frontend: typescript を devDependencies に追加してください/,
  )
})

test('frontend の forbidden 依存は dependencies 側でも検出される', () => {
  const errors = validateToolingVersions({
    rootPackage: createRootPackage(),
    workspacePackages: [
      {
        workspaceId: 'backend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.backend.expectedName,
          workspaceToolingPolicies.backend.required,
        ),
      },
      {
        workspaceId: 'frontend',
        packageJson: {
          name: workspaceToolingPolicies.frontend.expectedName,
          dependencies: { '@typescript/native-preview': '1.0.0' },
          devDependencies: Object.fromEntries(
            workspaceToolingPolicies.frontend.required.map((depName) => [depName, '1.0.0']),
          ),
        },
      },
      {
        workspaceId: 'shared',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.shared.expectedName,
          workspaceToolingPolicies.shared.required,
        ),
      },
    ],
  })

  assert.match(
    errors.join('\n'),
    /todoapp-frontend: @typescript\/native-preview は利用方針上 devDependencies に含めないでください/,
  )
})

test('workspace 名の不一致は共通化チェックで検出される', () => {
  const errors = validateToolingVersions({
    rootPackage: createRootPackage(),
    workspacePackages: [
      {
        workspaceId: 'backend',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.backend.expectedName,
          workspaceToolingPolicies.backend.required,
        ),
      },
      {
        workspaceId: 'frontend',
        packageJson: createWorkspacePackage(
          '@todoapp/frontend-renamed',
          workspaceToolingPolicies.frontend.required,
        ),
      },
      {
        workspaceId: 'shared',
        packageJson: createWorkspacePackage(
          workspaceToolingPolicies.shared.expectedName,
          workspaceToolingPolicies.shared.required,
        ),
      },
    ],
  })

  assert.match(
    errors.join('\n'),
    /frontend: package\.json の name が不正です \(actual: @todoapp\/frontend-renamed, expected: todoapp-frontend\)/,
  )
})
