import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { useNavigate } from 'react-router-dom';


export const MainListItems: React.FC = () => {

    const navigate = useNavigate();
    return (
        <React.Fragment>
            <ListItemButton onClick={() => navigate('/')}>
                <ListItemIcon>
                    <ApartmentIcon />
                </ListItemIcon>
                <ListItemText primary="Appartement" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate('ville')}>
                <ListItemIcon>
                    <LocationCityIcon />
                </ListItemIcon>
                <ListItemText primary="Ville" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('reservation')}>
                <ListItemIcon>
                    <BookOnlineIcon />
                </ListItemIcon>
                <ListItemText primary="Reservation" />
            </ListItemButton>

        </React.Fragment>
    )
}