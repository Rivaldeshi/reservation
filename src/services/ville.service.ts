import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';



export interface Ville {
    id: number;
    nom: string;
}


export function useCreateVille() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (Ville: Ville) => {
            try {
                // Make a POST request to the API endpoint
                await axios.post('http://localhost:8080/Locapart/resources/ville', Ville);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newVilleInfo: Ville) => {
            queryClient.setQueryData(
                ['Villes'],
                (prevVilles: any) =>
                    [
                        ...prevVilles,
                        {
                            ...newVilleInfo,
                            id: prevVilles.reduce((max: number, Ville: { id: number; }) => (Ville.id > max ? Ville.id : max), 0) + 1,
                        },
                    ] as Ville[],
            );
        },

    });
}


export function useGetVilles() {
    return useQuery<Ville[]>({
        queryKey: ['Villes'],
        queryFn: async () => {
            try {
                // Make a GET request to the API endpoint
                const response = await axios.get('http://localhost:8080/Locapart/resources/ville');
                // Assuming the response contains an array of Villes
                return response.data;
            } catch (error) {
                // Handle errors if needed
                throw new Error('Failed to fetch Villes');
            }
        },
        refetchOnWindowFocus: false,
    });
}


export function useUpdateVille() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (Ville: Ville) => {
            try {
                // Make a POST request to the API endpoint
                await axios.put('http://localhost:8080/Locapart/resources/ville', Ville);
                return Promise.resolve();
            } catch (error) {
                console.error(error)
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Client side optimistic update
        onMutate: (newVilleInfo: Ville) => {
            queryClient.setQueryData(
                ['Villes'],
                (prevVilles: any) =>
                    prevVilles?.map((prevVille: Ville) =>
                        prevVille.id === newVilleInfo.id ? newVilleInfo : prevVille,
                    ),
            );
        },

    });
}




export function useDeleteVille() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (villeId: number) => {
            try {
                // Make a DELETE request to the API endpoint
                await axios.get(`http://localhost:8080/Locapart/resources/ville/delete/${villeId}`);
                return Promise.resolve();
            } catch (error) {
                console.error(error);
                // Handle errors if needed
                return Promise.reject(error);
            }
        },
        // Optimistic update
        onMutate: (villeId: number) => {
            queryClient.setQueryData(['Villes'], (prevVilles: Ville[] | undefined) =>
                prevVilles?.filter((ville: Ville) => ville.id !== villeId),
            );
        },
    });
}

