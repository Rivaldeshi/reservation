import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Reservation, useCreateReservation, useDeleteReservation, useGetReservations, useUpdateReservation } from '../services/reservation.service';
import axios from 'axios';
import { useGetApartments } from '../services/appartement.service';


const ReservationPage = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});


  const { data: fetchedApartments = [], isError: isLoadingApartmentsError, isFetching: isFetchingApartments, isLoading: isLoadingApartments, } = useGetApartments();
  //call CREATE hook
  const { mutateAsync: createReservation, isPending: isCreatingReservation } = useCreateReservation();

  //call READ hook
  const { data: fetchedReservations = [], isError: isLoadingReservationsError, isFetching: isFetchingReservations, isLoading: isLoadingReservations, } = useGetReservations();
  //call UPDATE hook

  const { mutateAsync: updateReservation, isPending: isUpdatingReservation } = useUpdateReservation();
  //call DELETE hook
  const { mutateAsync: deleteReservation, isPending: isDeletingReservation } = useDeleteReservation();


  const columns = useMemo<MRT_ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'code',
        header: 'Code',
        enableEditing: false,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.code,
          helperText: validationErrors?.code,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              code: undefined,
            }),
        },
      },
      {
        accessorKey: 'debutPeriode',
        header: 'debut Periode',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.debutPeriode,
          helperText: validationErrors?.debutPeriode,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              debutPeriode: undefined,
            }),
        },
      },
      {
        accessorKey: 'finPeriode',
        header: 'fin Periode',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.finPeriode,
          helperText: validationErrors?.finPeriode,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              finPeriode: undefined,
            }),
        },
      },
      {
        accessorKey: 'idAppartement',
        header: 'Appartement',
        accessorFn: (row) => fetchedApartments.find(appart => appart.id === row.idAppartement)?.nom,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.idAppartement,
          helperText: validationErrors?.idAppartement,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              idAppartement: undefined,
            }),
        },
        editVariant: 'select',
        editSelectOptions: fetchedApartments.map((elem) => {
          return elem.nom
        }),
      },

      {
        accessorKey: 'statut',
        header: 'statut',
        accessorFn: (row) => row.statut === 0 ? 'ACTIVE' : 'UNACTIVE',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.statut,
          helperText: validationErrors?.statut,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              statut: undefined,
            }),
        },
        editVariant: 'select',
        editSelectOptions: ['ACTIVE', 'UNACTIVE'],
      },
    ],
    [fetchedApartments, validationErrors],
  );


  //CREATE action
  const handleCreateReservation: MRT_TableOptions<Reservation>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateReservation(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    values.idAppartement = fetchedApartments.find(appart => appart.nom === values.idAppartement)?.id
    values.statut = values.statut === 'ACTIVE' ? 0 : -1;
    try {
      await createReservation(values);
      table.setCreatingRow(null);

    } catch (error) {
      console.log(error)
    }

  };

  //UPDATE action
  const handleSaveReservation: MRT_TableOptions<Reservation>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateReservation(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    values.statut = values.statut === 'ACTIVE' ? 0 : -1;
    values.idAppartement = fetchedApartments.find(appart => appart.nom === values.idAppartement)?.id
    try {
      await updateReservation(values);
      table.setEditingRow(null);
    } catch (error) {
      console.log(error)
    }
  };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Reservation>) => {
    if (window.confirm('Are you sure you want to delete this Reservation?')) {
      deleteReservation(row.original.id + "")
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedReservations,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id + "",
    muiToolbarAlertBannerProps: isLoadingReservationsError
      ? {
        color: 'error',
        children: 'Error loading data',
      }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },

    initialState: {
      showGlobalFilter: true,
      columnPinning: {
        right: ['mrt-row-actions'],
      }
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateReservation,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveReservation,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create New Reservation</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Reservation</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New Reservation
      </Button>
    ),
    state: {
      isLoading: isLoadingReservations,
      // isSaving: isCreatingReservation || isUpdatingReservation || isDeletingReservation,
      showAlertBanner: isLoadingReservationsError,
      showProgressBars: isFetchingReservations,
    },
  });

  return <MaterialReactTable table={table} />;
};


export default ReservationPage;

const validateRequired = (value: string) => !!value.length;

function validateReservation(Reservation: Reservation) {
  return {
    debutPeriode: !validateRequired(Reservation.debutPeriode + "") ? 'debutPeriode is Required' : '',
    finPeriode: !validateRequired(Reservation.finPeriode + "") ? 'finPeriode is Required' : '',
    idAppartement: !validateRequired(Reservation.idAppartement ? Reservation.idAppartement + "" : '') ? 'Appartement is Required' : '',
  };
}
