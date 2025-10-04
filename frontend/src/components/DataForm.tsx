import {useEffect} from 'react'
import {useForm, SubmitHandler} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {ZodTypeAny} from 'zod'

import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form'
import useGError from '@/controllers/useGError'

export interface FormData<T extends {[K: string]: unknown}> {
  data: {
    [K in keyof T]: {
      name: string
      init: T[K]
      type?: string
    }
  }
  schema: ZodTypeAny
  submit: {
    name?: string
    handler: SubmitHandler<T>
  }
}

export const DataForm = <T extends {[K: string]: unknown}>({
  data, schema,
  submit: {
    name: submitName = 'Submit',
    handler,
  },
}: FormData<T>) => {
  const form = useForm({
    defaultValues:
      Object.fromEntries(Object.keys(data).map(e => [e, data[e].init])),
    resolver: zodResolver(schema),
  })
  const {error, setError} = useGError()

  useEffect(() => {
    setError(null)
  }, [setError])

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(handler)} className="space-y-4">
      {Object.keys(data).map(e =>
      <FormField key={e} control={form.control} name={e} render={({field}) =>
        <FormItem>
          <FormLabel>{data[e].name}</FormLabel>
          <FormControl>
            <Input {...field}
              {...(!data[e].type ? {} : {type: data[e].type})} />
          </FormControl>
          <FormMessage />
        </FormItem>} />)}
      <Button type="submit" className="mt-4 w-full">{submitName}</Button>
      {error && <div className="relative p-1 rounded text-red-500 bg-red-100">
        {error}
        <button onClick={() => setError(null)}
          className="absolute top-1 right-2">
          ×
        </button>
      </div>}
    </form>
    </Form>
  )
}

export default DataForm
