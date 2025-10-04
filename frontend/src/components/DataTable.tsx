import {
  useReactTable, getCoreRowModel, ColumnDef, flexRender,
} from '@tanstack/react-table'

import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'

export interface TableData<T> {
  data: T[]
  columns: ColumnDef<T>[]
}

export const DataTable = <T,>({data, columns}: TableData<T>) => {
  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(group =>
        <TableRow key={group.id}>
          {group.headers.map((header) =>
          <TableHead key={header.id}>
            {header.isPlaceholder ? null : flexRender(
              header.column.columnDef.header, header.getContext())}
          </TableHead>)}
        </TableRow>)}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row =>
        <TableRow key={row.id}>
          {row.getVisibleCells().map(cell =>
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>)}
        </TableRow>)}
      </TableBody>
    </Table>
  )
}

export default DataTable
