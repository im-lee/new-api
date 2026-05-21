/*
Copyright (C) 2025 QuantumNous

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

import React from 'react';
import { Tag, Space, Skeleton, Popover } from '@douyinfe/semi-ui';
import { renderQuota } from '../../../helpers';
import CompactModeToggle from '../../common/ui/CompactModeToggle';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

const WECHAT_SUPPORT_QR_CODE_URL =
  'https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png';

const LogsActions = ({
  stat,
  loadingStat,
  showStat,
  compactMode,
  setCompactMode,
  t,
}) => {
  const showSkeleton = useMinimumLoadingTime(loadingStat);
  const needSkeleton = !showStat || showSkeleton;

  const notice = (
    <div
      className='w-full rounded-xl border px-4 py-3 text-sm shadow-sm'
      style={{
        backgroundColor: '#fef3c7',
        borderColor: '#fcd34d',
        color: '#92400e',
      }}
    >
      <span>
        {t(
          '仅展示最近1-2周的使用记录，请自行做好全量日志留存，如有其他问题请咨询'
        )}
      </span>
      <Popover
        trigger='hover'
        position='bottom'
        content={
          <div className='p-2 text-center'>
            <div className='mb-2 text-sm font-semibold text-semi-color-text-0'>
              {t('扫码添加微信客服')}
            </div>
            <img
              src={WECHAT_SUPPORT_QR_CODE_URL}
              alt={t('微信客服二维码')}
              className='block h-40 w-40 rounded-md object-contain'
            />
          </div>
        }
      >
        <a
          href={WECHAT_SUPPORT_QR_CODE_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold underline underline-offset-4'
          style={{ color: '#92400e' }}
        >
          {t('微信客服')}
        </a>
      </Popover>
      <span>{t('。')}</span>
    </div>
  );

  const placeholder = (
    <Space>
      <Skeleton.Title style={{ width: 108, height: 21, borderRadius: 6 }} />
      <Skeleton.Title style={{ width: 65, height: 21, borderRadius: 6 }} />
      <Skeleton.Title style={{ width: 64, height: 21, borderRadius: 6 }} />
    </Space>
  );

  return (
    <div className='flex w-full flex-col gap-3'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full'>
        <Skeleton loading={needSkeleton} active placeholder={placeholder}>
          <Space>
            <Tag
              color='blue'
              style={{
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: 13,
              }}
              className='!rounded-lg'
            >
              {t('消耗额度')}: {renderQuota(stat.quota)}
            </Tag>
            <Tag
              color='pink'
              style={{
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: 13,
              }}
              className='!rounded-lg'
            >
              RPM: {stat.rpm}
            </Tag>
            <Tag
              color='white'
              style={{
                border: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontWeight: 500,
                padding: 13,
              }}
              className='!rounded-lg'
            >
              TPM: {stat.tpm}
            </Tag>
          </Space>
        </Skeleton>

        <CompactModeToggle
          compactMode={compactMode}
          setCompactMode={setCompactMode}
          t={t}
        />
      </div>

      {notice}
    </div>
  );
};

export default LogsActions;
