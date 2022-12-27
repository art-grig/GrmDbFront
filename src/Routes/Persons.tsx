import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { MRT_Localization_RU } from "material-react-table/locales/ru";
import MaterialReactTable, {
  MaterialReactTableProps,
  MRT_Cell,
  MRT_ColumnDef,
  MRT_Row,
} from "material-react-table";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { data, states } from "../Components/makeData";
import { Client, LegalEntityVm, PersonVm } from "../apiClients";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ru } from 'date-fns/locale'
import { ddmmyyyy, yyyymmdd } from '../utils';
import { ExportToCsv } from 'export-to-csv';


const PersonVmTable: FC = () => {
  const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<PersonVm[]>([]);
  const [editPersonRow, setEditPersonRow] = useState<MRT_Row<PersonVm> | undefined>(undefined);
  const [legalEntitiesMap, setLegalEntitiesMap] = useState<Map<string | undefined, LegalEntityVm>>(new Map());
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const apiClient = new Client("http://localhost:5200");

  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    const fetchPersons = async () => {
      const apiResp = await Promise.all([apiClient.employeeGET(), apiClient.legalEntityGET()]);
      setTableData(apiResp[0].data ?? []);
      setLegalEntitiesMap(new Map<string | undefined, LegalEntityVm>((apiResp[1].data ?? []).map((vm): [string, LegalEntityVm] => [vm.name!, vm])));
    };
    fetchPersons();
  }, []);

  useEffect(() => {
    const timeout = 400;
    setTimeout(() => {
      const spin = document.querySelector('.spinLogo');
      if (spin && spin.parentNode) {
        spin.parentNode.removeChild(spin);
      }
    }, timeout);
  }, []);

  const handleCreateOrUpdateNewRow = async (model: PersonVm) => {
    model.id = model.id ?? 0;
    model.legalEntityId = legalEntitiesMap.get(model.legalEntityName)?.id;
    const createPersonResp = await apiClient.employeePOST(model);
    const newPerson = createPersonResp.data;
    if (model.id) {
      setTableData(tableData.map(i => i.id === model.id ? model : i));
    }
    if (model.id === 0 && newPerson) {
      setTableData([...[newPerson!].concat(tableData)]);
    }
  };

  console.log(LegalEntityVm);
  const handleSaveRowEdits: MaterialReactTableProps<PersonVm>["onEditingRowSave"] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
        tableData[row.index].legalEntityId = legalEntitiesMap.get(tableData[row.index].legalEntityName)?.id;
        await apiClient.employeePOST(tableData[row.index]);
        setTableData([...tableData]);
        exitEditingMode(); //required to exit editing mode and close modal
      }
    };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const editRow = (row: MRT_Row<PersonVm>) => {
    setEditPersonRow(row);
    setCreateOrUpdateModalOpen(true);
  }

  const handleDeleteRow = useCallback(
    async (row: MRT_Row<PersonVm>) => {
      if (
        !window.confirm(
          `Вы уверены, что хотите удалить ${row.getValue("name")}`
        )
      ) {
        return;
      }

      try {
        await apiClient.employeeDELETE(row.getValue("id"));

        tableData.splice(row.index, 1);
        setTableData([...tableData]);
      } catch (ex) {
        alert("Произошла ошибка при обращении к серверу");
      }
    },
    [tableData]
  );

  const disableEditing = (row: MRT_Row<PersonVm>, cell: MRT_Cell<PersonVm>) => {
    const disableFieldsList = ['attStartDate', 'attEndDate'];
    console.log(cell.getValue());
    if (disableFieldsList.includes(cell.column.id) && cell.getValue<Date | undefined>()) {
      return true;
    }

    return false;
  }


  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<PersonVm>,
      row: MRT_Row<PersonVm>,
    ): MRT_ColumnDef<PersonVm>["muiTableBodyCellEditTextFieldProps"] => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid =
            cell.column.id === "email"
              ? validateEmail(event.target.value)
              : cell.column.id === "vote"
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
    [validationErrors]
  );

  const columns = useMemo<MRT_ColumnDef<PersonVm>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        size: 20,
        enableEditing: false,
      },
      {
        accessorKey: "legalEntityName",
        header: "Компания",
      },
      {
        accessorKey: "name",
        header: "Имя",
        size: 140,
      },
      {
        accessorKey: "surname",
        header: "Фамилия",
        size: 140,
      },
      {
        accessorKey: "patronymic",
        header: "Отчество",
        size: 140,
      },
      {
        accessorKey: "inn",
        header: "ИНН",
        size: 140,
      },
      {
        accessorKey: 'createdOn',
        header: "Дата создания",
        size: 140,
        enableEditing: false,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#005d62' }}>Дата создания</i>,
      },
      {
        accessorKey: 'attStartDate',
        header: "Начало Атестации",
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#00a48a' }}>Начало Атестации</i>,
      },
      {
        accessorKey: 'attEndDate',
        header: "Конец Атестации",
        size: 140,
        Cell: ({ cell }) => ddmmyyyy(cell.getValue<Date>()),
        Header: <i style={{ color: '#6a0e17' }}>Конец Атестации</i>,
      },
    ],
    []
  );

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
        legalEntityName: row.original.legalEntityName,
        name: row.original.name,
        surname: row.original.surname,
        patronymic: row.original.patronymic,
        inn: row.original.inn,
        createdOn: yyyymmdd(row.original.createdOn) ?? '',
        attStartDate: yyyymmdd(row.original.attStartDate) ?? '',
        attEndDate: yyyymmdd(row.original.attEndDate) ?? '',
      };
    }));
  };

  return (
    <>
      <MaterialReactTable
        displayColumnDefOptions={{
          "mrt-row-actions": {
            muiTableHeadCellProps: {
              align: "center",
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
        renderTopToolbarCustomActions={({ table }) => (
          <>
          <Button
            color="success"
            onClick={() => setCreateOrUpdateModalOpen(true)}
            variant="contained"
          >
            Добавить
          </Button>
          <Button 
            variant="contained"
            onClick={() => 
            { 
              handleExportRows(table.getFilteredRowModel().rows);
            } 
          }>Экспорт</Button>
          </>
        )}
      />
      <CreateOrUpdatePersonModal
        columns={columns}
        open={createOrUpdateModalOpen}
        onClose={() => { setEditPersonRow(undefined); setCreateOrUpdateModalOpen(false); }}
        onSubmit={handleCreateOrUpdateNewRow}
        legalEntitiesMap={legalEntitiesMap}
        personRow={editPersonRow}
      />
    </>
  );
};

export const GrmDatePicker: FC<{
  label: string;
  initValue: Date | null;
  onChange: (value: Date | null, keyboardInputValue?: string | undefined) => any;
  disabled?: boolean;
}> = ({ label, initValue, onChange, disabled }) => {
  const [value, setValue] = useState<Date | null>(initValue);
  const handleChange = (newValue: Date | null) => {
    setValue(newValue);
    onChange(newValue);
  }

  return (
    <LocalizationProvider locale={ru} dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        // inputFormat="dd.MM.yyyy"
        disabled={disabled}
        value={value}
        onChange={handleChange}
        renderInput={(params) => <TextField {...params}
        inputProps={
          { 
            ...params.inputProps, 
            placeholder: "дд.мм.гггг" 
          }
        } />}
      />
    </LocalizationProvider>
  )
}


//example of creating a mui dialog modal for creating new rows
export const CreateOrUpdatePersonModal: FC<{
  columns: MRT_ColumnDef<PersonVm>[];
  onClose: () => void;
  onSubmit: (values: PersonVm) => void;
  legalEntitiesMap: Map<string | undefined, LegalEntityVm>,
  open: boolean;
  personRow?: MRT_Row<PersonVm>;
}> = ({ legalEntitiesMap, open, columns, onClose, onSubmit, personRow }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = personRow?.getValue(column.accessorKey ?? '');
      return acc;
    }, {} as any)
  );

  useEffect(() => {
    setValues(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = personRow?.getValue(column.accessorKey ?? '');
        return acc;
      }, {} as any));

  }, [personRow]);

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();

  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{(personRow && 'Редактирование Физ. Лица') || 'Добавление Физ. Лица'}</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
          >
            <br />
            <>{personRow?.getValue(columns[0].accessorKey ?? '') && <TextField
              key={columns[0].accessorKey}
              label={columns[0].header}
              name={columns[0].accessorKey}
              disabled={true}
              defaultValue={personRow?.getValue(columns[0].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />}</>
            <TextField
              key={columns[1].accessorKey}
              label={columns[1].header}
              name={columns[1].accessorKey}
              defaultValue={personRow?.getValue(columns[1].accessorKey ?? '')}
              select
              children={Array.from(legalEntitiesMap.values()).map(le =>
              (<MenuItem key={le.name} value={le.name}>
                {le.name}
              </MenuItem>))}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <TextField
              key={columns[2].accessorKey}
              label={columns[2].header}
              name={columns[2].accessorKey}
              defaultValue={personRow?.getValue(columns[2].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <TextField
              key={columns[3].accessorKey}
              label={columns[3].header}
              name={columns[3].accessorKey}
              defaultValue={personRow?.getValue(columns[3].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <TextField
              key={columns[4].accessorKey}
              label={columns[4].header}
              name={columns[4].accessorKey}
              defaultValue={personRow?.getValue(columns[4].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
              <TextField
              key={columns[5].accessorKey}
              label={columns[5].header}
              name={columns[5].accessorKey}
              defaultValue={personRow?.getValue(columns[5].accessorKey ?? '')}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <GrmDatePicker
              label={columns[7].header}
              initValue={personRow?.getValue(columns[7].accessorKey ?? '') ?? null}
              disabled={personRow?.getValue(columns[7].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[7].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[8].header}
              initValue={personRow?.getValue(columns[8].accessorKey ?? '') ?? null}
              disabled={personRow?.getValue(columns[8].accessorKey ?? '')}
              onChange={(newVal) =>
                setValues({ ...values, [columns[8].accessorKey as string]: newVal })
              }
            />
          
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="success" onClick={handleSubmit} variant="contained">
          {(personRow?.getValue(columns[0].accessorKey ?? '') && 'Изменить') as string || 'Добавить'}
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
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
const validateAge = (vote: number) => vote >= 18 && vote <= 50;

export default PersonVmTable;
