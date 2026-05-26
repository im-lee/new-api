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
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/copy-button'
import { quickExchange } from '../api'
import type { QuickExchangeResult } from '../types'

interface QuickExchangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickExchangeDialog({
  open,
  onOpenChange,
}: QuickExchangeDialogProps) {
  const { t } = useTranslation()
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<QuickExchangeResult | null>(null)

  const handleExchange = async () => {
    const trimmedKey = key.trim()
    if (!trimmedKey) {
      toast.error(t('Please enter a redemption code'))
      return
    }

    setLoading(true)
    try {
      const response = await quickExchange(trimmedKey)
      if (!response.success || !response.data) {
        toast.error(response.message || t('Exchange failed'))
        return
      }
      setResult(response.data)
      toast.success(t('Exchange successful'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('Exchange failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setKey('')
      setResult(null)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('Quick Exchange')}</DialogTitle>
          <DialogDescription>
            {t(
              'Enter your redemption code to create or reuse the linked account and get an API key.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              value={key}
              onChange={(event) => setKey(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleExchange()
              }}
              placeholder={t('Redemption code')}
              disabled={loading}
            />
            <Button onClick={handleExchange} disabled={loading}>
              {loading ? t('Exchanging') : t('Exchange')}
            </Button>
          </div>

          {result && (
            <div className='border-border bg-muted/30 space-y-2 rounded-lg border p-3 text-sm'>
              <QuickExchangeRow label={t('Username')} value={result.username} />
              <QuickExchangeRow label={t('Password')} value={result.password} />
              <QuickExchangeRow label={t('API Key')} value={result.api_key} />
              <QuickExchangeRow label={t('Base URL')} value={result.base_url} />
              <QuickExchangeRow label={t('Base URL v1')} value={result.base_url_v1} />
              <div className='flex items-center justify-between gap-2'>
                <span className='text-muted-foreground'>{t('Model Square')}</span>
                <a
                  href={result.models_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:text-primary/80 font-medium underline underline-offset-4'
                >
                  {t('Select models')}
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            {t('Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuickExchangeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-2'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='min-w-0 truncate font-mono text-xs'>{value}</span>
      <CopyButton value={value} size='icon-xs' />
    </div>
  )
}
