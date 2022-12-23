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

const PersonVmTable: FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState<PersonVm[]>([]);
  const [legalEntitiesMap, setLegalEntitiesMap] = useState<Map<string | undefined, LegalEntityVm>>(new Map());
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});

  const apiClient = new Client("http://localhost:5200");

  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
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

  const handleCreateNewRow = async (model: PersonVm) => {
    model.id = 0;
    model.legalEntityId = legalEntitiesMap.get(model.legalEntityName)?.id;
    const createPersonResp = await apiClient.employeePOST(model);
    const newPerson = createPersonResp.data;
    if (newPerson) {
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

  const getCommonEditTextFieldProps = useCallback(
    (
      cell: MRT_Cell<PersonVm>
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
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: "legalEntityName",
        header: "Компания",
        muiTableBodyCellEditTextFieldProps: ({ row }) => { 
          return {
            children: Array.from(legalEntitiesMap.values()).map((le) => (
              <MenuItem key={le.name} value={le.name}>
                {le.name}
              </MenuItem>
            )),
            select: true,
          }
        },
      },
      {
        accessorKey: "name",
        header: "Имя",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: "surname",
        header: "Фамилия",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        accessorKey: "patronymic",
        header: "Отчество",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
      {
        id: 'createdOn',
        accessorFn: (r) => r.createdOn?.toLocaleDateString(),
        header: "Дата создания",
        size: 140,
        enableEditing: false,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
        Header: <i style={{ color: '#005d62' }}>Дата создания</i>,
      },
      {
        accessorKey: "attStartDate",
        header: "Начало Атестации",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'date',
        }),   
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#00a48a' }}>Начало Атестации</i>,
      },
      {
        accessorKey: "attEndDate",
        header: "Конец Атестации",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'date',
        }),
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(),
        Header: <i style={{ color: '#6a0e17' }}>Конец Атестации</i>,
      },
      {
        accessorKey: "inn",
        header: "ИНН",
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
    ],
    [getCommonEditTextFieldProps, legalEntitiesMap]
  );

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
      <CreatePersonModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
        legalEntitiesMap={legalEntitiesMap}
      />
    </>
  );
};

//example of creating a mui dialog modal for creating new rows
export const CreatePersonModal: FC<{
  columns: MRT_ColumnDef<PersonVm>[];
  onClose: () => void;
  onSubmit: (values: PersonVm) => void;
  legalEntitiesMap: Map<string | undefined, LegalEntityVm>,
  open: boolean;
}> = ({ legalEntitiesMap, open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = "";
      return acc;
    }, {} as any)
  );

  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();

  };

  return (
      <Dialog  open={open}>
      <DialogTitle textAlign="center">Добавление Физ. Лица</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "400px" },
              gap: "1.5rem",
            }}
          >
            <br/>
            <TextField
              key={columns[1].accessorKey}
              label={columns[1].header}
              name={columns[1].accessorKey}
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
            <> <p className="startAtt"> Начало Атестации </p> </>
            <TextField
              key={columns[6].accessorKey}   
              name={columns[6].accessorKey}
              type='date'
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
            <> <p className="endAtt">Конец Атестации </p></>
            <TextField
              key={columns[7].accessorKey}
              name={columns[7].accessorKey}
              type='date'
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
              <TextField
              key={columns[8].accessorKey}
              label={columns[8].header}
              name={columns[8].accessorKey}
              onChange={(e) =>
                setValues({ ...values, [e.target.name]: e.target.value })
              }
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
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
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
const validateAge = (vote: number) => vote >= 18 && vote <= 50;

export default PersonVmTable;
