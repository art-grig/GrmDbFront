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
import { Certification, CertificationResponseVm, Client, Insurance, LegalEntityVm, PersonVm } from '../apiClients';

import { ddmmyyyy, getDateColumnConfig } from '../utils';

import { GrmDatePicker } from './Persons';
import { table } from 'console';
import { id } from 'date-fns/locale';

import "../Styles/style.css"

import logoEmail from '../images/envelope-fill.svg';
import logoPhone from '../images/telephone-fill.svg';
import { GetApiClient } from '../Utils/config';



const LegalEntityDetails: React.FC = () => {
  const [legalEntity, setLegalEntity] = useState<LegalEntityVm>();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState(false);
  const [createOrUpdateModalOpenIns, setCreateOrUpdateModalOpenIns] = useState(false);
  const { legalEntityId } = useParams();
  const apiClient = GetApiClient();
  const [validationErrors, setValidationErrors] = useState<{
    [cellId: string]: string;
  }>({});
  const [editLegalEntitiesRowCert, setEditLegalEntitiesRowCert] = useState<MRT_Row<Certification> | undefined>(undefined);
  const [editLegalEntitiesRowInsurance, setEditLegalEntitiesRowInsurance] = useState<MRT_Row<Insurance> | undefined>(undefined);
  const [tableData, setTableData] = useState<LegalEntityVm[]>([]);

  // Fetch Details
  useEffect(() => {
    const fetchDetails = async () => {
      const apiResp = await Promise.all([
        apiClient.legalEntityGET2(+(legalEntityId ?? 0)),
        apiClient.byLegalEntityId(+(legalEntityId ?? 0)),
        apiClient.byLegalEntityId2(+(legalEntityId ?? 0))]);

      setLegalEntity(apiResp[0].data);
      setCertifications(apiResp[1].data ?? []);
      setInsurance(apiResp[2].data ?? [])
    };
    fetchDetails();
  }, []);


  // CRUD CERTIFICATION

  const handleCreateOrUpdateNewRowCert = async (model: Certification) => {
    model.id = model.id ?? 0;
    model.legalEntityId = legalEntity?.id;
    const createLegalEntityResp = await apiClient.certificationPOST(model);
    const newLegalEntityCert = createLegalEntityResp.data;
    if (model.id) {
      setCertifications(certifications.map(i => i.id === model.id ? model : i));
    }
    if (model.id === 0 && newLegalEntityCert) {
      setCertifications([...[newLegalEntityCert!].concat(certifications)]);
    }
  };

  const handleSaveRowEdits: MaterialReactTableProps<Certification>['onEditingRowSave'] =
    async ({ exitEditingMode, row, values }) => {
      if (!Object.keys(validationErrors).length) {
        certifications[row.index] = values;
        await apiClient.certificationPOST(certifications[row.index]);
        setCertifications([...certifications]);
        exitEditingMode(); //required to exit editing mode and close modal
      }
    };

  const editRowSertifaction = (row: MRT_Row<Certification>) => {
    setEditLegalEntitiesRowCert(row);
    setCreateOrUpdateModalOpen(true);
  }
  

  const handleDeleteRowCert = useCallback(
    async (row: MRT_Row<Certification>) => {
      if (
        !window.confirm(`Вы уверены, что хотите удалить ${row.getValue<number>('id')}`)
      ) {
        return;
      }

      await apiClient.certificationDELETE(row.getValue<number>('id'));

      certifications.splice(row.index, 1);
      setCertifications([...certifications]);
    },
    [certifications],
  );

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const disableEditing = (row: MRT_Row<Certification>, cell: MRT_Cell<Certification>) => {
    const disableFieldsList = ['startDate', 'endDate'];
    console.log(cell.column.id);
    if (disableFieldsList.includes(cell.column.id) && cell.getValue<Date | undefined>()) {
      return true;
    }


    return false;
  }
  // ^ CERT MODAL

  // CRUD INSURANCE

  const handleCreateOrUpdateNewRowIns = async (model: Insurance) => {
    model.id = model.id ?? 0;
    model.legalEntityId = legalEntity?.id;
    const createLegalEntityRespIns = await apiClient.insurancePOST(model);
    const newLegalEntityIns = createLegalEntityRespIns.data;
    if (model.id) {
      setInsurance(insurance.map(i => i.id === model.id ? model : i));
    }
    if (model.id === 0 && newLegalEntityIns) {
      setInsurance([...[newLegalEntityIns!].concat(insurance)]);
    }
  };

  const handleSaveRowEditsIns: MaterialReactTableProps<Insurance>['onEditingRowSave'] =
  async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      insurance[row.index] = values;
      await apiClient.insurancePOST(insurance[row.index]);
      setInsurance([...insurance]);
      exitEditingMode(); //required to exit editing mode and close modal
    }
  };
  

  const editRowInsurance = (row: MRT_Row<Insurance>) => {
    setEditLegalEntitiesRowInsurance(row);
    setCreateOrUpdateModalOpenIns(true);
  }

  const handleDeleteRowIns = useCallback(
    async (row: MRT_Row<Insurance>) => {
      if (
        !window.confirm(`Вы уверены, что хотите удалить ${row.getValue<number>('id')}`)
      ) {
        return;
      }

      await apiClient.insuranceDELETE(row.getValue<number>('id'));

      insurance.splice(row.index, 1);
      setInsurance([...insurance]);
    },
    [insurance],
  );

  const disableEditingIns = (row: MRT_Row<Insurance>, cell: MRT_Cell<Insurance>) => {
    const disableFieldsList = ['startDate', 'endDate'];
    console.log(cell.column.id);
    if (disableFieldsList.includes(cell.column.id) && cell.getValue<Date | undefined>()) {
      return true;
    }


    return false;
  }

  // COLUMNS 
  
  const columns = useMemo<MRT_ColumnDef<Certification>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 20,
        enableEditing: false,
      },
      getDateColumnConfig('startDate', 'Начало.'),
      getDateColumnConfig('endDate', 'Конец.', <i style={{ color: '#9c0b18' }}>Конец.</i>),
      {
        accessorKey: 'number',
        header: 'Номер',
        size: 20,
        enableEditing: false,
      },

    ],
    []
  );

  const columnsATT = useMemo<MRT_ColumnDef<Insurance>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        size: 20,
        enableEditing: false,
      },
      getDateColumnConfig('startDate', 'Начало.'),
      getDateColumnConfig('endDate', 'Конец.', <i style={{ color: '#9c0b18' }}>Конец.</i>),
      getDateColumnConfig('createdOn', 'Дата Создани.'),
      getDateColumnConfig('modifiedOn', 'Дата Изменении.', <i style={{ color: '#0f1942' }}>Дата Изменении.</i>),

    ],
    []
  );

  console.log("this table date", editLegalEntitiesRowCert);
  return (
    <>
      <><div className='detailsForm'>
        <h1>Название компании  <p>{legalEntity?.name}</p> </h1>
        <h1 >Почта <img src={logoEmail} alt="email" /><p>{legalEntity?.email}</p> </h1>
        <h1>Номер Телефона <img src={logoPhone} alt="phone" /><p >{legalEntity?.phoneNumber}</p></h1>
      </div>
      </>
      <><div className="certificaton">
        <h2>Сертефикация</h2>
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
          data={certifications}
          editingMode="modal" //default
          enableColumnOrdering
          enableEditing
          onEditingRowSave={handleSaveRowEdits}
          onEditingRowCancel={handleCancelRowEdits}
          localization={MRT_Localization_RU}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: "flex", gap: "12px" }}>
              <Tooltip arrow placement="left" title="Изменить">
                <IconButton onClick={() => editRowSertifaction(row)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip arrow placement="right" title="Удалить">
                <IconButton color="error" onClick={() => handleDeleteRowCert(row)}>
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
        <CreateNewCertModal
          columns={columns}
          open={createOrUpdateModalOpen}
          onClose={() => { setEditLegalEntitiesRowInsurance(undefined); setCreateOrUpdateModalOpen(false); }}
          onSubmit={handleCreateOrUpdateNewRowCert}
          legalEntitiesRowCert={editLegalEntitiesRowCert}
        />

      </div></>
      <div className="insurance">
        <h2>Страховка</h2>
        <MaterialReactTable
          displayColumnDefOptions={{
            'mrt-row-actions': {
              muiTableHeadCellProps: {
                align: 'center',
              },
              size: 120,
            },
          }}
          columns={columnsATT}
          data={insurance}
          editingMode="modal" //default
          enableColumnOrdering
          enableEditing
          // onEditingRowSave={handleSaveRowEdits}
          // onEditingRowCancel={handleCancelRowEdits}
          localization={MRT_Localization_RU}   
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: "flex", gap: "12px" }}>
              <Tooltip arrow placement="left" title="Изменить">
                <IconButton onClick={() => editRowInsurance(row)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip arrow placement="right" title="Удалить">
                <IconButton color="error" onClick={() => handleDeleteRowIns(row)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          renderTopToolbarCustomActions={() => (
            <Button
              color="success"
              onClick={() => setCreateOrUpdateModalOpenIns(true)}
              variant="contained"
            >
              Добавить
            </Button>
          )}
        />
        <CreateNewInsModal
          columns={columnsATT}
          open={createOrUpdateModalOpenIns}
          onClose={() => { setEditLegalEntitiesRowInsurance(undefined); setCreateOrUpdateModalOpenIns(false); }}
          onSubmit={handleCreateOrUpdateNewRowIns}
          legalEntitiesRowInsurance={editLegalEntitiesRowInsurance}
        />
      </div>

    </>



  );
}



export const CreateNewCertModal: FC<{
  columns: MRT_ColumnDef<Certification>[];
  onClose: () => void;
  onSubmit: (values: Certification) => void;
  open: boolean;
  legalEntitiesRowCert?: MRT_Row<Certification>;
}> = ({ open, columns, onClose, onSubmit, legalEntitiesRowCert }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = legalEntitiesRowCert?.getValue(column.accessorKey ?? '');
      return acc;
    }, {} as any)
  );

  useEffect(() => {
    setValues(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = legalEntitiesRowCert?.getValue(column.accessorKey ?? '');
        return acc;
      }, {} as any));

  }, [legalEntitiesRowCert]);


  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{(legalEntitiesRowCert && 'Редактирование Сертефикации') || 'Добавление Сертефикации'}</DialogTitle>
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
            <GrmDatePicker
              label={columns[1].header}
              initValue={legalEntitiesRowCert?.getValue(columns[1].accessorKey ?? '') ?? null}
              onChange={(newVal) =>
                setValues({ ...values, [columns[1].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[2].header}
              initValue={legalEntitiesRowCert?.getValue(columns[2].accessorKey ?? '') ?? null}
              onChange={(newVal) =>
                setValues({ ...values, [columns[2].accessorKey as string]: newVal })
              }
            />
            <TextField
              key={columns[3].accessorKey}
              label={columns[3].header}
              name={columns[3].accessorKey}
              defaultValue={legalEntitiesRowCert?.getValue(columns[3].accessorKey ?? '')}
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
          {(legalEntitiesRowCert?.getValue(columns[0].accessorKey ?? '') && 'Изменить') as string || 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
// ^ CERT Create Modal

// Insurance Create Modal

export const CreateNewInsModal: FC<{
  columns: MRT_ColumnDef<Insurance>[];
  onClose: () => void;
  onSubmit: (values: Insurance) => void;
  open: boolean;
  legalEntitiesRowInsurance?: MRT_Row<Insurance>;
}> = ({ open, columns, onClose, onSubmit, legalEntitiesRowInsurance }) => {
  const [values, setValues] = useState<any>(() =>
    columns.reduce((acc, column) => {
      acc[column.accessorKey ?? ""] = legalEntitiesRowInsurance?.getValue(column.accessorKey ?? '');
      return acc;
    }, {} as any)
  );

  useEffect(() => {
    setValues(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ""] = legalEntitiesRowInsurance?.getValue(column.accessorKey ?? '');
        return acc;
      }, {} as any));

  }, [legalEntitiesRowInsurance]);


  const handleSubmit = () => {
    //put your validation logic here
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogTitle textAlign="center">{(legalEntitiesRowInsurance && 'Редактирование Страховки') || 'Добавление Страховки'}</DialogTitle>
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
            <GrmDatePicker
              label={columns[1].header}
              initValue={legalEntitiesRowInsurance?.getValue(columns[1].accessorKey ?? '') ?? null}
              onChange={(newVal) =>
                setValues({ ...values, [columns[1].accessorKey as string]: newVal })
              }
            />
            <GrmDatePicker
              label={columns[2].header}
              initValue={legalEntitiesRowInsurance?.getValue(columns[2].accessorKey ?? '') ?? null}
              onChange={(newVal) =>
                setValues({ ...values, [columns[2].accessorKey as string]: newVal })
              }
            />
           



          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button color="success" onClick={handleSubmit} variant="contained">
          {(legalEntitiesRowInsurance?.getValue(columns[0].accessorKey ?? '') && 'Изменить') as string || 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};





export default LegalEntityDetails;
