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
import { ddmmyyyy, yyyymmdd, getDateColumnConfig } from '../utils';
import { GrmDatePicker } from './Persons';
import { ExportToCsv } from 'export-to-csv';
import { GetApiClient } from '../Utils/config';
const LegalEntityVmTable: FC = () => {
  const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<LegalEntityVm[]>([]);
  const [editLegalEntitiesRow, setEditLegalEntitiesRow] = useState<MRT_Row<LegalEntityVm> | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const apiClient = GetApiClient();

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
    const disableFieldsList = ['certStartDate', 'certEndDate', 'insStartDate', 'insEndDate', 'certNumber'];
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
        size: 5,
        enableEditing: false,
        Cell: ({ cell }) => <a href={`#/legalEntity/${cell.getValue<number>()}`}>{cell.getValue<number>()}</a>,
      },
      {
        accessorKey: 'name',
        header: 'Название',
        size: 20,
      },
      {
        accessorKey: 'membershipType',
        header: 'Членство',
        Cell: ({ cell }) => getMembershipTypeStr(cell.getValue<number>()),
        size: 20,
      },
      {
        accessorKey: 'votes',
        header: 'Голоса',
        size: 20,
        type: 'number',
      },
      {
        accessorKey: 'inn',
        header: 'ИНН',
        size: 20,
      },
      {
        accessorKey: 'email',
        header: 'Почта',
        maxSize: 15,
      },
      {
        accessorKey: 'phoneNumber',
        header: 'Номер Тел.',
        size: 20,
      },
      {
        accessorKey: 'certNumber',
        header: 'Номер Серт.',
        size: 20,

      },
      getDateColumnConfig('certStartDate', 'Начало Серт.'),
      getDateColumnConfig('certEndDate', 'Конец Серт.', <i style={{ color: '#6a0e17' }}>Конец Серт.</i>),
      getDateColumnConfig('insStartDate', 'Начало Стх'),
      getDateColumnConfig('insEndDate', 'Конец Стх.', <i style={{ color: '#6a0e17' }}>Конец Стх.</i>),
      getDateColumnConfig('createdOn', 'Дата Создания'),

    ],
    []
  );
  // export CSV LegalEntities
  const csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: columns.map((c) => c.header),
  };

  const csvExporter = new ExportToCsv(csvOptions);

  const handleExportRows = (rows: any) => {
    //@ts-ignore
    csvExporter.generateCsv(rows.map((row) => {
      return {
        id: row.original.id,
        name: row.original.name,
        membershipType: getMembershipTypeStr(+row.original.membershipType) ,
        votes: row.original.votes,
        inn: row.original.inn,
        email: row.original.email ,
        phoneNumber: row.original.phoneNumber ,
        certNumber: row.original.certNumber,
        certStartDate: ddmmyyyy(row.original.certStartDate) ?? '',
        certEndDate: ddmmyyyy(row.original.certEndDate) ?? '',
        insStartDate: ddmmyyyy(row.original.insStartDate) ?? '',
        insEndDate: ddmmyyyy(row.original.insEndDate) ?? '',
        createdOn: ddmmyyyy(row.original.createdOn) ?? '',
      };
    }));
  };
  // export CSV ^

  const [tableLayout, setTableLayout] = useState<string>('auto');

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 20,
          },
        }}
        muiTableProps={{
          sx: {
            tableLayout: tableLayout,
          },
        }}
        columns={columns}
        defaultColumn={{
          minSize: 5, //allow columns to get smaller than default
          maxSize: 40, //allow columns to get larger than default
          size: 8, //make columns wider by default
        }}
        data={tableData}
        editingMode="modal" //default
        enableColumnOrdering
        // enableColumnResizing
        enableColumnDragging={false}
        initialState={{ density: 'compact' }}
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        localization={MRT_Localization_RU}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: "flex", gap: "0.75rem" }}>
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
        renderTopToolbarCustomActions={({ table }) => (
          <Box sx={{ display: "flex", gap: "1rem" }} >
            <Button
              color="success"
              onClick={() => setCreateOrUpdateModalOpen(true)}
              variant="contained"
            >
              Добавить
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                handleExportRows(table.getFilteredRowModel().rows);
              }
              }>Экспорт</Button>
              <Button
              variant="contained"
              onClick={() => {
                setTableLayout(tableLayout === 'auto' ? 'fixed' : 'auto');
              }
              }>{tableLayout === 'auto' ? 'Fix' : 'Scroll'}</Button>
          </Box>
        )}
      />
      < CreateNewAccountModal
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
}> = ({ open, columns, onClose, onSubmit, legalEntitiesRow }) => {
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
              gap: '1rem',
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
            <TextField
              key={columns[5].accessorKey}
              label={columns[5].header}
              name={columns[5].accessorKey}
              defaultValue={legalEntitiesRow?.getValue(columns[5].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }

            />
            <TextField
              key={columns[6].accessorKey}
              label={columns[6].header}
              name={columns[6].accessorKey}
              defaultValue={legalEntitiesRow?.getValue(columns[6].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
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
            <GrmDatePicker
              label={columns[9].header}
              initValue={legalEntitiesRow?.getValue(columns[9].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[9].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[9].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[10].header}
              initValue={legalEntitiesRow?.getValue(columns[10].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[10].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[10].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[11].header}
              initValue={legalEntitiesRow?.getValue(columns[11].accessorKey ?? '') ?? null}
              disabled={legalEntitiesRow?.getValue(columns[11].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[11].accessorKey as string]: newVal })
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
