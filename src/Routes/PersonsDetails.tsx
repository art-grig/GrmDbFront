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
import { useParams } from "react-router-dom";
import { ddmmyyyy, getDateColumnConfig } from '../utils';
import { Attestation, Client, PersonVm } from '../apiClients';
import { CreateNewInsModal } from './LegalEntityDetails';
import { GrmDatePicker } from './Persons';
import "../Styles/style.css"


const PersonDetails: React.FC = () => {
    const [employee, setEmployee] = useState<PersonVm>();
    const [attestation, setAttestation] = useState<Attestation[]>([]);
    const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState(false);
    const { employeeId } = useParams();
    const apiClient = new Client('http://localhost:5200');
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});
    const [editEmployeeRow, setEditEmployeeRow] = useState<MRT_Row<Attestation> | undefined>(undefined);
    const [tableData, setTableData] = useState<PersonVm[]>([]);

    // Fetch Details
    useEffect(() => {
        const fetchDetails = async () => {
            const apiRespEmployee = await Promise.all([
                apiClient.employeeGET2(+(employeeId ?? 0)),
                apiClient.byEmployeeId(+(employeeId ?? 0))]);

            setEmployee(apiRespEmployee[0].data);
            setAttestation(apiRespEmployee[1].data ?? []);
        };
        fetchDetails();
    }, []);


    // CRUD ATTESTAION

    const handleCreateOrUpdateNewRowAtt = async (model: Attestation) => {
        model.id = model.id ?? 0;
        model.employeeId = employee?.id;
        const createEmployeeAttResp = await apiClient.attestationPOST(model);
        const newEmployeeAtt = createEmployeeAttResp.data;
        if (model.id) {
            setAttestation(attestation.map(i => i.id === model.id ? model : i));
        }
        if (model.id === 0 && newEmployeeAtt) {
            setAttestation([...[newEmployeeAtt!].concat(attestation)]);
        }
    };

    const handleSaveRowEdits: MaterialReactTableProps<Attestation>['onEditingRowSave'] =
        async ({ exitEditingMode, row, values }) => {
            if (!Object.keys(validationErrors).length) {
                attestation[row.index] = values;
                await apiClient.attestationPOST(attestation[row.index]);
                setAttestation([...attestation]);
                exitEditingMode(); //required to exit editing mode and close modal
            }
        };

    const editRowAtt = (row: MRT_Row<Attestation>) => {
        setEditEmployeeRow(row);
        setCreateOrUpdateModalOpen(true);
    }

    const handleDeleteRowAtt = useCallback(
        async (row: MRT_Row<Attestation>) => {
            if (
                !window.confirm(`Вы уверены, что хотите удалить ${row.getValue<number>('id')}`)
            ) {
                return;
            }

            await apiClient.attestationDELETE(row.getValue<number>('id'));

            attestation.splice(row.index, 1);
            setAttestation([...attestation]);
        },
        [attestation],
    );


    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const disableEditing = (row: MRT_Row<Attestation>, cell: MRT_Cell<Attestation>) => {
        const disableFieldsList = ['startDate', 'endDate'];
        console.log(cell.column.id);
        if (disableFieldsList.includes(cell.column.id) && cell.getValue<Date | undefined>()) {
            return true;
        }


        return false;
    }




    const getAttestationTypeStr = (num: number): string | null => {
        switch (num) {
            case 0:
                return "Агент";
            case 1:
                return "Брокер";
            case 1:
                return "Специалист";
        };

        return null;
    }

    // ^ ATT MODAL
    // COLUMNS
    const columns = useMemo<MRT_ColumnDef<Attestation>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                size: 20,
                enableEditing: false,
            },
            {
                accessorKey: 'attestationType',
                header: 'Тип Аттестации',
                size: 20,
                Cell: ({ cell }) => getAttestationTypeStr(cell.getValue<number>()),
            },
            getDateColumnConfig('startDate', 'Начало.'),
            getDateColumnConfig('endDate', 'Конец.', <i style={{ color: '#9c0b18' }}>Конец.</i>),
        ],
        []
    );

    return (
        <>
            <><div className='detailsForm'>
                <h1>Имя  <p>{employee?.name}</p> </h1>
                <h1 >Фамилия <p>{employee?.surname}</p> </h1>
                <h1>Отчество <p >{employee?.patronymic}</p></h1>
                <h1>ИНН <p >{employee?.inn}</p></h1>
            </div>
            </>
            <><div className="attestation">
                <h2>Атестация</h2>
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
                    data={attestation}
                    editingMode="modal" //default
                    enableColumnOrdering
                    enableEditing
                    onEditingRowSave={handleSaveRowEdits}
                    onEditingRowCancel={handleCancelRowEdits}
                    localization={MRT_Localization_RU}
                    renderRowActions={({ row, table }) => (
                        <Box sx={{ display: "flex", gap: "12px" }}>
                            <Tooltip arrow placement="left" title="Изменить">
                                <IconButton onClick={() => editRowAtt(row)}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip arrow placement="right" title="Удалить">
                                <IconButton color="error" onClick={() => handleDeleteRowAtt(row)}>
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
                <CreateNewAttModal
                    columns={columns}
                    open={createOrUpdateModalOpen}
                    onClose={() => { setEditEmployeeRow(undefined); setCreateOrUpdateModalOpen(false); }}
                    onSubmit={handleCreateOrUpdateNewRowAtt}
                    employeeRowAtt={editEmployeeRow}
                />

            </div></>

        </>



    );
}
export const CreateNewAttModal: FC<{
    columns: MRT_ColumnDef<Attestation>[];
    onClose: () => void;
    onSubmit: (values: Attestation) => void;
    open: boolean;
    employeeRowAtt?: MRT_Row<Attestation>;
}> = ({ open, columns, onClose, onSubmit, employeeRowAtt }) => {
    const [values, setValues] = useState<any>(() =>
        columns.reduce((acc, column) => {
            acc[column.accessorKey ?? ""] = employeeRowAtt?.getValue(column.accessorKey ?? '');
            return acc;
        }, {} as any)
    );

    useEffect(() => {
        setValues(() =>
            columns.reduce((acc, column) => {
                acc[column.accessorKey ?? ""] = employeeRowAtt?.getValue(column.accessorKey ?? '');
                return acc;
            }, {} as any));

    }, [employeeRowAtt]);


    const handleSubmit = () => {
        //put your validation logic here
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">{(employeeRowAtt && 'Редактирование Аттестации') || 'Добавление Аттестации'}</DialogTitle>
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
                            defaultValue={employeeRowAtt?.getValue(columns[1].accessorKey ?? '')}
                            select
                            children={[
                                (<MenuItem key={0} value={0}>
                                    {'Агент'}
                                </MenuItem>),
                                (<MenuItem key={1} value={1}>
                                    {'Брокер'}
                                </MenuItem>),
                                (<MenuItem key={2} value={2}>
                                    {'Специалист'}
                                </MenuItem>),]}
                            onChange={(e) =>
                                setValues({ ...values, [e.target.name]: e.target.value })
                            }
                        />
                        <GrmDatePicker
                            label={columns[2].header}
                            initValue={employeeRowAtt?.getValue(columns[2].accessorKey ?? '') ?? null}
                            onChange={(newVal) =>
                                setValues({ ...values, [columns[2].accessorKey as string]: newVal })
                            }
                        />
                        <GrmDatePicker
                            label={columns[3].header}
                            initValue={employeeRowAtt?.getValue(columns[3].accessorKey ?? '') ?? null}
                            onChange={(newVal) =>
                                setValues({ ...values, [columns[3].accessorKey as string]: newVal })
                            }
                        />

                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onClose}>Отмена</Button>
                <Button color="success" onClick={handleSubmit} variant="contained">
                    {(employeeRowAtt?.getValue(columns[0].accessorKey ?? '') && 'Изменить') as string || 'Добавить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PersonDetails;