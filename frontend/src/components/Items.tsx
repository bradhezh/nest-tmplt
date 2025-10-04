import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {Row} from '@tanstack/react-table'
import {toast} from 'sonner'
import {MoreHorizontal} from 'lucide-react'

import {message} from '@/const'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Id, ItemData, ItemUpdate, ItemRes, itemSchemaData, itemSchemaUpdate,
} from '@shared/schemas'
import useGUser from '@/controllers/useGUser'
import useItems from '@/controllers/useItems'
import Layout from './Layout'
import DataTable from './DataTable'
import DialogForm from './DialogForm'

export const Items = () => {
  const navigate = useNavigate()
  const [editItem, setEditItem] = useState<ItemRes | null>(null)
  const {user} = useGUser()
  const {items, findItems, createItem, updateItem, rmItem} = useItems()

  useEffect(() => {
    void (async () => {
      if (!user) {
        return navigate('/login')
      }
      await findItems()
    })()
  }, [user, navigate, findItems])

  const onCreate = async (data: ItemData) => {
    await createItem(data)
    toast(message.createdInPagi, {description: message.createdInPagiDesc})
  }

  const onUpdate = async (data: ItemUpdate) => {
    await updateItem(editItem!.id, data)
  }

  const onDelete = async (id: Id) => {
    await rmItem(id)
  }

  const table = {
    data: items,
    columns: [{
      accessorKey: 'id',
      header: 'ID',
    }, {
      accessorKey: 'name',
      header: 'Name',
    }, {
      accessorKey: 'price',
      header: 'Price',
    }, {
      id: 'actions',
      cell: ({row}: {row: Row<ItemRes>}) =>
        <DropdownMenu>
          <div className='flex justify-end'>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditItem(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
    }],
  }

  const createDlg = {
    title: 'Create Item',
    trigger: 'Create Item',
    form: {
      data: {
        name: {
          init: '',
          name: 'Name',
        },
        price: {
          init: 0,
          name: 'Price',
        },
      },
      schema: itemSchemaData.shape.item,
      submit: {
        name: 'Create',
        handler: onCreate,
      },
    },
  }

  const editDlg = {
    title: 'Update Item',
    openState:
      [!!editItem, (open: boolean) => !open && setEditItem(null)] as const,
    form: {
      data: {
        name: {
          init: editItem?.name ?? '',
          name: 'Name',
        },
        price: {
          init: editItem?.price ?? 0,
          name: 'Price',
        },
      },
      schema: itemSchemaUpdate.shape.item,
      submit: {
        name: 'Update',
        handler: onUpdate,
      },
    },
  }

  return (
    <Layout>
      <div className="flex flex-col">
        <div className="self-start ml-4 mt-4">
          <DialogForm {...createDlg} />
        </div>
        <div className="m-4 p-4 pb-0 rounded border">
          <DataTable {...table} />
          <DialogForm {...editDlg} />
        </div>
      </div>
    </Layout>
  )
}

export default Items
