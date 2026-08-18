/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { describe, expect, test } from 'vitest'

import { compareModelNamesByVersion } from '../filters'

describe('model version sorting', () => {
  test('puts newer numeric model versions first', () => {
    const names = ['deepseek-v3.2', 'deepseek-v3.10', 'deepseek-v3.1']

    expect(names.sort(compareModelNamesByVersion)).toEqual([
      'deepseek-v3.10',
      'deepseek-v3.2',
      'deepseek-v3.1',
    ])
  })

  test('compares date-stamped versions numerically', () => {
    const names = ['model-2025-09-01', 'model-2026-01-15', 'model-2025-12-31']

    expect(names.sort(compareModelNamesByVersion)).toEqual([
      'model-2026-01-15',
      'model-2025-12-31',
      'model-2025-09-01',
    ])
  })

  test('keeps different model families alphabetically grouped', () => {
    const names = ['qwen-3', 'deepseek-v2', 'deepseek-v3', 'qwen-2']

    expect(names.sort(compareModelNamesByVersion)).toEqual([
      'deepseek-v3',
      'deepseek-v2',
      'qwen-3',
      'qwen-2',
    ])
  })
})
