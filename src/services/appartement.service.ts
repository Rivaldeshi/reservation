import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';



export interface Apartment {
    id: number;
    idVille: number;
    prix: number;
    type: string;
    codePostal: string;
    adresse: string;
    nom: string;
}


export function useCreateapartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (apartment: Apartment) => {
            try {
                // Make a POST request to the API endpoint
                await axios.post('http://localhost:8080/Locapart/resources/appartement', apartment);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newApartmentInfo: Apartment) => {
            queryClient.setQueryData(
                ['apartments'],
                (prevapartments: any) =>
                    [
                        ...prevapartments,
                        {

                            ...newApartmentInfo,
                            id: prevapartments.reduce((max: number, apartment: { id: number; }) => (apartment.id > max ? apartment.id : max), 0) + 1,
                        },
                    ] as Apartment[],
            );
        },

    });
}




export function useGetApartments() {
    return useQuery<Apartment[]>({
        queryKey: ['apartments'],
        queryFn: async () => {
            try {
                // Make a GET request to the API endpoint
                const response = await axios.get('http://localhost:8080/Locapart/resources/appartement');
                // Assuming the response contains an array of apartments
                return response.data;
            } catch (error) {
                // Handle errors if needed
                throw new Error('Failed to fetch apartments');
            }
        },
        refetchOnWindowFocus: false,
    });
}


export function useUpdateapartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (apartment: Apartment) => {
            try {
                // Make a POST request to the API endpoint
                await axios.put('http://localhost:8080/Locapart/resources/appartement', apartment);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newApartmentInfo: Apartment) => {
            queryClient.setQueryData(
                ['apartments'],
                (prevapartments: any) =>
                    prevapartments?.map((prevapartment: Apartment) =>
                        prevapartment.id === newApartmentInfo.id ? newApartmentInfo : prevapartment,
                    ),
            );
        },
    });
}


export function useDeleteApartment() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (apartmentId: string) => {
            //send api update request here
            try {
                await axios.get('http://localhost:8080/Locapart/resources/appartement/delete/'+apartmentId);
                return Promise.resolve();
            } catch (error) {
                console.log(error)
                Promise.reject(error)
            }
        },

        //client side optimistic update
        onMutate: (apartmentId: string) => {
            queryClient.setQueryData(['apartments'], (prevapartments: any) =>
                prevapartments?.filter((apartment: Apartment) => apartment.id !== parseInt(apartmentId)),
            );
        },
        //  onSettled: () => queryClient.invalidateQueries({ queryKey: ['apartments'] }), //refetch apartments after mutation, disabled for demo
    });
}
