import Client, { IClient } from '../models/Client';
import { ClientDto } from '../dtos/clientDto';

export const createClient = async (clientDto: ClientDto): Promise<IClient> => {
    const client = new Client(clientDto);
    return await client.save();
};

export const getClients = async (): Promise<IClient[]> => {
    return await Client.find();
};

export const getClientById = async (id: string): Promise<IClient | null> => {
    return await Client.findById(id);
};

export const updateClient = async (id: string, clientDto: ClientDto): Promise<IClient | null> => {
    return await Client.findByIdAndUpdate(id, clientDto, { new: true });
};

export const deleteClient = async (id: string): Promise<IClient | null> => {
    return await Client.findByIdAndDelete(id);
};