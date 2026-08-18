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
import { Link } from '@tanstack/react-router'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
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
import { Label } from '@/components/ui/label'

import { quickExchange } from '../api'
import type { QuickExchangeResult } from '../types'

type QuickExchangeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ResultRowProps = {
  label: string
  value: string
  copyLabel: string
}

function ResultRow({ label, value, copyLabel }: ResultRowProps) {
  return (
    <div className='grid gap-1.5'>
      <div className='text-muted-foreground text-xs font-medium'>{label}</div>
      <div className='bg-muted/50 flex min-h-9 flex-col items-stretch gap-2 rounded-lg border px-2.5 py-1.5 sm:flex-row sm:items-center'>
        <code className='min-w-0 flex-1 text-xs leading-5 break-all'>
          {value}
        </code>
        <CopyButton
          value={value}
          size='icon-sm'
          tooltip={copyLabel}
          className='self-end sm:self-auto'
        />
      </div>
    </div>
  )
}

export function QuickExchangeDialog({
  open,
  onOpenChange,
}: QuickExchangeDialogProps) {
  const { t } = useTranslation()
  const [key, setKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<QuickExchangeResult | null>(null)

  const derivedAccount = useMemo(() => key.trim().slice(0, 10), [key])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setKey('')
      setError('')
      setResult(null)
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedKey = key.trim()
    setError('')
    if (!/^[A-Za-z0-9]{32}$/.test(trimmedKey)) {
      setError(t('Please enter a valid 32-character redemption code.'))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await quickExchange(trimmedKey)
      if (!response.success || !response.data) {
        setError(response.message || t('Quick exchange failed.'))
        return
      }
      setResult(response.data)
    } catch {
      setError(t('Quick exchange failed.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[90vh] sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('Quick Exchange')}</DialogTitle>
          <DialogDescription>
            {t(
              'Enter your redemption code to create or reuse the linked account and get an API key.'
            )}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-2.5 text-sm leading-6 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100'>
              <p>
                {t(
                  'Quick Exchange is intended for first-time setup and will generate a new account. To recharge an existing account, sign in to that account and redeem the code from Wallet instead.'
                )}
              </p>
              <p className='mt-1'>
                {t(
                  'The system uses the first 10 characters of the redemption code as the account username and password.'
                )}
              </p>
              {derivedAccount && (
                <div className='mt-1 text-xs'>
                  {t('Account preview: {{account}}', {
                    account: derivedAccount,
                  })}
                </div>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='quick-exchange-key'>{t('Redemption code')}</Label>
              <Input
                id='quick-exchange-key'
                value={key}
                maxLength={32}
                autoComplete='off'
                placeholder={t('Enter redemption code')}
                onChange={(event) => setKey(event.target.value)}
              />
              {error && <p className='text-destructive text-sm'>{error}</p>}
            </div>

            <DialogFooter className='bg-transparent p-0'>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full sm:w-auto'
              >
                {isSubmitting && <Loader2 className='animate-spin' />}
                {t('Exchange now')}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className='space-y-4'>
            <div className='rounded-lg border border-emerald-300/70 bg-emerald-50/90 px-3 py-2.5 text-sm font-medium text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100'>
              {t('Exchange successful. Save the account and API key below.')}
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <ResultRow
                label={t('Username')}
                value={result.username}
                copyLabel={t('Copy username')}
              />
              <ResultRow
                label={t('Password')}
                value={result.password}
                copyLabel={t('Copy password')}
              />
            </div>
            <ResultRow
              label={t('API Key')}
              value={result.api_key}
              copyLabel={t('Copy API key')}
            />
            <div className='grid gap-3 sm:grid-cols-2'>
              <ResultRow
                label={t('Base URL')}
                value={result.base_url}
                copyLabel={t('Copy Base URL')}
              />
              <ResultRow
                label={t('Base URL /v1')}
                value={result.base_url_v1}
                copyLabel={t('Copy Base URL')}
              />
            </div>

            <div className='rounded-lg border p-3'>
              <div className='text-sm font-medium'>
                {t('Choose models in Model Square')}
              </div>
              <p className='text-muted-foreground mt-1 text-sm'>
                {t(
                  'Available models may change over time. Please open Model Square and choose the model that fits your use case.'
                )}
              </p>
              <Button
                variant='outline'
                size='sm'
                className='mt-3 w-full sm:w-auto'
                render={<Link to='/pricing' />}
              >
                {t('Open Model Square')}
                <ExternalLink className='ml-1 size-3.5' />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
