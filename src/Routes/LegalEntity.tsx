import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { MRT_Localization_RU } from 'material-react-table/locales/ru';
import MaterialReactTable, {
  MaterialReactTableProps,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { data, states } from '../Components/makeData';
import { Client, LegalEntityVm } from '../apiClients';

const LegalEntityVmTable: FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<LegalEntityVm[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const apiClient = new Client('http://localhost:5200');

  useEffect(() => {
    const fetchLegalEntities = async () => {
      const legalEntitiesResp = await apiClient.legalEntityGET();
      setTableData(legalEntitiesResp.data ?? []);
    };
    fetchLegalEntities();
  }, []);

  const handleCreateNewRow = async (model: LegalEntityVm) => {
    model.id = 0;
    const createLegalEntityResp = await apiClient.legalEntityPOST(model);
    const newLegalEntity = createLegalEntityResp.data;
    if (newLegalEntity) {
      setTableData([...[newLegalEntity!].concat(tableData)]);
    }
  };

  const handleSaveRowEdits: MaterialReactTableProps<LegalEntityVm>['onEditingRowSave'] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
        await apiClient.legalEntityPOST(tableData[row.index]);
        setTableData([...tableData]);
        exitEditingMode(); //required to exit editing mode and close modal
      }
    };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    async (row: MRT_Row<LegalEntityVm>) => {
      if (
        !window.confirm(`Вы уверены, что хотите удалить ${row.getValue('name')}`)
      ) {
        return;
      }
      
      await apiClient.legalEntityDELETE(row.getValue('id'));

      tableData.splice(row.index, 1);
      setTableData([...tableData]);
    },
    [tableData],
  );

  const disableEditing = (row: MRT_Row<LegalEntityVm>, cell: MRT_Cell<LegalEntityVm>) => {
    const disableFieldsList = ['certStartDate', 'certEndDate', 'insStartDate', 'insEndDate'];
    console.log(cell.column.id);
    if (disableFieldsList.includes(cell.column.id) && cell.getValue<Date | undefined>()) {
      return true;
    }


    return false;
  }

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<LegalEntityVm>,
      row: MRT_Row<LegalEntityVm>,
    ): MRT_ColumnDef<LegalEntityVm>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        disabled: disableEditing(row, cell),
        onBlur: (event) => {
          const isValid =
            cell.column.id === 'email'
              ? validateEmail(event.target.value)
              : cell.column.id === 'vote'
              ? validateAge(+event.target.value)
              : validateRequired(event.target.value);
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`,
            });
          } else {
            //remove validation error for cell if valid
            delete validationErrors[cell.id];
            setValidationErrors({
              ...validationErrors,
            });
          }
        },
      };
    },
    [validationErrors],
  );

    console.log(tableData);
    
  const columns = useMemo<MRT_ColumnDef<LegalEntityVm>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 20,
        enableEditing: false,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
        }),
      },
      {
        accessorKey: 'name',
        header: 'Название',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
        }),
      },
      {
        accessorKey: 'votes',
        header: 'Голоса',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
          type: 'number',
        }),
      },
      {
        accessorKey: 'certStartDate',
        header: 'Начало Сертефикации',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
          type: 'date',
        }),
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#00a48a' }}>Начало Сертефикации</i>,
      },
      {
        accessorKey: 'certEndDate',
        header: 'Конец Сертефикации',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
          type: 'date',
        }),
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#6a0e17' }}>Конец Сертефикации</i>,
      },
      {
        accessorKey: 'insStartDate',
        header: 'Начало Страховки',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
          type: 'date',
        }),
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#00a48a' }}>Начало Страховки</i>,
      },
      {
        accessorKey: 'insEndDate',
        header: 'Конец Страховки',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
          type: 'date',
        }),
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#6a0e17' }}>Конец Страховки</i>,
      },
      {
        accessorKey: 'inn',
        header: 'ИНН',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell, row }) => ({
          ...getCommonEditTextFieldProps(cell, row),
        }),
      },
    ],
    [getCommonEditTextFieldProps],
  );

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 120,
          },
        }}
        columns={columns}
        data={tableData}
        editingMode="modal" //default
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        localization={MRT_Localization_RU}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Изменить">
              <IconButton onClick={() => table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Удалить">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Button
            color="success"
            onClick={() => setCreateModalOpen(true)}
            variant="contained"
          >
            Добавить
          </Button>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

//example of creating a mui dialog modal for creating new rows
export const CreateNewAccountModal: FC<{
  columns: MRT_ColumnDef<LegalEntityVm>[];
  onClose: () => void;
  onSubmit: (values: LegalEntityVm) => void;
  open: boolean;
}> = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ''] = '';
      return acc;
    }, {} as any),
  );

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">Добавление Юр. Лицо</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
            }}
          >
            <><br /></>
            <TextField
                key={columns[1].accessorKey}
                label={columns[1].header}
                name={columns[1].accessorKey}
                
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <TextField
                key={columns[2].accessorKey}
                label={columns[2].header}
                name={columns[2].accessorKey}
                type='number'
                
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <><p className='certStart'>Начало Сертефикации</p></>
              <TextField
                key={columns[3].accessorKey}
                name={columns[3].accessorKey}
                type='date'
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <><p className='certEnd'>Конец Сертефикации</p></>
              <TextField
                key={columns[4].accessorKey}
                name={columns[4].accessorKey}
                type='date'        
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <><p className='certStart'>Начало Страховки</p></>
               <TextField
                key={columns[5].accessorKey}
                name={columns[5].accessorKey}
                type='date'        
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
               <><p className='certEnd'>Конец Страховки</p></>
               <TextField
                key={columns[6].accessorKey}
                name={columns[6].accessorKey}
                type='date'        
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
            <TextField
                key={columns[7].accessorKey}
                name={columns[7].accessorKey}    
                label={columns[7].header}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="success" onClick={handleSubmit} variant="contained">
        Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
const validateAge = (vote: number) => vote >= 18 && vote <= 50;

export default LegalEntityVmTable;
