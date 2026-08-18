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

import type { Channel } from '../../types'
import {
  aggregateChannelsByTag,
  getChannelTableRowId,
  type TagRow,
} from '../channel-utils'

function channel(id: number): Channel {
  return { id } as Channel
}

describe('channel table row identity', () => {
  test('keeps each channel identity when priority updates reorder the rows', () => {
    const first = channel(101)
    const updated = channel(202)
    const third = channel(303)

    const beforeUpdate = [first, updated, third].map(getChannelTableRowId)
    const afterUpdate = [updated, first, third].map(getChannelTableRowId)

    expect(beforeUpdate).toEqual(['channel:101', 'channel:202', 'channel:303'])
    expect(afterUpdate).toEqual(['channel:202', 'channel:101', 'channel:303'])
  })

  test('uses separate namespaces for tag and channel rows', () => {
    const tagRow = {
      id: '202' as unknown as number,
      tag: '202',
      children: [channel(202)],
    } as TagRow

    expect(getChannelTableRowId(tagRow)).toBe('tag:202')
    expect(getChannelTableRowId(channel(202))).toBe('channel:202')
  })

  test('aggregates used quota and remaining balance for tag rows', () => {
    const rows = aggregateChannelsByTag([
      {
        id: 1,
        tag: 'ali',
        group: '',
        used_quota: 100,
        balance: 12.5,
      } as Channel,
      {
        id: 2,
        tag: 'ali',
        group: '',
        used_quota: 250,
        balance: 7.25,
      } as Channel,
    ])

    const tagRow = rows[0] as TagRow
    expect(tagRow.used_quota).toBe(350)
    expect(tagRow.balance).toBe(19.75)
  })
})
