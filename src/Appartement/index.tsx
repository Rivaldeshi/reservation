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
import { Apartment, useCreateapartment, useDeleteApartment, useGetApartments, useUpdateapartment } from '../services/appartement.service';
import axios from 'axios';
import { useGetVilles } from '../services/ville.service';


const AppartementPage = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  //call CREATE hook
  const { mutateAsync: createApartment, isPending: isCreatingApartment } = useCreateapartment();
  const { data: fetchedVilles = [], isError: isLoadingVillesError, isFetching: isFetchingVilles, isLoading: isLoadingVilles, } = useGetVilles();
  //call READ hook
  const { data: fetchedApartments = [], isError: isLoadingApartmentsError, isFetching: isFetchingApartments, isLoading: isLoadingApartments, } = useGetApartments();
  //call UPDATE hook
  const { mutateAsync: updateApartment, isPending: isUpdatingApartment } = useUpdateapartment();
  //call DELETE hook
  const { mutateAsync: deleteApartment, isPending: isDeletingApartment } = useDeleteApartment();

  const columns = useMemo<MRT_ColumnDef<Apartment>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'nom',
        header: 'Nom',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.nom,
          helperText: validationErrors?.nom,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nom: undefined,
            }),
        },
      },

      {
        accessorKey: 'adresse',
        header: 'Adresse',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.adresse,
          helperText: validationErrors?.adresse,
          //remove any previous validation errors when Apartment focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              adresse: undefined,
            }),
        },
      },
      {
        accessorKey: 'codePostal',
        header: 'Code Postal',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.codePostal,
          helperText: validationErrors?.codePostal,
          //remove any previous validation errors when Apartment focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              codePostal: undefined,
            }),
        },
      },
      {
        accessorKey: 'idVille',
        header: 'Ville',
        accessorFn: (row) => fetchedVilles.find(ville => ville.id === row.idVille)?.nom,
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.idVille,
          helperText: validationErrors?.idVille,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              idVille: undefined,
            }),
        },
        editVariant: 'select',
        editSelectOptions: fetchedVilles.map((elem) => {
          return elem.nom
        }),
      },
      {
        accessorKey: 'prix',
        header: 'prix',
        muiEditTextFieldProps: {
          required: true,
          type: 'number',
          error: !!validationErrors?.prix,
          helperText: validationErrors?.prix,
          //remove any previous validation errors when Apartment focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              prix: undefined,
            }),
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.type,
          helperText: validationErrors?.type,
          //remove any previous validation errors when Apartment focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              type: undefined,
            }),
        },
      },
    ],
    [fetchedVilles, validationErrors],
  );


  //CREATE action
  const handleCreateApartment: MRT_TableOptions<Apartment>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateApartment(values);
    console.log(newValidationErrors)
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    values.idVille = fetchedVilles.find(ville => ville.nom === values.idVille)?.id
    try {
      await createApartment(values);
      table.setCreatingRow(null);

    } catch (error) {
      console.log(error)
    }
  };

  //UPDATE action
  const handleSaveApartment: MRT_TableOptions<Apartment>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateApartment(values);
    console.log(values)
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    values.idVille = fetchedVilles.find(ville => ville.nom === values.idVille)?.id

    setValidationErrors({});

    try {

      await updateApartment(values);
      table.setEditingRow(null);
    } catch (error) {
      console.log(error)
    }

    //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Apartment>) => {
    if (window.confirm('Are you sure you want to delete this Apartment?')) {

      deleteApartment(row.original.id + "")
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedApartments,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id + "",
    muiToolbarAlertBannerProps: isLoadingApartmentsError
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
    onCreatingRowSave: handleCreateApartment,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveApartment,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create New Apartment</DialogTitle>
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
        <DialogTitle variant="h3">Edit Apartment</DialogTitle>
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
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New Apartment
      </Button>
    ),
    state: {
      isLoading: isLoadingApartments,
      // isSaving: isCreatingApartment || isUpdatingApartment || isDeletingApartment,
      showAlertBanner: isLoadingApartmentsError,
      showProgressBars: isFetchingApartments,
    },
  });

  return <MaterialReactTable table={table} />;
};


export default AppartementPage;

const validateRequired = (value: string) => !!value.length;

function validateApartment(Apartment: Apartment) {
  return {
    nom: !validateRequired(Apartment.nom) ? ' Nom is Required' : '',
    adresse: !validateRequired(Apartment.adresse) ? 'adresse is Required' : '',
    prix: !validateRequired(Apartment.prix + "") ? 'prix is required' : '',
    idVille: !validateRequired(Apartment.idVille ? Apartment.idVille + '' : '') ? 'ville is required' : '',
  };
}
