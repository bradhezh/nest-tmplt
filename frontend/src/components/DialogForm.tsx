import {useState} from 'react'

import {Button} from '@/components/ui/button'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {DataForm, FormData} from './DataForm'

export interface DialogFormData<T extends {[K: string]: unknown}> {
  title: string
  trigger?: string
  openState?: readonly [boolean, (open: boolean) => void],
  form: FormData<T>
}

export const DialogForm = <T extends {[K: string]: unknown}>(
  {title, trigger, openState, form}: DialogFormData<T>,
) => {
  const [open, setOpen] = openState ?? useState(false)

  const onSubmit = async (
    data: T, evt?: React.BaseSyntheticEvent,
  ) => {
    await form.submit.handler(data, evt)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>
        <Button variant="outline">{trigger}</Button>
      </DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DataForm {...{...form, submit: {...form.submit, handler: onSubmit}}} />
      </DialogContent>
    </Dialog>
  )
}

export default DialogForm
