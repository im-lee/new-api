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
import { X } from 'lucide-react';
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
  const [wechatVisible, setWechatVisible] = React.useState(false);
  const [noticeVisible, setNoticeVisible] = React.useState(true);

  const notice = noticeVisible ? (
    <div
      className='relative w-full rounded-xl border py-3 pr-10 pl-4 text-sm shadow-sm'
      style={{
        backgroundColor: '#fef3c7',
        borderColor: '#fcd34d',
        color: '#92400e',
      }}
    >
      <div>
        <span>
          {t(
            '仅展示最近1-2周的使用记录，请自行做好全量日志留存，如有其他问题请咨询'
          )}
        </span>
        <Popover
          trigger='custom'
          position='bottom'
          visible={wechatVisible}
          onVisibleChange={setWechatVisible}
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
          <button
            type='button'
            className='border-0 bg-transparent p-0 font-semibold underline underline-offset-4'
            style={{ color: '#92400e' }}
            onMouseEnter={() => setWechatVisible(true)}
            onMouseLeave={() => setWechatVisible(false)}
            onFocus={() => setWechatVisible(true)}
            onBlur={() => setWechatVisible(false)}
            onClick={() => setWechatVisible(true)}
          >
            {t('微信客服')}
          </button>
        </Popover>
        <span>{t('。')}</span>
      </div>
      <button
        type='button'
        aria-label={t('关闭')}
        className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-0 bg-transparent text-lg leading-none transition-colors hover:bg-amber-200/70'
        style={{ color: '#92400e' }}
        onClick={() => setNoticeVisible(false)}
      >
        <X size={14} aria-hidden='true' />
      </button>
    </div>
  ) : null;

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
