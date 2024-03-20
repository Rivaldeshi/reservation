import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';



export interface Reservation {
    id: number;
    idAppartement: number,
    debutPeriode: number,
    finPeriode: number,
    statut: number,
    code: string
}


export function useCreateReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (Reservation: Reservation) => {
            try {
                // Make a POST request to the API endpoint
                await axios.post('http://localhost:8080/Locapart/resources/reservation', Reservation);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newReservationInfo: Reservation) => {
            queryClient.setQueryData(
                ['Reservations'],
                (prevReservations: any) =>
                    [
                        ...prevReservations,
                        {
                            ...newReservationInfo,
                            id: prevReservations.reduce((max: number, Reservation: { id: number; }) => (Reservation.id > max ? Reservation.id : max), 0) + 1,
                        },
                    ] as Reservation[],
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['Reservations'] }),

    });
}


export function useGetReservations() {
    return useQuery<Reservation[]>({
        queryKey: ['Reservations'],
        queryFn: async () => {
            try {
                // Make a GET request to the API endpoint
                const response = await axios.get('http://localhost:8080/Locapart/resources/reservation');
                // Assuming the response contains an array of Reservations
                return response.data;
            } catch (error) {
                // Handle errors if needed
                throw new Error('Failed to fetch Reservations');
            }
        },
        refetchOnWindowFocus: false,
    });
}


export function useUpdateReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (Reservation: Reservation) => {
            try {
                // Make a POST request to the API endpoint
                await axios.put('http://localhost:8080/Locapart/resources/reservation', Reservation);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newReservationInfo: Reservation) => {
            queryClient.setQueryData(
                ['Reservations'],
                (prevReservations: any) =>
                    prevReservations?.map((prevReservation: Reservation) =>
                        prevReservation.id === newReservationInfo.id ? newReservationInfo : prevReservation,
                    ),
            );
        },

    });
}



export function useDeleteReservation() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ReservationId: string) => {
            //send api update request here
            try {
                fetch('http://localhost:8080/Locapart/resources/reservation/3', {
                    method: "DELETE"
                }).then(() => {
                    Promise.resolve()
                }).catch((error) => {
                    Promise.reject(error)
                })
                //const a = await axios.delete('http://localhost:8080/Locapart/resources/Reservation/3');
                //   console.log(a);
                return Promise.resolve();
            } catch (error) {
                console.log(error)
                Promise.reject(error)
            }
        },

        //client side optimistic update
        onMutate: (ReservationId: string) => {
            queryClient.setQueryData(['Reservations'], (prevReservations: any) =>
                prevReservations?.filter((Reservation: Reservation) => Reservation.id !== parseInt(ReservationId)),
            );
        },
        //  onSettled: () => queryClient.invalidateQueries({ queryKey: ['Reservations'] }), //refetch Reservations after mutation, disabled for demo
    });
}
