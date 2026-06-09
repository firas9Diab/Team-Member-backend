import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

const addressSelect = {
  id: true,
  name: true,
  country: true,
  flatHouseBuilding: true,
  mobileNumber: true,
  alternativeMobileNumber: true,
  pincode: true,
  city: true,
  state: true,
  isDefault: true,
} as const;

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
      select: addressSelect,
    });
  }

  async create(userId: number, dto: CreateAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          name: dto.name,
          country: dto.country,
          flatHouseBuilding: dto.flatHouseBuilding,
          mobileNumber: dto.mobileNumber,
          alternativeMobileNumber: dto.alternativeMobileNumber,
          pincode: dto.pincode,
          city: dto.city,
          state: dto.state,
          isDefault: dto.isDefault ?? false,
        },
        select: addressSelect,
      });
    });
  }

  async update(userId: number, id: number, dto: UpdateAddressDto) {
    await this.ensureOwnership(userId, id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id },
        data: {
          name: dto.name,
          country: dto.country,
          flatHouseBuilding: dto.flatHouseBuilding,
          mobileNumber: dto.mobileNumber,
          alternativeMobileNumber: dto.alternativeMobileNumber,
          pincode: dto.pincode,
          city: dto.city,
          state: dto.state,
          isDefault: dto.isDefault,
        },
        select: addressSelect,
      });
    });
  }

  async remove(userId: number, id: number) {
    await this.ensureOwnership(userId, id);
    await this.prisma.address.delete({ where: { id } });
    return null;
  }

  private async ensureOwnership(userId: number, id: number) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }
}
