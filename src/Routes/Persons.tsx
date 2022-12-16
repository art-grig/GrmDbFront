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
import { Client, PersonVm } from '../apiClients';

const PersonVmTable: FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<PersonVm[]>([]);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const apiClient = new Client('http://localhost:5200');

  useEffect(() => {
    const fetchPersons = async () => {
      const personsResp = await apiClient.personGET();
      setTableData(personsResp.data ?? []);
    };
    fetchPersons();
  }, []);

  const handleCreateNewRow = async (model: PersonVm) => {
    model.id = 0;
    const createPersonResp = await apiClient.personPOST(model);
    const newPerson = createPersonResp.data;
    if (newPerson) {
      setTableData([...[newPerson!].concat(tableData)]);
    }
  };

  const handleSaveRowEdits: MaterialReactTableProps<PersonVm>['onEditingRowSave'] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
        await apiClient.personPOST(tableData[row.index]);
        setTableData([...tableData]);
        exitEditingMode(); //required to exit editing mode and close modal
      }
    };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow =  useCallback (
    async (row: MRT_Row<PersonVm>) => {
      if (
        !window.confirm(`Вы уверены, что хотите удалить ${row.getValue('name')}`)
      ) {
        return;
      }
      
      try {
      await apiClient.personDELETE(row.getValue('id'));

      tableData.splice(row.index, 1);
      setTableData([...tableData]);        
      }
      catch(ex) {
        alert("Произошла ошибка при обращении к серверу");
      }
    },
    [tableData],
  );

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<PersonVm>,
    ): MRT_ColumnDef<PersonVm>['muiTableBodyCellEditTextFieldProps'] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
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

  const columns = useMemo<MRT_ColumnDef<PersonVm>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 20,
        enableEditing: false,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'legalEntityId',
        header: 'ID Юр. Лица',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type:'number'
        }),
      },
      {
        accessorKey: 'name',
        header: 'Имя',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'surname',
        header: 'Фамилия',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: 'patronymic',
        header: 'Отчество',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
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
  columns: MRT_ColumnDef<PersonVm>[];
  onClose: () => void;
  onSubmit: (values: PersonVm) => void;
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
      <DialogTitle textAlign="center">Добавление Физ. Лицо</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
            }}
          >
            <TextField
                key={columns[1].accessorKey}
                label={columns[1].header}
                name={columns[1].accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
                type='number'
              />
            <TextField
                key={columns[2].accessorKey}
                label={columns[2].header}
                name={columns[2].accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <TextField
                key={columns[3].accessorKey}
                label={columns[3].header}
                name={columns[3].accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
              <TextField
                key={columns[4].accessorKey}
                label={columns[4].header}
                name={columns[4].accessorKey}
                onChange={(e) =>
                  setValues({ ...values, [e.target.name]: e.target.value })
                }
              />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="secondary" onClick={handleSubmit} variant="contained">
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

export default PersonVmTable;
