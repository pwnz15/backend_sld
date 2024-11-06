import { Request, Response } from 'express';
import { createClient, getClients, getClientById, updateClient, deleteClient } from '../services/clientService';
import { ClientDto } from '../dtos/clientDto';
import Client from '../models/Client'; // Add this line to


// Create a new client
export const createClientHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const clientDto: ClientDto = req.body;
        const client = await createClient(clientDto);
        res.status(201).json(client);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Get all clients
export const getClientsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = req.query.search as string;

        const result = await Client.paginateClients(page, limit, search);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

// Get a single client by ID
export const getClientByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await getClientById(req.params.id);
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.status(200).json(client);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Update a client
export const updateClientHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const clientDto: ClientDto = req.body;
        const client = await updateClient(req.params.id, clientDto);
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.status(200).json(client);
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};

// Delete a client
export const deleteClientHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await deleteClient(req.params.id);
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.status(200).json({ message: 'Client deleted' });
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
};