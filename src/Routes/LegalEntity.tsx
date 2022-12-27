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
import { ddmmyyyy } from '../utils';
import { GrmDatePicker } from './Persons';

const LegalEntityVmTable: FC = () => {
  const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<LegalEntityVm[]>([]);
  const [editLegalEntitiesRow, setEditLegalEntitiesRow] = useState<MRT_Row<LegalEntityVm> | undefined>(undefined);
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


  const handleCreateOrUpdateNewRow = async (model: LegalEntityVm) => {
    model.id = model.id ?? 0;
    const createLegalEntityResp = await apiClient.legalEntityPOST(model);
    const newLegalEntity = createLegalEntityResp.data;
    if (model.id) {
      setTableData(tableData.map(i => i.id === model.id ? model : i));
    }
    if (model.id === 0 && newLegalEntity) {
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

  const editRow = (row: MRT_Row<LegalEntityVm>) => {
    setEditLegalEntitiesRow(row);
    setCreateOrUpdateModalOpen(true);
  }


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

  const getMembershipTypeStr = (num: number): string | null => {
    switch (num) {  
      case 0:
        return "Действ.";
      case 1:
        return "Не действ.";
    };

    return null;
  }

  const columns = useMemo<MRT_ColumnDef<LegalEntityVm>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 20,
        enableEditing: false,
        },
      {
        accessorKey: 'name',
        header: 'Название',
        size: 140,
      },
      {
        accessorKey: 'membershipType',
        header: 'Членство',
        Cell: ({ cell }) => getMembershipTypeStr(cell.getValue<number>()),
        size: 140,
      },
      {
        accessorKey: 'votes',
        header: 'Голоса',
        size: 140,
          type: 'number',
      },
      {
        accessorKey: 'inn',
        header: 'ИНН',
        size: 140,
       },
      {
        accessorKey: 'certStartDate',
        header: 'Начало Сертефикации',
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#00a48a' }}>Начало Сертефикации</i>,
      },
      {
        accessorKey: 'certEndDate',
        header: 'Конец Сертефикации',
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#6a0e17' }}>Конец Сертефикации</i>,
      },
      {
        accessorKey: 'insStartDate',
        header: 'Начало Страховки',
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#00a48a' }}>Начало Страховки</i>,
      },
      {
        accessorKey: 'insEndDate',
        header: 'Конец Страховки',
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#6a0e17' }}>Конец Страховки</i>,
      },
      ],
    []
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
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Tooltip arrow placement="left" title="Изменить">
              <IconButton onClick={() => editRow(row)}>
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
            onClick={() => setCreateOrUpdateModalOpen(true)}
            variant="contained"
          >
            Добавить
          </Button>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createOrUpdateModalOpen}
        onClose={() => { setEditLegalEntitiesRow(undefined); setCreateOrUpdateModalOpen(false); }}
        onSubmit={handleCreateOrUpdateNewRow}
        legalEntitiesRow={editLegalEntitiesRow}
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
  legalEntitiesRow?: MRT_Row<LegalEntityVm>;
}> = ({open, columns, onClose, onSubmit, legalEntitiesRow }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = legalEntitiesRow?.getValue(column.accessorKey ?? '');
      return acc;
    }, {} as any)
  );

  useEffect(() => {
    setValues(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = legalEntitiesRow?.getValue(column.accessorKey ?? '');
        return acc;
      }, {} as any));

  }, [legalEntitiesRow]);


  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{(legalEntitiesRow && 'Редактирование Юр. Лица') || 'Добавление Юр. Лица'}</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '360px', md: '400px' },
              gap: '1.5rem',
            }}
          >
            <br />
            <TextField
              key={columns[1].accessorKey}
              label={columns[1].header}
              name={columns[1].accessorKey}
              defaultValue={legalEntitiesRow?.getValue(columns[1].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <TextField
              key={columns[2].accessorKey}
              label={columns[2].header}
              name={columns[2].accessorKey}
              defaultValue={legalEntitiesRow?.getValue(columns[2].accessorKey ?? '')}
              select
              children={[
              (<MenuItem key={0} value={0}>
                {'Действ.'}
              </MenuItem>),
              (<MenuItem key={1} value={1}>
                {'Не действ.'}
              </MenuItem>)]}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <TextField
              key={columns[3].accessorKey}
              label={columns[3].header}
              name={columns[3].accessorKey}
              type='number'
              defaultValue={legalEntitiesRow?.getValue(columns[3].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
             <TextField
              key={columns[4].accessorKey}
              label={columns[4].header}
              name={columns[4].accessorKey}
              defaultValue={legalEntitiesRow?.getValue(columns[4].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <GrmDatePicker
              label={columns[5].header}
              initValue={legalEntitiesRow?.getValue(columns[5].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[5].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[5].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[6].header}
              initValue={legalEntitiesRow?.getValue(columns[6].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[6].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[6].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[7].header}
              initValue={legalEntitiesRow?.getValue(columns[7].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[7].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[7].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[8].header}
              initValue={legalEntitiesRow?.getValue(columns[8].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[8].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[8].accessorKey as string]: newVal })
              }
            />
           
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="success" onClick={handleSubmit} variant="contained">
        {(legalEntitiesRow?.getValue(columns[0].accessorKey ?? '') && 'Изменить') as string || 'Добавить'}
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
