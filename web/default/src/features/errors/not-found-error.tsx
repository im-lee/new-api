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
import { useEffect, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

const HOME_REDIRECT_DELAY_SECONDS = 5

export function NotFoundError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(HOME_REDIRECT_DELAY_SECONDS)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0))
    }, 1000)

    const timeoutId = window.setTimeout(() => {
      navigate({ to: '/', replace: true })
    }, HOME_REDIRECT_DELAY_SECONDS * 1000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [navigate])

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>404</h1>
        <span className='font-medium'>{t('Oops! Page Not Found!')}</span>
        <p className='text-muted-foreground text-center'>
          {t("It seems like the page you're looking for")} <br />
          {t('does not exist or might have been removed.')}
        </p>
        <div className='mt-4 w-64 max-w-[80vw] space-y-2 text-center'>
          <p className='text-muted-foreground text-sm'>
            {t('Redirecting to the home page in {{seconds}}s.', {
              seconds: secondsLeft,
            })}
          </p>
          <div className='bg-muted h-1.5 overflow-hidden rounded-full'>
            <div
              className='bg-primary h-full rounded-full transition-[width] duration-1000 ease-linear'
              style={{
                width: `${(secondsLeft / HOME_REDIRECT_DELAY_SECONDS) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {t('Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('Back to Home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
