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
import { Popover } from '@douyinfe/semi-ui';
import { X } from 'lucide-react';
import PricingTopSection from '../header/PricingTopSection';
import PricingView from './PricingView';

const MODEL_SUPPORT_WECHAT_ID = 'deepseek998877';
const MODEL_SUPPORT_QR_CODE_URL =
  'https://chatgpt-1305971836.cos.ap-nanjing.myqcloud.com/image.png';

const PricingContent = ({ isMobile, sidebarProps, ...props }) => {
  const [supportNoticeVisible, setSupportNoticeVisible] = React.useState(true);

  return (
    <div
      className={isMobile ? 'pricing-content-mobile' : 'pricing-scroll-hide'}
    >
      {/* 固定的顶部区域（分类介绍 + 搜索和操作） */}
      <div className='pricing-search-header'>
        <PricingTopSection
          {...props}
          isMobile={isMobile}
          sidebarProps={sidebarProps}
          showWithRecharge={sidebarProps.showWithRecharge}
          setShowWithRecharge={sidebarProps.setShowWithRecharge}
          currency={sidebarProps.currency}
          setCurrency={sidebarProps.setCurrency}
          showRatio={sidebarProps.showRatio}
          setShowRatio={sidebarProps.setShowRatio}
          viewMode={sidebarProps.viewMode}
          setViewMode={sidebarProps.setViewMode}
          tokenUnit={sidebarProps.tokenUnit}
          setTokenUnit={sidebarProps.setTokenUnit}
        />
      </div>

      {supportNoticeVisible && (
        <div
          className='relative mx-4 mt-3 rounded-xl border py-3 pr-10 pl-4 text-sm shadow-sm'
          style={{
            backgroundColor: '#fef3c7',
            borderColor: '#fcd34d',
            color: '#92400e',
          }}
        >
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1.5'>
              <div className='font-semibold'>
                {props.t('需要更多模型支持？请联系微信客服')}
              </div>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]'>
                <span>
                  {props.t('微信号：{{wechatId}}', {
                    wechatId: MODEL_SUPPORT_WECHAT_ID,
                  })}
                </span>
                <Popover
                  trigger={isMobile ? 'click' : 'hover'}
                  position='bottom'
                  content={
                    <div className='p-2 text-center'>
                      <div className='mb-2 text-sm font-semibold text-semi-color-text-0'>
                        {props.t('扫码添加微信客服')}
                      </div>
                      <img
                        src={MODEL_SUPPORT_QR_CODE_URL}
                        alt={props.t('微信客服二维码')}
                        className='block h-40 w-40 rounded-md object-contain'
                      />
                    </div>
                  }
                >
                  <button
                    type='button'
                    className='cursor-pointer border-0 bg-transparent p-0 font-semibold underline underline-offset-4'
                    style={{ color: '#92400e' }}
                  >
                    {props.t('查看微信二维码')}
                  </button>
                </Popover>
              </div>
            </div>
            <div className='max-w-xs text-xs leading-5 md:text-right'>
              {props.t('第三方平台销售客服不受理模型支持问题。')}
            </div>
          </div>
          <button
            type='button'
            aria-label={props.t('关闭')}
            className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-0 bg-transparent text-lg leading-none transition-colors hover:bg-amber-200/70'
            style={{ color: '#92400e' }}
            onClick={() => setSupportNoticeVisible(false)}
          >
            <X size={14} aria-hidden='true' />
          </button>
        </div>
      )}

      {/* 可滚动的内容区域 */}
      <div
        className={
          isMobile ? 'pricing-view-container-mobile' : 'pricing-view-container'
        }
      >
        <PricingView {...props} viewMode={sidebarProps.viewMode} />
      </div>
    </div>
  );
};

export default PricingContent;
