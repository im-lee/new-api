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
import { X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import {
  CUSTOMER_SERVICE_QR_CODE_URL,
  CUSTOMER_SERVICE_WECHAT_ID,
} from '@/components/layout/constants'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type WeChatSupportPopoverProps = {
  children?: ReactNode
  className?: string
  contentClassName?: string
  unstyled?: boolean
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  buttonSize?: React.ComponentProps<typeof Button>['size']
  showReminder?: boolean
}

export function WeChatSupportPopover({
  children,
  className,
  contentClassName,
  unstyled = false,
  buttonVariant = 'outline',
  buttonSize = 'default',
  showReminder = false,
}: WeChatSupportPopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const trigger = unstyled ? (
    <button
      type='button'
      className={cn('cursor-pointer bg-transparent p-0 text-left', className)}
    />
  ) : (
    <Button variant={buttonVariant} size={buttonSize} className={className} />
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger}>
        {children ?? t('Contact customer service')}
      </PopoverTrigger>
      <PopoverContent
        className={cn('relative w-56 p-3 text-center', contentClassName)}
      >
        <button
          type='button'
          aria-label={t('Close')}
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none'
          onClick={() => setOpen(false)}
        >
          <X className='size-4' />
        </button>
        <div className='space-y-2 pr-5'>
          {showReminder && (
            <p className='text-sm font-medium'>
              {t(
                'Please include the username shown in the upper-right corner when consulting support.'
              )}
            </p>
          )}
          <div className='flex items-center justify-center gap-1.5'>
            <p className='text-sm font-semibold'>
              {t('WeChat ID: {{wechatId}}', {
                wechatId: CUSTOMER_SERVICE_WECHAT_ID,
              })}
            </p>
            <CopyButton
              value={CUSTOMER_SERVICE_WECHAT_ID}
              size='icon-sm'
              tooltip={t('Copy WeChat ID')}
            />
          </div>
          <p className='text-muted-foreground text-xs'>
            {t('Scan to add WeChat support')}
          </p>
          <img
            src={CUSTOMER_SERVICE_QR_CODE_URL}
            alt={t('WeChat support QR code')}
            className='mx-auto h-40 w-40 rounded-md object-contain'
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
