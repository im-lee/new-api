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
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  CUSTOMER_SERVICE_QR_CODE_URL,
  CUSTOMER_SERVICE_WECHAT_ID,
} from '@/components/layout/constants'
import { CopyButton } from '@/components/copy-button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

interface WeChatSupportPopoverProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  unstyled?: boolean
  showReminder?: boolean
}

export function WeChatSupportPopover({
  children,
  className,
  contentClassName,
  unstyled = false,
  showReminder = false,
}: WeChatSupportPopoverProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const trigger = (
    <button
      type='button'
      className={cn(
        !unstyled &&
          'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      onMouseEnter={() => setOpen(true)}
      onFocus={() => setOpen(true)}
      onClick={() => setOpen((value) => !value)}
    >
      {children}
    </button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        className={cn('w-64 gap-3 p-3', contentClassName)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <PopoverHeader>
          <PopoverTitle>{t('WeChat customer service')}</PopoverTitle>
          <PopoverDescription>
            {showReminder
              ? t('Please include your username when consulting support.')
              : t('Scan the QR code or copy the WeChat ID to contact support.')}
          </PopoverDescription>
        </PopoverHeader>
        <img
          src={CUSTOMER_SERVICE_QR_CODE_URL}
          alt={t('WeChat customer service QR code')}
          className='border-border bg-muted mx-auto size-36 rounded-md border object-cover'
        />
        <div className='bg-muted/50 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm'>
          <span className='text-muted-foreground'>{t('WeChat ID')}</span>
          <span className='font-medium'>{CUSTOMER_SERVICE_WECHAT_ID}</span>
          <CopyButton
            value={CUSTOMER_SERVICE_WECHAT_ID}
            size='icon-xs'
            tooltip={t('Copy WeChat ID')}
            successTooltip={t('Copied WeChat ID')}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
