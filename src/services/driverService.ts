import Driver, { IDriver } from '../models/Driver';
import { DriverDto } from '../dtos/driverDto';

export const createDriver = async (driverDto: DriverDto): Promise<IDriver> => {
    const driver = new Driver(driverDto);
    return await driver.save();
};

export const getDrivers = async (
    page: number = 1,
    limit: number = 50,
    search?: string
): Promise<{
    drivers: IDriver[];
    total: number;
    pages: number;
    currentPage: number;
}> => {
    return await Driver.paginateDrivers(page, limit, search);
};

export const getDriverById = async (id: string): Promise<IDriver | null> => {
    return await Driver.findById(id);
};

export const updateDriver = async (id: string, driverDto: DriverDto): Promise<IDriver | null> => {
    return await Driver.findByIdAndUpdate(id, driverDto, { new: true });
};

export const deleteDriver = async (id: string): Promise<IDriver | null> => {
    return await Driver.findByIdAndDelete(id);
};

export const searchDrivers = async (query: string): Promise<IDriver[]> => {
    return Driver.find({
        $or: [
            { name: new RegExp(query, 'i') },
            { phoneNumber: new RegExp(query, 'i') },
            { email: new RegExp(query, 'i') }
        ]
    });
};