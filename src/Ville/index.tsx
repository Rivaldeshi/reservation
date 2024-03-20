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
import { Ville, useCreateVille, useDeleteVille, useGetVilles, useUpdateVille } from '../services/ville.service';
import axios from 'axios';


const VillePage = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Ville>[]>(
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
    ],
    [validationErrors],
  );

  //call CREATE hook
  const { mutateAsync: createVille, isPending: isCreatingVille } = useCreateVille();

  //call READ hook
  const { data: fetchedVilles = [], isError: isLoadingVillesError, isFetching: isFetchingVilles, isLoading: isLoadingVilles, } = useGetVilles();
  //call UPDATE hook
  const { mutateAsync: updateVille, isPending: isUpdatingVille } = useUpdateVille();
  //call DELETE hook
  const { mutateAsync: deleteVille, isPending: isDeletingVille } = useDeleteVille();

  //CREATE action
  const handleCreateVille: MRT_TableOptions<Ville>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateVille(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createVille(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveVille: MRT_TableOptions<Ville>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateVille(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateVille(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Ville>) => {
    if (window.confirm('Are you sure you want to delete this Ville?')) {
      deleteVille(row.original.id)

    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedVilles,
    createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
    editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id + "",
    muiToolbarAlertBannerProps: isLoadingVillesError
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
    onCreatingRowSave: handleCreateVille,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveVille,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6">Create New Ville</DialogTitle>
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
        <DialogTitle variant="h3">Edit Ville</DialogTitle>
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
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New Ville
      </Button>
    ),
    state: {
      isLoading: isLoadingVilles,
      // isSaving: isCreatingVille || isUpdatingVille || isDeletingVille,
      showAlertBanner: isLoadingVillesError,
      showProgressBars: isFetchingVilles,
    },
  });

  return <MaterialReactTable table={table} />;
};


export default VillePage;

const validateRequired = (value: string) => !!value.length;

function validateVille(Ville: Ville) {
  return {
    nom: !validateRequired(Ville.nom) ? 'First Name is Required' : '',
  };
}
